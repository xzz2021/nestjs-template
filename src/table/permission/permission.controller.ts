import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreatePermissionDto, UpdatePermissionDto, BatchPermissionDto } from './dto/permission.dto';

@ApiTags('权限')
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post('add')
  @ApiOperation({ summary: '创建权限' })
  create(@Body() createPermissionListDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionListDto);
  }

  @Post('batchCreate')
  @ApiOperation({ summary: '批量创建权限' })
  batchCreate(@Body() obj: BatchPermissionDto) {
    return this.permissionService.batchCreate(obj);
  }

  @Post('update')
  @ApiOperation({ summary: '更新权限' })
  update(@Body() updatePermissionListDto: UpdatePermissionDto) {
    return this.permissionService.update(updatePermissionListDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除权限' })
  remove(@Param('id') id: number) {
    return this.permissionService.remove(id);
  }
}
