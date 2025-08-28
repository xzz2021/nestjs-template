// dto/create-role.dto.ts
import { IsArray, IsBoolean, IsOptional, IsString, IsInt, IsNotEmpty, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IQueryParams {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({ type: Number, description: '部门id' })
  id: number;

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

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  phone: string;

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
  @ApiProperty({ type: Number })
  @IsInt()
  @IsNotEmpty()
  id: number;

  //  生成时传递的是id数组
  @ApiProperty({ isArray: true, type: Number })
  @IsArray()
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => (Array.isArray(value) ? [...new Set(value)] : value))
  roles?: number[];

  @ApiProperty({ isArray: true, type: Number })
  @IsArray()
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => (Array.isArray(value) ? [...new Set(value)] : value))
  departments?: number[];
}
