//  全局动态限流

import { CanActivate, ExecutionContext, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Reflector } from '@nestjs/core';
import { SKIP_THROTTLE_KEY } from '../decorator/throttle.decorator';
@Injectable()
export class DynamicThrottlerGuard implements CanActivate {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_THROTTLE_KEY, [context.getHandler(), context.getClass()]);

    if (skip) return true;

    const request = context.switchToHttp().getRequest();
    const { id = -1 } = request?.user || {};
    const { body, params, query } = request;
    const mergedParams = { ...query, ...params, ...body };
    //  根据用户身份 请求路径 请求方式 参数 生成一个唯一的key
    const key = `${id}_${request.path}_${request.method}_${JSON.stringify(mergedParams)}`;
    const isLimit = (await this.cacheManager.get(key)) || 0;

    if (isLimit) {
      throw new HttpException('请求过于频繁, 请稍后再试!', HttpStatus.TOO_MANY_REQUESTS);
    }

    const limitTime = 1000;
    // 通过时长缓存 限制 同一类型请求 limitTime内只能请求一次
    // 主要是为了规避 错误代码 重复请求
    await this.cacheManager.set(key, true, limitTime);

    return true;
  }
}
