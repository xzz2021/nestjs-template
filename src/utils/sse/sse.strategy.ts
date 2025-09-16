import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class SseStrategy extends PassportStrategy(Strategy, 'sse') {
  constructor(readonly configService: ConfigService) {
    super({
      // jwtFromRequest: ExtractJwt.fromUrlQueryParameter('token'),
      jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => req?.cookies?.rt || null]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
    });
  }

  validate(payload: any) {
    return payload;
  }
}
