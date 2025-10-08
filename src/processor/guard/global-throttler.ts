// custom-throttler.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RATE_KEY } from '@/processor/decorator';

//  guard 默认以ip作为key 重写guard则会以现有的返回值作为key进行hansh
@Injectable()
export class GlobalThrottlerGuard extends ThrottlerGuard {
  // eslint-disable-next-line @typescript-eslint/require-await
  protected async getTracker(req: any, context?: ExecutionContext): Promise<string> {
    // 1. 优先读取装饰器指定的 key
    if (context) {
      const handlerKey = this.reflector.get<string>(RATE_KEY, context.getHandler());
      if (handlerKey) {
        return `custom:${handlerKey}`;
      }
    }

    // 2. 登录用户
    if (req.user?.id) return `u:${req.user.id}`;

    // 3. API Key
    const apiKey = req.headers['x-api-key'] as string;
    if (apiKey) return `k:${apiKey}`;

    // 4. 未登录：回退到 IP + UA，降低共享IP误伤
    const xff = (req.headers['x-forwarded-for'] as string) || '';
    const reqIp = req?.ips?.length ? req?.ips[0] : req?.ip;
    const ip = (xff.split(',')[0] || '').trim() || reqIp || req.connection?.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || '';
    return `ip:${ip}|ua:${ua}`;
  }
}
