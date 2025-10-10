import { Public } from '@/processor/decorator';
import { SseAuthGuard } from '@/processor/guard';
import { BeforeApplicationShutdown, Controller, Headers, Ip, Param, ParseIntPipe, Req, Res, Sse, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { interval, Observable } from 'rxjs';
import { MessageEvent, SseService } from './sse.service';
@ApiTags('sse通知')
@SkipThrottle()
@Public()
@Controller('sse')
export class SseController implements BeforeApplicationShutdown {
  private replyMap: Map<number, Response> = new Map();

  constructor(private readonly sseService: SseService) {}

  private closeAllConnect() {
    this.sseService.sendToAllUser({
      type: 'close',
      data: 'bye~',
    });
    this.replyMap.forEach(reply => {
      reply.end();
    });
  }

  // 通过控制台关闭程序时触发
  beforeApplicationShutdown() {
    this.closeAllConnect();
  }

  @ApiOperation({ summary: '服务端推送消息' })
  @Sse(':uid')
  @UseGuards(SseAuthGuard)
  async sse(
    @Param('uid', ParseIntPipe) uid: number,
    @Req() req: Request,
    @Res() res: Response,
    @Ip() ip: string,
    @Headers('user-agent') ua: string,
  ): Promise<Observable<MessageEvent>> {
    // console.log('🚀 ~ SseController ~ sse ~ uid:', uid);
    this.replyMap.set(uid, res);
    await this.sseService.addOnlineUser(uid, ip, ua);

    return new Observable(subscriber => {
      // 定时推送，保持连接
      const subscription = interval(12000).subscribe(() => {
        subscriber.next({ type: 'ping' });
      });
      // console.log(`user-${uid}已连接`)
      this.sseService.addClient(uid, subscriber);

      // 当客户端断开连接时
      req.on('close', () => {
        subscription.unsubscribe();
        this.sseService.removeClient(uid, subscriber);
        this.replyMap.delete(uid);
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.sseService.removeOnlineUser(uid);
        // console.log(`user-${uid}已关闭`);
      });
    });
  }
}
