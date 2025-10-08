import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServerService } from './server.service';
@ApiTags('工具库')
@Controller('utils')
export class UtilsController {
  constructor(private readonly serverService: ServerService) {}

  @Get('serverInfo')
  @ApiOperation({ summary: '获取角色菜单及权限列表,用于展示及分配' })
  findAll() {
    return this.serverService.getServerInfo();
  }
}
