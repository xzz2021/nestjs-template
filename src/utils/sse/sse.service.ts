import { Injectable } from '@nestjs/common';
import { Subject, Subscriber, throttleTime } from 'rxjs';

import { PgService } from '@/prisma/pg.service';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
export interface MessageEvent {
  data?: string | number | object;
  id?: string;
  type?: 'ping' | 'close' | 'updatePermsAndMenus' | 'updateOnlineUserCount' | 'focusLogOut';
  retry?: number;
}

const clientMap: Map<number, Subscriber<MessageEvent>[]> = new Map();

export const ONLINE_USER_PREFIX = 'online:user:';
const ONLINE_USER_EXPIRE = 60 * 5;

@Injectable()
export class SseService {
  private readonly redis: Redis;
  private updateOnlineUserCount$ = new Subject<void>();
  constructor(
    private readonly redisService: RedisService,
    private readonly pgService: PgService,
  ) {
    this.redis = this.redisService.getOrThrow();
    // same as
    // this.redis = this.redisService.getOrThrow(DEFAULT_REDIS);

    /** 在线用户数量变动时，通知前端实时更新在线用户数量或列表, 3 秒内最多推送一次，避免频繁触发 */
    // 订阅时加节流，3 秒内最多执行一次
    this.updateOnlineUserCount$.pipe(throttleTime(3000, undefined, { leading: true, trailing: true })).subscribe(() => {
      (this.redis as any).keys(ONLINE_USER_PREFIX + '*').then((keys: string[]) => {
        this.sendToAllUser({
          type: 'updateOnlineUserCount',
          data: keys.length,
        });
      });
    });
  }

  addClient(uid: number, subscriber: Subscriber<MessageEvent>) {
    const clients = clientMap.get(uid) || [];
    clientMap.set(uid, clients.concat(subscriber));
  }

  /** 移除与关闭指定端的用户(允许多端登录时的情况) */
  removeClient(uid: number, subscriber: Subscriber<MessageEvent>): void {
    const clients = clientMap.get(uid);
    const targetIndex = clients?.findIndex(client => client === subscriber) ?? -1;
    if (targetIndex !== -1) clients?.splice(targetIndex, 1)?.at(0)?.complete();
  }

  /** 移除与关闭指定用户的连接 */
  removeClients(uid: number): void {
    const clients = clientMap.get(uid);
    clients?.forEach(client => {
      client?.complete();
    });
    clientMap.delete(uid);
  }

  /** 推送给指定用户 */
  sendToClients(uid: number, data: MessageEvent): void {
    const clients = clientMap.get(uid);
    clients?.forEach(client => {
      client?.next?.(data);
    });
  }

  /** 推送给所有用户 */
  sendToAllUser(data: MessageEvent): void {
    clientMap.forEach((client, uid) => {
      this.sendToClients(uid, data);
    });
  }

  /**
   * 通知前端重新获取权限菜单
   * @param uid
   * @constructor
   */
  noticeClientToUpdateMenusByUserIds(uid: number | number[]) {
    const userIds = Array.isArray(uid) ? uid : [uid];
    userIds.forEach(uid => {
      this.sendToClients(uid, { type: 'updatePermsAndMenus' });
    });
  }

  async addOnlineUser(userId: number, ip: string, ua: string) {
    const user = await this.pgService.user.findUnique({
      where: { id: userId },
    });

    if (!user) return;

    const { id, username, phone, lastLoginAt } = user;
    // const exp = ~~(user.exp - Date.now() / 1000);
    // const parser = new UAParser();
    // const uaResult = parser.setUA(ua).getResult();
    // const address = await getIpAddress(ip);

    // const ip = extractIpAddress(ip);
    const result = {
      id,
      ip,
      username,
      phone,
      lastLoginAt,
    };
    // console.log('🚀 ~ SseService ~ addOnlineUser ~ result:', result);
    await this.redis.set(ONLINE_USER_PREFIX + userId, JSON.stringify(result), 'EX', ONLINE_USER_EXPIRE);
    this.updateOnlineUserCount$.next();
  }

  async removeOnlineUser(userId: number) {
    await this.redis.del(ONLINE_USER_PREFIX + userId);
    this.updateOnlineUserCount$.next();
  }
}
