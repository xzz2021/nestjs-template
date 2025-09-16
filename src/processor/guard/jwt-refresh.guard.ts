// jwt-refresh-auth.guard.ts
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RtTokenService } from '@/auth/rt.token.service';

//  局部接口使用
@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard('jwt-refresh') {
  constructor(private readonly rtTokenService: RtTokenService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 允许对 `/static/` 开头的资源访问
    if (request.url.startsWith('/static/')) {
      return true;
    }

    const ok = (await super.canActivate(context)) as boolean;

    if (!ok) return false;
    const user = request.user;
    const userId = user?.id as number;
    const jti = user?.jti as string;

    if (!userId || !jti) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // 1) 黑名单校验：被撤销/踢下线的会话直接 401
    if (await this.rtTokenService.isBlacklisted(jti)) {
      throw new UnauthorizedException('rtToken 已失效');
    }

    // 2) 仍在该用户的会话列表中（避免已被逐出的旧会话继续访问）
    const list = await this.rtTokenService.listSessions(userId);

    if (!list.includes(jti)) {
      throw new UnauthorizedException('rt token not active');
    }

    return true;
  }
}
