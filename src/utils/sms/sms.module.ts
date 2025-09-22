import { Module } from '@nestjs/common';
// import { AliSmsService } from './sms.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule], // 显式导入（即使是全局）
  // providers: [AliSmsService],
  // exports: [AliSmsService],
})
export class SmsModule {}
