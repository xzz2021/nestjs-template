import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

//
//  需要在全局 模块   生命周期 中 处理 成功和 失败的  任务   进行retry 或者 移除   否则会有冗余数据在 redis 数据库中
@Processor('xzztest') // 此处名字 对应其他服务里的@InjectQueue('xzztest')
// @Injectable()
export class ScheduleConsumer extends WorkerHost {
  //  constructor(private readonly mailService: MailService) {}

  // job.name名字 对应queue.add()方法里传递的name
  async process(job: Job) {
    switch (job.name) {
      case 'test':
        await this.processTest(job);
        break;
      default:
        break;
    }
  }

  async processTest(job: Job) {
    let progress = 0;
    while (progress < 10) {
      console.log('🚀 ~ ScheduleConsumer ~ process ~ progress:', progress);
      progress++;
      await job.updateProgress(progress);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    return {};
  }
}

/*
监听多个任务类型
有return 则判定执行成功 否则 判定执行失败
 
@Processor('email')
export class EmailProcessor {
  @Process('welcome')
  async handleWelcome(job: Job) {
    console.log('Welcome Email:', job.data);
  }

  @Process('reset-password')
  async handleResetPassword(job: Job) {
    console.log('Reset Email:', job.data);
  }
}



*/
