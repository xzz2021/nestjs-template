// dto/create-role.dto.ts
import { IsArray, ArrayNotEmpty, IsBoolean, IsOptional, IsString, MaxLength, IsInt, IsNotEmpty } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @IsString()
  @MaxLength(50)
  name: string;

  @IsString()
  @MaxLength(50)
  code: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  remark?: string;

  @IsArray()
  @ArrayNotEmpty({ message: '分配的菜单不能为空' }) // 数组不能为空
  @Type(() => Number)
  @Transform(({ value }) => (Array.isArray(value) ? [...new Set(value)] : value))
  menuIds: number[]; // 选择的菜单

  // 允许为空数组 因为更新时可能不勾选权限
  @IsArray()
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => (Array.isArray(value) ? [...new Set(value)] : value))
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
  @IsOptional()
  @ApiPropertyOptional({ type: Boolean, description: '角色状态', default: true })
  status: boolean = true;
}

export class UpdateRoleDto extends CreateRoleDto {
  @IsInt()
  @IsNotEmpty()
  id: number;
}
