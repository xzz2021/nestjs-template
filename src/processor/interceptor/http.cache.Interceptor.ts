import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';

//  只缓存get请求
@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();

    // 只缓存 GET 请求
    if (request.method !== 'GET') {
      return undefined; // 不缓存
    }

    // 使用默认的 key 生成逻辑
    return super.trackBy(context);
  }
}
