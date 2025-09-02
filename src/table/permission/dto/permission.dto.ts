import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class PermissionDto {
  @ApiProperty({ type: String, description: '权限名称', example: '新增' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ type: String, description: '权限代码', example: 'add' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiPropertyOptional({ type: String, description: '权限值', example: '12' })
  @IsOptional()
  @IsString()
  value?: string;
}

export class CreatePermissionDto extends PermissionDto {
  @ApiProperty({ type: String, description: '权限资源', example: 'menu' })
  @IsNotEmpty()
  @IsString()
  resource: string;

  @ApiProperty({ type: Number, description: '菜单ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  menuId: number;
}

export class UpdatePermissionDto extends PermissionDto {
  @ApiProperty({ type: Number, description: '权限ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  id: number;

  @ApiProperty({ type: String, description: '权限资源', example: 'menu' })
  @IsNotEmpty()
  @IsString()
  resource: string;
}

export class BatchPermissionDto {
  @ApiProperty({ type: Number, description: '菜单ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  menuId: number;
}
