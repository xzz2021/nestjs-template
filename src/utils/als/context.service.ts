// context.service.ts  —— 在任意地方读取上下文
import { Inject, Injectable } from '@nestjs/common';
import { ALS, RequestContext } from './async-context.provider';
import { AsyncLocalStorage } from 'node:async_hooks';
@Injectable()
export class ContextService {
  constructor(@Inject(ALS) private readonly als: AsyncLocalStorage<RequestContext>) {}
  get() {
    return this.als.getStore();
  }
  getReqId() {
    return this.get()?.reqId;
  }
  getTenantId() {
    return this.get()?.tenantId;
  }
  set<K extends keyof RequestContext>(key: K, val: RequestContext[K]) {
    const s = this.get();
    if (s) (s as any)[key] = val;
  }
}

/*
使用示例
// logger.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ContextService } from './context.service';

@Injectable()
export class AppLogger {
  private readonly base = new Logger('App');
  constructor(private readonly ctx: ContextService) {}
  log(message: string, meta?: Record<string, any>) {
    const reqId = this.ctx.getReqId() ?? 'no-req';
    this.base.log(JSON.stringify({ reqId, message, ...meta }));
  }
}



// 任意控制器/服务
@Injectable()
export class UserService {
  constructor(private readonly log: AppLogger) {}
  async doWork() {
    this.log.log('start work');
    await new Promise(r => setTimeout(r, 50)); // 模拟异步
    this.log.log('done');
  }
}


*/
