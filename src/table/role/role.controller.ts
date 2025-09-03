import { Body, Controller, Delete, Get, Param, Post, Query, Request } from '@nestjs/common';
import { RoleService } from './role.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateRoleDto, RoleListRes, MenuPermissionListRes, QueryRoleParams, RoleSeedArrayDto, UpdateRoleDto } from './dto/role.dto';
@ApiTags('角色')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('getRoleList')
  @ApiOperation({ summary: '获取角色菜单及权限列表,用于展示及分配' })
  @ApiResponse({ type: RoleListRes, isArray: true })
  findAll(@Query() params: QueryRoleParams) {
    return this.roleService.getRoleList(params);
  }

  @Post('add')
  @ApiOperation({ summary: '创建角色及菜单和权限' })
  create(@Body() createRoleDto: CreateRoleDto) {
    console.log('xzz2021: RoleController -> create -> createRoleDto', createRoleDto);
    return this.roleService.createRoleWithMenusAndPermissions(createRoleDto);
  }

  @Post('update')
  @ApiOperation({ summary: '更新角色信息及菜单和权限' })
  update(@Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(updateRoleDto);
  }

  // 用户登录瞬间  根据token获取用户信息  获取菜单 以及 权限  进行 去重合并
  //  此处有严重bug  如果返回数据不规则 前端会出现404 且无法清空数据重新登录  前端要优化
  @Get('getRoleMenu')
  @ApiOperation({ summary: '获取当前角色菜单及权限' })
  @ApiResponse({ type: MenuPermissionListRes, isArray: true })
  getMenu(@Request() req: any) {
    const { id } = req?.user as { id: number; phone: string };
    return this.roleService.findRoleMenu(+id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除角色' })
  remove(@Param('id') id: string) {
    return this.roleService.remove(+id);
  }

  @Post('generateRoleSeed')
  @ApiOperation({ summary: '生成角色种子数据' })
  generateDictionarySeed(@Body() data: RoleSeedArrayDto) {
    return this.roleService.generateRoleSeed(data.data);
  }
}
