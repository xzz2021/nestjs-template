import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { AddJobDto, JobRunDto } from './dto/req-job.dto';
import { JobService } from './job.service';

@Controller('monitor')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  /* 新增任务 */
  @Post('job')
  async addJob(@Body() addJobDto: AddJobDto) {
    await this.jobService.addJob(addJobDto);
  }

  /* 通过id查询任务 */
  @Get('job/:jobId')
  async oneJob(@Param('jobId') jobId: number) {
    const job = await this.jobService.oneJob(jobId);
    return { data: job };
  }

  /* 执行一次 */
  @Put('job/run')
  async run(@Body() jobRunDto: JobRunDto) {
    await this.jobService.runOne(jobRunDto);
  }

  /* 删除任务 */
  @Delete('job/:jobIds')
  async deleteJob(@Param('jobIds') jobIds: number[]) {
    await this.jobService.deleteJob(jobIds);
  }

  /* 更改任务状态 */
  // @Put('job/changeStatus')
  // async changeStatus(@Body() changStatusDto: ChangStatusDto) {
  //   await this.jobService.changeStatus(changStatusDto);
  // }

  /* 清空任务调度日志 */
  @Delete('jobLog/clean')
  async cleanJobLog() {
    await this.jobService.cleanJobLog();
  }
}
