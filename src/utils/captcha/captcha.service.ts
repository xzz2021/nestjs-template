import { Injectable } from '@nestjs/common';
import * as SvgCaptcha from 'svg-captcha';
import { CaptchaGenerateResult } from './captcha.module-definition';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CaptchaService {
  private readonly redis: Redis;

  constructor(private readonly redisService: RedisService) {
    this.redis = this.redisService.getOrThrow();
  }
  async getMathExpr(): Promise<CaptchaGenerateResult> {
    const id = uuidv4();

    const res = SvgCaptcha.createMathExpr({
      mathMax: 100,
      mathMin: -100,
    });
    //写入redis存储
    await this.redis.set(`captchaId:${id}`, res.text, 'EX', 5 * 60);

    const svg = res.data.replaceAll('"', "'");
    return {
      id,
      svg,
    };
  }

  async getCommon(): Promise<CaptchaGenerateResult> {
    const id = uuidv4();
    const { data, text } = SvgCaptcha.create({
      // height: 25,
      color: true,
    });
    //写入redis存储
    await this.redis.set(`captchaId:${id}`, text, 'EX', 5 * 60);
    //写入redis存储
    const svg = data.replaceAll('"', "'");
    return {
      id,
      svg,
    };
  }

  async verify(id: string, text: string): Promise<boolean> {
    if (!text) {
      return false;
    }
    const res = await this.redis.get(`captchaId:${id}`);
    if (!res) {
      return false;
    }
    const ok = res === text;
    if (ok) {
      await this.redis.del(`captchaId:${id}`);
    }
    return ok;
  }
}
