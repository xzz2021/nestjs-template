// dto/create-role.dto.ts
import { IsArray, IsBoolean, IsOptional, IsString, IsInt, IsNotEmpty, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';

export class QueryUserParams {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({ type: Number, description: '部门id, 不传则查询所有用户' })
  @Transform(({ value }) => (value ? Number(value) : undefined))
  id?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({ type: Number, description: '页码', default: 1 })
  pageIndex: number = 1;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({ type: Number, description: '每页条数', default: 10 })
  @Max(100)
  @Transform(({ value }) => Number(value) || 10)
  pageSize: number = 10;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ type: String, description: '用户名称' })
  username?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ type: String, description: '用户手机号' })
  phone?: string;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({ type: Boolean, description: '用户状态' })
  status?: boolean;
}

export class UserDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({ type: String })
  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  birthday?: string;

  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  gender?: string = 'OTHER';

  // @ApiPropertyOptional({ type: String })
  // @IsString()
  // @IsOptional()
  // wechatId?: string;
}

export class UpdateUserDto extends UserDto {
  @ApiProperty({ type: Number, description: '用户ID', example: 1 })
  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  id: number;

  //  生成时传递的是id数组
  @ApiProperty({ isArray: true, type: Number, description: '角色ID', example: [1, 2] })
  @IsArray()
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => (Array.isArray(value) ? [...new Set(value)] : value))
  roles?: number[];

  @ApiProperty({ isArray: true, type: Number, description: '部门ID', example: [1, 2] })
  @IsArray()
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => (Array.isArray(value) ? [...new Set(value)] : value))
  departments?: number[];
}

export class CreateUserDto extends OmitType(UpdateUserDto, ['id']) {}

export class UpdatePersonalInfo extends UserDto {
  @ApiProperty({ type: Number, description: '用户ID', example: 1 })
  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class ListRes {
  @ApiProperty({ type: Number, description: '总条数', example: 10 })
  total: number;

  @ApiProperty({ type: UpdateUserDto, isArray: true, description: '列表数据' })
  list: UpdateUserDto[];
}

export class UpdatePwdDto {
  @ApiProperty({ type: Number, description: '用户ID', example: 1 })
  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  id: number;

  @ApiProperty({ type: String, description: '旧密码', example: '123456' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ type: String, description: '新密码', example: '123456' })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export class AdminUpdatePwdDto {
  @ApiProperty({ type: Number, description: '用户ID', example: 1 })
  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  id: number;

  @ApiProperty({ type: String, description: '新密码', example: '123456' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class BatchDeleteUserDto {
  @ApiProperty({ type: Number, isArray: true, description: '用户ID', example: [1, 2] })
  @IsArray()
  @IsNotEmpty()
  @Type(() => Number)
  @Transform(({ value }) => (Array.isArray(value) ? [...new Set(value)].map(Number) : value))
  ids: number[];
}
