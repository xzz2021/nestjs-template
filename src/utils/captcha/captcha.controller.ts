import { Controller, Get } from '@nestjs/common';
import { CaptchaService } from './captcha.service';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@/processor/decorator/public.decorator';
import { Throttle } from '@nestjs/throttler';
@Controller('captcha')
@Public()
@ApiTags('验证码')
@Throttle({ default: { limit: 10, ttl: 50000 } })
export class CaptchaController {
  constructor(private captchaService: CaptchaService) {}

  /**
   * 字母图形验证码
   */
  @Get('/common')
  async getCaptcha() {
    return await this.captchaService.getCommon();
  }

  /**
   * 数学公式图形验证码
   */
  @Get('/math_expr')
  async getMathExpr() {
    return await this.captchaService.getMathExpr();
  }
}
