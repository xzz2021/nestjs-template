// jwt-refresh-auth.guard.ts
import { RtTokenService } from '@/table/auth/rt.token.service';
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

//  局部接口使用
@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard('jwt-refresh') {
  constructor(private readonly rtTokenService: RtTokenService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 允许对 `/public/` 开头的资源访问
    if (request.url.startsWith('/public/')) {
      return true;
    }

    const ok = (await super.canActivate(context)) as boolean;

    if (ok) return true;
    const user = request.user;
    const userId = user?.id as number;
    const jti = user?.jti as string;
    console.log('xzz2021: JwtRefreshAuthGuard -> canActivate -> user:', user);
    if (!userId || !jti) {
      throw new UnauthorizedException('rt Invalid token payload');
    }

    // 1) 黑名单校验：被撤销/踢下线的会话直接 401
    if (await this.rtTokenService.isBlacklisted(jti)) {
      throw new UnauthorizedException('rtToken 已失效');
    }

    // 2) 仍在该用户的会话列表中（避免已被逐出的旧会话继续访问）
    const list = await this.rtTokenService.listSessions(userId);
    // console.log('xzz2021: JwtRefreshAuthGuard -> canActivate -> list:', list);

    if (!list.includes(jti)) {
      throw new UnauthorizedException('rt token not active');
    }

    return true;
  }
}
