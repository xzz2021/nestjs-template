import { Injectable } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CronJob } from 'cron';
@Injectable()
export class ScheduleService {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    @InjectQueue('xzztest') private queue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  create(_createScheduleDto: any) {
    console.log('xzz2021: ScheduleService -> create -> 执行');
    // const log = await this.mongo.logs.create({
    //   data: {
    //     level: 'info',
    //     message: 'test',
    //     context: 'test',
    //   },
    // });
    // console.log('xzz2021: ScheduleService -> create -> log:', log);
    return 'This action adds a new schedule';
  }

  /*
  @Interval(10000) @Interval('notifications', 2500)  // 每10秒执行一次
  @Timeout(5000)   @Timeout('notifications', 2500)  // 5秒后执行一次
  @Cron('45 * * * * *', {name: 'xzztest', timeZone: 'Asia/Shanghai',waitForCompletion: true  })  该方法每分钟运行一次，在 45 秒处执行。  循环执行
    * * * * * *
    | | | | | |
    | | | | | day of week
    | | | | months
    | | | day of month
    | | hours
    | minutes
    seconds (optional)
  */

  // @Cron(CronExpression.EVERY_5_SECONDS) // 定时执行   @nestjs/schedule
  cleanupFiles() {
    console.log('xzz2021: CleanupService -> cleanupFiles -> 执行');
  }

  // 动态添加 Cron 任务
  addCronJob(name: string, seconds: number) {
    const job = new CronJob(`${seconds} * * * * *`, () => {});
    this.schedulerRegistry.addCronJob(name, job);
    job.start();
  }

  // 删除 Cron 任务
  deleteCronJob(name: string) {
    this.schedulerRegistry.deleteCronJob(name);
  }

  // 获取所有任务
  getCronJobs() {
    const jobs = this.schedulerRegistry.getCronJobs();
    jobs.forEach((_value, key) => {
      console.log(`任务名称: ${key}`);
    });
  }

  // @Cron(CronExpression.EVERY_MINUTE)
  async testBull() {
    console.log('🚀 ~ ScheduleService ~ testBull ~ testBull:');
    await this.queue.add('xzztest', { aaa: 'xzztest' }); // 添加任务
  }

  // @Cron(CronExpression.EVERY_10_SECONDS)
  backupDb() {
    console.log('xzz2021: ScheduleService -> backupDb -> 执行');
  }
}
