import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '@/processor/decorator';
import { TokenService } from '@/table/auth/token.service';
// import { Request } from 'express';

//    ==============重要=============
// NotAcceptableException  406  此异常码专门用于短token过期提示  ??  废弃

//   配合   JwtStrategy 使用   JwtStrategy  注入到module里
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private readonly tokenService: TokenService,
  ) {
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
    const ok = (await super.canActivate(context)) as boolean;

    if (!ok) return false;
    const user = request.user;
    // console.log('🚀 ~ JwtAuthGuard ~ canActivate ~ user:', user);
    const userId = user?.sub as number;
    const jti = user?.jti as string;

    if (!userId || !jti) {
      throw new UnauthorizedException('Invalid token payload'); // NOT_ACCEPTABLE
    }

    // 1) 黑名单校验：被撤销/踢下线的会话直接 401
    if (await this.tokenService.isBlacklisted(jti)) {
      throw new UnauthorizedException('Token 已失效');
    }

    // 2) 仍在该用户的会话列表中（避免已被逐出的旧会话继续访问）
    const list = await this.tokenService.listSessions(userId);
    // console.log('xzz2021: JwtAuthGuard -> canActivate -> list:', list);
    // console.log('xzz2021: JwtAuthGuard -> canActivate -> jti:', jti);
    if (!list.includes(jti)) {
      throw new UnauthorizedException('token not active');
    }

    return true;
  }

  /**
   * 自定义处理 JWT 验证通过后的逻辑
   * 自动挂载任意新数据到  @Request 上
   * 主动失效token  直接抛出异常
   */
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // if (err || !user) {
    //   throw err || new UnauthorizedException('Token 无效或未提供');
    // }

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

  /*
  // 自定义 自行校验
   validateRequest(request: Request): Promise<boolean> {
    if (!request.headers['authorization']) {
      throw new UnauthorizedException(`失败(missing jwt token)`);
    }

    const parts = request.headers['authorization'].trim().split(' ');
    // 从 header 上获取校验信息

    if (parts.length !== 2) {
      throw new UnauthorizedException('失败(error jwt token)');
    }

    const [scheme, token] = parts;

    if (/^Bearer$/i.test(scheme)) {
      try {
        //jwt.verify方法验证token是否有效
        this.jwtService.verify(token, {
          complete: true,
        });
        // 用户鉴权信息，注入上下文
        const d: any = this.jwtService.decode(token);
        request.user = {
          id: d.id || '',
          avatar: '',
          more: null,
          name: '',
          nickname: '',
        };
      } catch (error) {
        throw new AuthException(`失败(${error.message})`);
      }
      return true;
    } else {
      throw new AuthException('失败(error jwt scheme)');
    }
  }
    */
}
