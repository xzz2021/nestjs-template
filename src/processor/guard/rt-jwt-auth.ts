import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '@/processor/decorator';

// 用于全局 配合 短token 拦截
@Injectable()
export class RtJwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // console.log('xzz2021: JwtAuthGuard -> canActivate:', request);
    // 允许对 `/public/` 开头的资源访问
    if (request.url.startsWith('/public/')) {
      return true;
    }
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    // 先跑 JWT 校验（签名/过期/解析 payload）
    if (isPublic) {
      return true;
    }
    return (await super.canActivate(context)) as boolean;
  }
}
