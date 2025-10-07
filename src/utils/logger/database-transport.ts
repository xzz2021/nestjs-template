import { PrismaService as pgService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

// 自定义数据库传输器
@Injectable()
class DatabaseTransport {
  constructor(
    private readonly pgService: pgService,
    private readonly level: string,
  ) {}
  log(_info: any, _callback?: (error?: Error) => void): void {
    // setImmediate(() => this.emit('logged', info));
    // 使用 Prisma 客户端将日志写入数据库
    // this.pgService.logs.create({
    //   data: {
    //     level: info.level,
    //     message: info.message,
    //     timestamp: new Date(info.timestamp),
    //   },
    // });
  }
}

export { DatabaseTransport };
