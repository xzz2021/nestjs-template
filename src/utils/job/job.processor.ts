import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Job } from 'bullmq';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { AddJobDto, AddJobLogDto } from './dto/req-job.dto';
import { JobService } from './job.service';
const JOB_BULL_KEY = 'admin_bull_job';

@Processor(JOB_BULL_KEY)
export class JobConsumer extends WorkerHost {
  constructor(
    private jobService: JobService,
    private readonly moduleRef: ModuleRef,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    super();
  }

  async process(job: Job) {
    const { serviceName, funName, argumens } = await this.jobService.analysisinvokeTarget(job.data as AddJobDto);

    const service = this.moduleRef.get(this.jobService.ico[serviceName], { strict: false });
    if (job.data.concurrent == '0') {
      try {
        // 允许并发。  如果允许并发将无法捕获任务错误，任务全部为成功。
        service[funName](...argumens);
      } catch (error) {
        console.info(`可并发任务执行失败了,任务id:${job.id},任务名称:${job.name},任务数据:${JSON.stringify(job.data)}`);
      }
    } else if (job.data.concurrent == '1') {
      //禁止并发
      await service[funName](...argumens);
    }
  }

  @OnWorkerEvent('completed')
  /* 记录成功日志 */
  async onCompleted(job: Job) {
    const jobLog = new AddJobLogDto();
    const oneJob = job.data;
    jobLog.jobName = oneJob.jobName;
    jobLog.jobGroup = oneJob.jobGroup;
    jobLog.invokeTarget = oneJob.invokeTarget;
    jobLog.jobMessage = '执行成功';
    jobLog.status = '0';
    jobLog.createTime = new Date();
    await this.jobService.addJobLog(jobLog);
  }
  @OnWorkerEvent('failed')
  /* 记录失败日志 */
  async onFailed(job: Job, err: Error) {
    const jobLog = new AddJobLogDto();
    const oneJob = job.data;
    jobLog.jobName = oneJob.jobName;
    jobLog.jobGroup = oneJob.jobGroup;
    jobLog.invokeTarget = oneJob.invokeTarget;
    jobLog.jobMessage = '执行失败了';
    jobLog.exceptionInfo = err.message;
    jobLog.status = '1';
    jobLog.createTime = new Date();
    await this.jobService.addJobLog(jobLog);
  }
}
