import { Public } from '@/processor/decorator';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IpToAddressService } from './ip-to-address.service';
import { ServerService } from './server.service';
@ApiTags('工具库')
@Controller('utils')
export class UtilsController {
  constructor(
    private readonly serverService: ServerService,
    private readonly ipToAddressService: IpToAddressService,
  ) {}

  @Get('serverInfo')
  @ApiOperation({ summary: '获取角色菜单及权限列表,用于展示及分配' })
  findAll() {
    return this.serverService.getServerInfo();
  }

  @Public()
  @Get('ipToAddress')
  @ApiOperation({ summary: '获取ip地址' })
  ipToAddress(@Query('ip') ip: string) {
    return this.ipToAddressService.getAddress(ip);
  }
}
