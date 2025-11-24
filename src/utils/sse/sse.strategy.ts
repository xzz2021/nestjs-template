import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class SseStrategy extends PassportStrategy(Strategy, 'sse') {
  constructor(readonly configService: ConfigService) {
    super({
      // jwtFromRequest: ExtractJwt.fromUrlQueryParameter('token'),
      jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => req?.cookies?.rt || null]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('token.refreshSecret') as string,
    });
  }

  validate(payload: any) {
    return payload;
  }
}
