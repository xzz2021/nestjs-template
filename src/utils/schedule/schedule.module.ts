import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { LogQueueConsumer, ScheduleConsumer } from './consumer';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';

@Global()
@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          // host: configService.get('REDIS_HOST'),
          // port: configService.get('REDIS_PORT'),
          url: configService.get('redis.url'),
        },
      }),
    }),
    //  一个队列就是一个任务分类
    BullModule.registerQueue(
      {
        name: 'log-queue',
        defaultJobOptions: {
          removeOnComplete: true,
        },
      },
      {
        name: 'xzztest',
      },
    ),
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService, ScheduleConsumer, LogQueueConsumer],
  exports: [ScheduleService],
})
export class ScheduleTaskModule {}
