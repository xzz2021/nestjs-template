import { RedisService } from '@liaoliaots/nestjs-redis';
import { BadRequestException, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import * as SvgCaptcha from 'svg-captcha';
import { v4 as uuidv4 } from 'uuid';
import { CaptchaGenerateResult } from './captcha.module-definition';

@Injectable()
export class CaptchaService {
  private readonly redis: Redis;

  constructor(private readonly redisService: RedisService) {
    this.redis = this.redisService.getOrThrow();
  }

  async getCommon(): Promise<CaptchaGenerateResult> {
    const id = uuidv4();
    const { data, text } = SvgCaptcha.create({
      // height: 25,
      ignoreChars: '0oO1iIl',
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

  async verify(id: string, text: string): Promise<boolean> {
    if (!text) {
      return false;
    }
    const res = await this.redis.get(`captchaId:${id}`);
    if (!res) {
      // 如果拿不到 说明是过期了
      throw new BadRequestException('验证码已过期');
    }
    const ok = res === text;
    // if (ok) {
    //   // 核对成功不需要删除 因为有可能是密码错误  删除就会导致重新生成验证码   且获取新的会自动覆写
    //   // eslint-disable-next-line @typescript-eslint/no-misused-promises
    //   setTimeout(() => this.redis.del(`captchaId:${id}`), 5 * 60 * 1000);
    // }
    return ok;
  }
}
