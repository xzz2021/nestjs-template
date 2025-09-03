// dto/create-role.dto.ts
import { IsArray, ArrayNotEmpty, IsBoolean, IsOptional, IsString, MaxLength, IsInt, IsNotEmpty, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, OmitType, PickType } from '@nestjs/swagger';
import { MenuDto, PermissionDto, MetaDto } from '@/table/menu/dto/menu.dto';
export class CreateRoleDto {
  @IsString()
  @MaxLength(50)
  @ApiProperty({ type: String, description: '角色名称', example: '管理员' })
  name: string;

  @IsString()
  @MaxLength(50)
  @ApiProperty({ type: String, description: '角色编码', example: 'admin' })
  code: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean, description: '角色状态', example: true })
  status?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @ApiProperty({ type: String, description: '角色备注', example: '管理员备注说明' })
  remark?: string = '';

  @IsArray()
  @ArrayNotEmpty({ message: '分配的菜单不能为空' }) // 数组不能为空
  @Type(() => Number)
  @Transform(({ value }) => (Array.isArray(value) ? [...new Set(value)] : value))
  @ApiProperty({ type: Number, description: '菜单ID', example: [1, 5] })
  menuIds: number[]; // 选择的菜单

  // 允许为空数组 因为更新时可能不勾选权限
  @IsArray()
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => (Array.isArray(value) ? [...new Set(value)] : value))
  @ApiProperty({ type: Number, description: '权限ID', example: [2, 3] })
  permissionIds: number[] = []; // 在已选菜单下勾选的“部分权限”
}

export class QueryRoleParams {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({ type: Number, description: '页码', default: 1 })
  pageIndex: number = 1;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({ type: Number, description: '每页条数', default: 10 })
  pageSize: number = 10;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ type: String, description: '角色名称' })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ type: String, description: '角色编码' })
  code?: string;

  @IsBoolean()
  @Transform(({ value }) => value === 'true') //  在query中拿到的数据?pageIndex=1&pageSize=10&status=true都是序列化后的字符
  @ApiPropertyOptional({ type: Boolean, description: '角色状态', default: true })
  status: boolean = true;
}

export class UpdateRoleDto extends CreateRoleDto {
  @ApiProperty({ type: Number, description: '角色ID', example: 1 })
  @IsInt()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  id: number;
}
export class DeleteRoleDto {
  @ApiProperty({ type: Number, description: '角色ID', example: 1 })
  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class RoleSeedDto extends OmitType(CreateRoleDto, ['menuIds', 'permissionIds'] as const) {}

export class RoleSeedArrayDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoleSeedDto)
  @ApiProperty({ type: RoleSeedDto, isArray: true })
  data: RoleSeedDto[];
}

//  返回list 数据格式

class RoleMenuListDto extends PickType(MenuDto, ['id', 'name', 'path', 'sort', 'parentId'] as const) {
  @ApiProperty({ type: PermissionDto, isArray: true, description: '权限列表' })
  permissions: PermissionDto[];
}

export class RoleListDto extends PickType(CreateRoleDto, ['name', 'code', 'status'] as const) {
  @ApiProperty({ type: Number, description: '角色ID', example: 1 })
  id: number;

  @ApiProperty({ type: RoleMenuListDto, isArray: true })
  menus: RoleMenuListDto[];
}

export class RoleListRes {
  @ApiProperty({ type: Number, description: '总条数', example: 10 })
  total: number;

  @ApiProperty({ type: RoleListDto, isArray: true, description: '列表数据' })
  list: RoleListDto[];
}

//  返回当前用户拥有的菜单及权限
class MetaPermissionDto extends MetaDto {
  @ApiProperty({ type: String, isArray: true, description: '权限code列表', example: ['add', 'edit', 'delete'] })
  permissions: string[];
}
class MenuPermissionListDto extends OmitType(MenuDto, ['meta']) {
  @ApiProperty({ type: MetaPermissionDto, description: '元数据' })
  meta: MetaPermissionDto;
}

export class MenuPermissionListRes {
  @ApiProperty({ type: MenuPermissionListDto, isArray: true, description: '列表数据' })
  list: MenuPermissionListDto[];
}
