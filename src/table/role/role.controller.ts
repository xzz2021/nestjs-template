import { Body, Controller, Delete, Get, Param, Post, Query, Request } from '@nestjs/common';
import { RoleService } from './role.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateRoleDto, IQueryParams, UpdateRoleDto } from './dto/role.dto';
@ApiTags('角色')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('getRoleList')
  @ApiOperation({ summary: '获取角色列表,用于展示及分配权限' })
  findAll(@Query() params: IQueryParams) {
    return this.roleService.getRoleList(params);
  }

  @Post('add')
  @ApiOperation({ summary: '创建角色及菜单和权限' })
  create(@Body() createRoleDto: CreateRoleDto) {
    console.log('xzz2021: RoleController -> create -> createRoleDto', createRoleDto);
    return this.roleService.createRoleWithMenusAndPermissions(createRoleDto);
  }

  @Post('update')
  @ApiOperation({ summary: '更新角色' })
  update(@Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(updateRoleDto);
  }

  // 用户登录瞬间  根据token获取用户信息  获取菜单 以及 权限  进行 去重合并
  //  此处有严重bug  如果返回数据不规则 前端会出现404 且无法清空数据重新登录  前端要优化
  @Get('getRoleMenu')
  @ApiOperation({ summary: '获取当前角色菜单及权限' })
  getMenu(@Request() req: any) {
    const { id } = req?.user as { id: number; phone: string };
    return this.roleService.findRoleMenu(+id);
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
