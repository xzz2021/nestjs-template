import { Module } from '@nestjs/common';
import { SseController } from './sse.controller';
import { SseService } from './sse.service';
import { SseStrategy } from './sse.strategy';

@Module({
  controllers: [SseController],
  providers: [SseService, SseStrategy],
  exports: [SseService],
})
export class SseModule {}
