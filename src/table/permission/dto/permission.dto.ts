import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PermissionDto {
  @ApiProperty({ type: String, description: '权限名称', example: '新增' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: String, description: '权限代码', example: 'add' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ type: String, description: '权限值', example: '12' })
  @IsOptional()
  @IsString()
  value?: string;
}

export class CreatePermissionDto extends PermissionDto {
  @ApiProperty({ type: String, description: '权限资源', example: 'menu' })
  @IsString()
  @IsNotEmpty()
  resource: string;

  @ApiProperty({ type: Number, description: '菜单ID', example: 1 })
  // @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  menuId: number;
}

export class UpdatePermissionDto extends PermissionDto {
  @ApiProperty({ type: Number, description: '权限ID', example: 1 })
  // @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  id: number;

  @ApiProperty({ type: String, description: '权限资源', example: 'menu' })
  @IsString()
  @IsNotEmpty()
  resource: string;
}

export class BatchPermissionDto {
  @ApiProperty({ type: Number, description: '菜单ID', example: 1 })
  // @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  menuId: number;
}
