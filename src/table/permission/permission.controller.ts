import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('权限')
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post('add')
  @ApiOperation({ summary: '创建权限' })
  create(@Body() createPermissionListDto: any) {
    return this.permissionService.create(createPermissionListDto);
  }

  @Post('batchCreate')
  @ApiOperation({ summary: '批量创建权限' })
  batchCreate(@Body() obj: { menuId: number; path: string }) {
    const { menuId, path } = obj;
    if (!menuId || !path) return { code: 400, message: '参数不合法' };
    return this.permissionService.batchCreate(menuId, path);
  }

  @Post('update')
  @ApiOperation({ summary: '更新权限' })
  update(@Body() updatePermissionListDto: any) {
    return this.permissionService.update(updatePermissionListDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除权限' })
  remove(@Param('id') id: string) {
    return this.permissionService.remove(+id); //  +id是为了将数字id转换为string
  }
}
