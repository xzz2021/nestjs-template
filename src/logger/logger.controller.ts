import { Controller, Delete, Get, Query, Body } from '@nestjs/common';
import { LogService } from './logger.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DeleteLogDto, LogListResDto, QueryLogParams } from './dto/logger.dto';
import { Serialize } from '@/processor/decorator/serialize';

@ApiTags('日志')
@Controller('log')
export class LoggerController {
  constructor(private readonly loggerService: LogService) {}

  @Get('getUserOperationLogList')
  @ApiOperation({ summary: '获取用户操作日志列表' })
  @Serialize(LogListResDto)
  @ApiResponse({ type: LogListResDto, isArray: true })
  getUserOperationLogList(@Query() params: QueryLogParams) {
    //  启用缓存后   相同请求 会直接跳过这里的控制器
    // console.log('xzz2021: UtilController -> logList -> joinQueryParams', joinQueryParams);
    return this.loggerService.getUserOperationLogList(params);
  }

  @Delete('deleteUserOperationLog')
  @ApiOperation({ summary: '删除用户操作日志' })
  deleteUserOperationLog(@Body() obj: DeleteLogDto) {
    return this.loggerService.deleteUserOperationLog(obj);
  }
}
