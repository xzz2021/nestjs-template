// context-init.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject } from '@nestjs/common';
import { Observable } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { ALS, RequestContext } from './async-context.provider';
import { AsyncLocalStorage } from 'node:async_hooks';

@Injectable()
export class ContextInitInterceptor implements NestInterceptor {
  constructor(@Inject(ALS) private readonly als: AsyncLocalStorage<RequestContext>) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    // 兼容 HTTP / RPC / GraphQL：优先拿 HTTP 的 req
    const http = ctx.switchToHttp();
    const req = http.getRequest?.();
    const reqId = req?.headers?.['x-request-id'] || uuid();
    const userId = req?.user?.id; // e.g. Passport 之后
    const tenantId = req?.headers?.['x-tenant-id'];

    const store: RequestContext = { reqId: String(reqId), userId, tenantId };
    return this.als.run(store, () => next.handle());
  }
}
