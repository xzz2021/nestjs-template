// src/auth/lockout/lockout.service.ts
import { Injectable, ForbiddenException, Inject } from '@nestjs/common';
import { PgService } from '@/prisma/pg.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

export interface LockoutConfig {
  windowSec: number; // 失败计数窗口
  threshold: number; // 账号维度阈值
  baseLockSec: number; // 初始锁定时长
  maxLockSec: number; // 最大锁定时长
  ipThreshold: number; // IP维度阈值
}

export interface LockoutUser {
  id: number;
  phone: string;
  lockedUntil: Date | null;
  lockLevel?: number | null;
  failedLoginCount?: number | null;
}

function addSeconds(date: Date | number, seconds: number): Date {
  const t = typeof date === 'number' ? date : date.getTime();
  return new Date(t + seconds * 1000);
}

@Injectable()
export class LockoutService {
  constructor(
    private readonly pgService: PgService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // 建议从 ConfigService 注入；此处保留默认值，亦支持构造时覆盖
  private readonly config: LockoutConfig = {
    windowSec: 15 * 60 * 1000,
    threshold: 5,
    baseLockSec: 5 * 60 * 1000,
    maxLockSec: 12 * 60 * 60 * 1000,
    ipThreshold: 20,
  };

  // Redis key helpers
  private failAcctKey(phone: string) {
    return `auth:fail:acct:${phone}`;
  }
  private failIpKey(ip: string) {
    return `auth:fail:ip:${ip}`;
  }
  private lockKey(userId: number) {
    return `auth:lock:${userId}`;
  }

  /**
   * 检查账号是否被锁（Redis 优先，其次 DB）
   * 未通过会直接抛 ForbiddenException
   */
  async ensureNotLocked(user: LockoutUser) {
    const cached = await this.cacheManager.get(this.lockKey(user.id));
    console.log('xzz2021: LockoutService -> cached:', cached);
    if (cached && Number(cached) > Date.now()) {
      throw new ForbiddenException('账号已锁定，请稍后再试');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const ttl = Math.ceil((+user.lockedUntil - Date.now()) / 1000);
      await this.cacheManager.set(this.lockKey(user.id), String(+user.lockedUntil), ttl);
      throw new ForbiddenException('账号已锁定，请稍后再试');
    }
  }

  /**
   * 记录一次失败：账号/IP 计数 +（若存在用户）写入 DB 失败次数
   * 若达到阈值并且用户存在，则执行锁定
   */
  async onFail(phone: string, ip: string, user?: LockoutUser) {
    console.log('xzz2021: LockoutService -> onFail:', phone, ip, user);
    const { windowSec, threshold, ipThreshold } = this.config;

    // 账号维度 - 修复计数逻辑
    const acctKey = this.failAcctKey(phone);
    const acctCnt = ((await this.cacheManager.get(acctKey)) as number) || 0;
    console.log('xzz2021: LockoutService -> acctCnt:', acctCnt);
    const newAcctCnt = acctCnt + 1;
    await this.cacheManager.set(acctKey, newAcctCnt, windowSec);
    console.log('xzz2021: LockoutService -> newAcctCnt:', newAcctCnt);

    // IP维度 - 修复计数逻辑
    const ipKey = this.failIpKey(ip);
    const ipCnt = ((await this.cacheManager.get(ipKey)) as number) || 0;
    const newIpCnt = ipCnt + 1;
    await this.cacheManager.set(ipKey, newIpCnt, windowSec);

    // DB 失败计数
    if (user) {
      await this.pgService.user.update({
        where: { id: user.id },
        data: { failedLoginCount: { increment: 1 } },
      });
    }

    // 触发锁定（仅对存在的用户）- 使用更新后的计数
    if (user && (newAcctCnt >= threshold || newIpCnt >= ipThreshold)) {
      const nextLockSec = Math.min(this.config.baseLockSec * Math.pow(2, user.lockLevel || 0), this.config.maxLockSec);
      const lockedUntil = addSeconds(new Date(), nextLockSec);

      await this.pgService.user.update({
        where: { id: user.id },
        data: { lockedUntil, lockLevel: { increment: 1 } },
      });

      await this.cacheManager.set(this.lockKey(user.id), String(+lockedUntil), nextLockSec);
    }
  }

  /**
   * 登录成功复位：清 Redis 计数/锁；重置 DB 字段
   */
  async onSuccess(phone: string, ip: string, user: LockoutUser) {
    await this.cacheManager.del(this.failAcctKey(phone));
    await this.cacheManager.del(this.failIpKey(ip));
    await this.cacheManager.del(this.lockKey(user.id));

    await this.pgService.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: 0,
        lockLevel: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ip,
      },
    });
  }
}
