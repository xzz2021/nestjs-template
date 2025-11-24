import { SkipThrottle } from '@/processor/decorator';
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@SkipThrottle()
@WebSocketGateway()
export class WsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor() {}

  afterInit(_server: Server) {
    console.log('✨ 🍰 ✨ xzz2021: WsGateway -> afterInit -> server');
  }
  handleConnection(client: Socket, ..._args: any[]) {
    console.log('✨ 🍰 ✨ xzz2021: WsGateway -> handleConnection -> client');
  }

  handleDisconnect(client: Socket) {
    console.log('✨ 🍰 ✨ xzz2021: WsGateway -> handleDisconnect -> client');
  }

  // private getClientQuery(client: Socket): { userId?: number } {
  //   return client?.handshake?.query || {};
  // }

  sendMessageToAll(event: string, message: any) {
    this.server.emit(event, message);
  }

  sendMessageToClient(clientId: string, event: string, message: any) {
    this.server.to(clientId).emit(event, message);
  }

  @SubscribeMessage('test')
  create(@MessageBody() _dd: any) {
    console.log('✨ 🍰 ✨ xzz2021: WsGateway -> constructor -> test');
    return 'test333';
  }

  @SubscribeMessage('findAllWs')
  findAll() {
    console.log('✨ 🍰 ✨ xzz2021: WsGateway -> constructor -> findAllWs');
    return 'findAllWs';
  }

  sendNoticeMsgToAll(event: string, message: any) {
    this.server.emit(event, message);
  }
}
