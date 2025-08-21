import { Module, Global } from '@nestjs/common';
import { WsGateway } from './ws.gateway';

@Global()
@Module({
  providers: [WsGateway],
  exports: [WsGateway],
})
export class WsModule {}

/*



@WebSocketGateway(80, { namespace: 'events', transports: ['websocket']  })   // 监听端口 80 命名空间 events 只允许websocket协议



// 监听事件 events   @MessageBody() 获取客户端发送的数据
@SubscribeMessage('events')  
handleEvent(@MessageBody() data: string): string {
  return 'hello';
}
//  等价于==========
handleEvent(client: Socket, data: string): string {
  return data;
}


异常抛出 使用 throw new WsException('Invalid credentials.');    约等于 HttpException


*/
