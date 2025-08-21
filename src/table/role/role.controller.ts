import { Body, Controller, Delete, Get, Param, Post, Query, Request } from '@nestjs/common';
import { RoleService } from './role.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IQueryParams } from '@/processor/utils/queryBuilder';
import { TransformKeyPipe } from 'src/processor/pipe/validater';
@ApiTags('角色')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('getRoleList')
  @ApiOperation({ summary: '获取角色列表' })
  findAll(@Query() joinQueryParams: IQueryParams) {
    return this.roleService.getRoleList(joinQueryParams);
  }

  @Post('add')
  @ApiOperation({ summary: '创建角色' })
  create(@Body() createRoleDto: RoleDTO) {
    return this.roleService.createRoleWithMenusAndPermissions2(createRoleDto);
  }

  @Post('update')
  @ApiOperation({ summary: '更新角色' })
  update(@Body(new TransformKeyPipe('remark')) updateRoleDto: UpdateRoleDTO) {
    return this.roleService.update(updateRoleDto);
  }

  // 用户登录瞬间  根据token获取用户信息  获取菜单 以及 权限  进行 去重合并
  //  此处有严重bug  如果返回数据不规则 前端会出现404 且无法清空数据重新登录  前端要优化
  @Get('getRoleMenu')
  @ApiOperation({ summary: '获取角色菜单' })
  getMenu(@Request() req: any) {
    return this.roleService.findRoleMenu(+req?.user?.id);
  }

  @Get('getMenuByRoleId')
  @ApiOperation({ summary: '获取指定角色菜单' })
  getMenuByRoleId(@Query('id') id: string) {
    // console.log('xzz2021: RoleController -> getMenu -> req.user', req.user);
    return this.roleService.getMenuByRoleId(+id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除角色' })
  remove(@Param('id') id: string) {
    return this.roleService.remove(+id);
  }
}
