import { Controller, Post, Body } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('定时任务')
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  @ApiOperation({ summary: '创建定时任务' })
  create(@Body() createScheduleDto: any) {
    return this.scheduleService.create(createScheduleDto);
  }
}
