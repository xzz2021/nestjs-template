import { Module, Global } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { LogQueueConsumer, ScheduleConsumer } from './consumer';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
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
