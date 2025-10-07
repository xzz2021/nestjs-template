import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CAPTCHA_META_KEY } from '@/processor/decorator';
import { CaptchaService } from '@/utils/captcha/captcha.service';

// 未使用  因为全局开销过大  没必要  单独使用guard实现了
@Injectable()
export class CaptchaInterceptor implements NestInterceptor {
  constructor(
    private readonly captchaService: CaptchaService,
    private readonly reflector: Reflector,
  ) {}
  async intercept(context: ExecutionContext, next: CallHandler) {
    // console.log('CaptchaInterceptor');

    const meta: boolean = this.reflector.get<boolean>(CAPTCHA_META_KEY, context.getHandler());

    if (meta !== true) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const id: string = request.headers['captcha-id'];
    const text: string = request.headers['captcha-text'];
    const passed: boolean = await this.captchaService.verify(id, text);
    if (!passed) {
      throw new BadRequestException('验证码校验未通过');
    }
    return next.handle();
  }
}
