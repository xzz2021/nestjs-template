// src/auth/session/session.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';

export interface SessionConfig {
  ttlSec: number; // token / 会话有效期（秒）
  listTtlSec?: number; // 用户会话列表键的 TTL（秒）
  lockTtlMs?: number; // 互斥锁占用时长（毫秒）
  lockMaxWaitMs?: number; // 获取锁的最大等待时长（毫秒）
}

@Injectable()
export class TokenService {
  private readonly cfg: SessionConfig = {
    ttlSec: 60 * 60, // 1h
    listTtlSec: 2 * 60 * 60, // 2h
    lockTtlMs: 400, // 锁的 TTL
    lockMaxWaitMs: 300, // 最多等待拿锁 300ms
  };
  private maxSessions: number;
  private JWT_SECRET: string;
  constructor(
    private readonly jwt: JwtService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly configService: ConfigService,
  ) {
    const ssoCount = this.configService.get<string>('SSO_COUNT') || '2';
    this.maxSessions = Number(ssoCount);
    this.JWT_SECRET = this.configService.get<string>('JWT_SECRET') || '';
  }

  // —— 注意：不同 store 的 TTL 单位不同。大多数 redis-store 用“秒”，memory-store 用“毫秒”。
  //    根据你的实际 store 改这个开关；也可做成配置注入。
  private readonly TTL_IS_MS = true;

  private sToStoreTtl(sec: number) {
    return this.TTL_IS_MS ? sec * 1000 : sec;
  }
  private msToStoreTtl(ms: number) {
    return this.TTL_IS_MS ? ms : Math.ceil(ms / 1000);
  }

  // —— Key helpers ——
  private listKey(userId: number) {
    return `user:sessions:${userId}`;
  }
  private jtiKey(jti: string) {
    return `session:exp:${jti}`;
  }
  private blKey(jti: string) {
    return `jwt:blacklist:${jti}`;
  }
  private lockKey(userId: number) {
    return `user:sessions:lock:${userId}`;
  }

  // —— 轻量互斥锁（只用 cache-manager 的 get/set/del） ——
  // 1. 操作串行化  2. 减少并发写入导致的覆盖/错删等竞态问题 3. 减少“羊群效应”
  private async withUserListLock<T>(userId: number, fn: () => Promise<T>): Promise<T> {
    const lockKey = this.lockKey(userId);
    const token = randomUUID();
    const ttlMs = this.cfg.lockTtlMs!;
    const maxWait = this.cfg.lockMaxWaitMs!;
    const start = Date.now();

    // 尝试获取锁（尽量减少并发写冲突）
    while (true) {
      const existing = await this.cache.get<string>(lockKey);
      if (!existing) {
        // 没锁 → 设置；cache-manager 不支持 NX，只能“尽快设置+短TTL”
        await this.cache.set(lockKey, token, this.msToStoreTtl(ttlMs));
        // 双检，降低竞争窗口
        const confirm = await this.cache.get<string>(lockKey);
        if (confirm === token) break;
      }
      if (Date.now() - start > maxWait) break; // 超时放弃加锁，直接走非互斥路径（尽力而为）
      await new Promise(r => setTimeout(r, Math.floor(10 + Math.random() * 20))); // 随机抖动
    }

    try {
      const res = await fn();
      return res;
    } finally {
      const v = await this.cache.get<string>(lockKey);
      if (v === token) {
        await this.cache.del(lockKey);
      }
    }
  }

  // 从缓存读取用户会话列表（数组形式）
  private async loadList(userId: number): Promise<string[]> {
    const raw = await this.cache.get<string>(this.listKey(userId));
    if (!raw) return [];
    try {
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }
  // 持久化用户会话列表
  private async saveList(userId: number, list: string[]) {
    const ttl = this.cfg.listTtlSec ? this.sToStoreTtl(this.cfg.listTtlSec) : undefined;
    await this.cache.set(this.listKey(userId), JSON.stringify(list), ttl);
  }

  // —— 对外 API ——

  /** 签发会话（含并发限制/逐出旧会话/黑名单） */
  async issue(userId: number, extraPayload: Record<string, any> = {}) {
    const jti = randomUUID();
    const nowSec = Math.floor(Date.now() / 1000);
    const exp = nowSec + this.cfg.ttlSec;

    const token = await this.jwt.signAsync({ sub: userId, ...extraPayload }, { secret: this.JWT_SECRET, expiresIn: this.cfg.ttlSec, jwtid: jti });

    // 记录 jti 的 exp（撤销时可直接查）
    await this.cache.set(this.jtiKey(jti), String(exp), this.sToStoreTtl(this.cfg.ttlSec));

    // 修改用户的会话列表（尽量加锁，避免并发覆盖）
    await this.withUserListLock(userId, async () => {
      let list = await this.loadList(userId);

      // 新的放前面；去重（如果同 jti 不应出现；保险起见）
      list = [jti, ...list.filter(x => x !== jti)];

      // 超出上限 → 逐出尾部旧会话
      const evicted: string[] = list.length > this.maxSessions ? list.slice(this.maxSessions) : [];
      list = list.slice(0, this.maxSessions);
      await this.saveList(userId, list);

      // 把被逐出的 jti 拉黑
      for (const oldJti of evicted) {
        const expStr = await this.cache.get<string>(this.jtiKey(oldJti));
        const oldExp = expStr ? Number(expStr) : 0;
        await this.blacklistByJti(oldJti, oldExp);
      }
    });

    return { token, jti, exp };
  }

  /** 撤销单个会话 */
  async revoke(userId: number, jti: string) {
    await this.withUserListLock(userId, async () => {
      const list = await this.loadList(userId);
      const newList = list.filter(x => x !== jti);
      if (newList.length !== list.length) {
        await this.saveList(userId, newList);
      }
    });

    const expStr = await this.cache.get<string>(this.jtiKey(jti));
    const exp = expStr ? Number(expStr) : 0;
    await this.blacklistByJti(jti, exp);
  }

  /** 撤销全部会话，或保留某个 jti */
  async revokeAll(userId: number, exceptJti?: string) {
    let toRevoke: string[] = [];
    await this.withUserListLock(userId, async () => {
      const list = await this.loadList(userId);
      toRevoke = exceptJti ? list.filter(x => x !== exceptJti) : list;
      const newList = exceptJti ? [exceptJti] : [];
      await this.saveList(userId, newList);
    });

    for (const jti of toRevoke) {
      const expStr = await this.cache.get<string>(this.jtiKey(jti));
      const exp = expStr ? Number(expStr) : 0;
      await this.blacklistByJti(jti, exp);
    }
  }

  /** jti 是否已拉黑 */
  async isBlacklisted(jti: string): Promise<boolean> {
    const v = await this.cache.get<string>(this.blKey(jti));
    return v === '1';
  }

  /** 拉黑到过期为止（exp 过了就跳过） */
  async blacklistByJti(jti: string, exp: number) {
    const ttlSec = exp - Math.floor(Date.now() / 1000);
    if (ttlSec > 0) {
      await this.cache.set(this.blKey(jti), '1', this.sToStoreTtl(ttlSec));
    }
  }

  /** 获取当前用户会话列表（调试/管理用途） */
  async listSessions(userId: number) {
    return this.loadList(userId);
  }

  //  上面是token主逻辑

  //  以下是操作

  // 登录通过后（账号密码已校验）
  async signToken(userId: number, extraPayload = {}) {
    const { token } = await this.issue(userId, extraPayload);
    return token;
  }

  async logout(userId: number, jti: string) {
    await this.revoke(userId, jti);
    return { ok: true };
  }

  async kickOthers(userId: number, currentJti?: string) {
    await this.revokeAll(userId, currentJti);
    return { ok: true };
  }
}
