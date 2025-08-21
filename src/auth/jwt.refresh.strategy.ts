// jwt-refresh.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'), // 从请求体中取refreshToken
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(req: any, payload: any) {
    const { refreshToken } = req['body'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }
    // 这里可校验refreshToken是否在数据库中有效，略
    return { userId: payload.sub, username: payload.username, refreshToken };
  }
}
