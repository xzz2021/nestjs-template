import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // 此处用于返回需要挂载到 所有走jwtguard的接口中 使用 @Request  req.user  的数据
    const { id, username, phone, roleIds, tokenVersion } = payload;
    const sso = this.configService.get<string>('SSO');
    // console.log('tokenVersion', tokenVersion);
    // console.log('sso', sso);
    // 判断是否开启单点登录
    if (sso == 'true' && tokenVersion) {
      // 从payload解析出tokenVersion 校验 不一致 则说明 token 无效
      const tokenVersionKey = 'tokenVersion_' + phone;
      const tokenVersionCache = await this.cacheManager.get(tokenVersionKey);
      if (tokenVersionCache != tokenVersion) {
        throw new UnauthorizedException('用户已在其他地方登录,tokenVersion 不一致');
      }
    }

    return { id, username, phone, roleIds };
  }
}
