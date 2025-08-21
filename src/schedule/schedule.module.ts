import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleConsumer } from './consumer';
import { ConfigService } from '@nestjs/config';

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
        name: 'xzztest',
        defaultJobOptions: {
          removeOnComplete: true,
        },
      },
      {
        name: 'xzztest2',
      },
    ),
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService, ScheduleConsumer],
})
export class ScheduleTaskModule {}
