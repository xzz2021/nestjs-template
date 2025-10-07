// captcha.guard.ts
import { CanActivate, ExecutionContext, Injectable, BadRequestException } from '@nestjs/common';
import { CaptchaService } from '@/utils/captcha/captcha.service';

@Injectable()
export class CaptchaGuard implements CanActivate {
  constructor(private readonly svc: CaptchaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const { captchaId, captchaText } = req.body || {};
    if (!captchaId || !captchaText) {
      throw new BadRequestException('验证码不能为空');
    }
    const ok: boolean = await this.svc.verify(captchaId as string, captchaText as string);
    if (!ok) {
      throw new BadRequestException('验证码有误');
    }
    return true;
  }
}
