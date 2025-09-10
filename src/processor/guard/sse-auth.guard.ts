import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class SseAuthGuard extends AuthGuard('sse') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ok = (await super.canActivate(context)) as boolean;
    // 2) 现在再读 user 才有值
    const request = context.switchToHttp().getRequest();

    return ok;
  }

  /**
   * 自定义处理 JWT 验证通过后的逻辑
   * 自动挂载任意新数据到  @Request 上
   * 主动失效token  直接抛出异常
   */
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // console.log('[sse guard] handleRequest err=', err, 'info=', info, 'user=', user);
    if (err || !user) {
      throw err || new UnauthorizedException('Token 无效或未提供');
    }

    // ✅ 自定义逻辑：举个例子，禁止被禁用用户访问
    if (user.status === 'banned') {
      throw new UnauthorizedException('用户已被禁用');
    }

    // ✅ 加工 user 对象：可以扩展更多字段或做权限检查
    // user.roles = user.roles || [];
    // user.extra = { checked: true };

    // 可以在此设置给 request 对象
    // const req = context.switchToHttp().getRequest();
    // req.currentUser = user; // 自定义字段，控制器里可通过 req.currentUser 获取

    return user;
  }
}
