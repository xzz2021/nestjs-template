import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { Exclude } from 'class-transformer';
import { IsInt, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import type { Request } from 'express';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, example: 'xzz2025', description: '用户名' })
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, example: '112233', description: '密码' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, example: '13077908822', description: '手机号' })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, example: '123456', description: '验证码' })
  code: string;

  // @ApiProperty({ type: String, example: '', description: '头像' })
  @IsOptional()
  @IsString()
  avatar?: string;

  // @ApiProperty({ type: String, example: '', description: '微信ID' })
  @IsOptional()
  @IsString()
  wechatId?: string;
}

export class RegisterResDto {
  @Exclude()
  password: Date;

  // @Exclude()   //  指定时区 转换
  @Transform(({ value }) => value.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }).split('T').join(' ').replaceAll('/', '-'))
  updatedAt: Date;

  @Transform(({ value }) => value.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }).split('T').join(' ').replaceAll('/', '-'))
  createdAt: Date;

  @Exclude()
  deletedAt: Date;
  // 构造一个新的字段
  // @Expose()
  // @Transform(({ obj }) => obj.name + '111')
  // newName: string;
}

export class LoginInfoDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, example: '13077908822', description: '手机号' })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, example: '112233', description: '密码' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, example: 'a44833dc-a4d2-4c8b-90d7-a7772b91ca15', description: '验证码ID' })
  captchaId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, example: '123456', description: '验证码' })
  captchaText: string;
}

export class WechatCodeResponse {
  openid: string;
  unionid: string;
  access_token: string;
  refresh_token: string;
  errcode?: number;
}

export class SmsCodeDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, example: '13077908822', description: '手机号' })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, example: 'register', description: '类型' })
  type: string;
}

export class SmsLoginDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, example: '13077908822', description: '手机号' })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, example: '123456', description: '验证码' })
  code: string;
}

export class SmsBindDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, example: '13077908822', description: '手机号' })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, example: '112233', description: '密码' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, example: 'xzz2025', description: '用户名' })
  username: string;
}

export class ForceLogoutDto {
  @ApiProperty({ type: Number, description: '用户ID', example: 1 })
  @IsInt()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  id: number;
}

class JwtUserDto {
  id: number;
  username: string;
  phone: string;
  roles: string[];
  lockedUntil: Date;
  jti: string;
  iat: number;
  exp: number;
}
export class JwtReqDto extends Request {
  @ApiProperty({ type: () => JwtUserDto, description: '用户数据' })
  @IsObject({ message: 'user必须是对象' })
  //  @ValidateNested({ each: true }) 数组用 true  对象 用false
  @ValidateNested({ each: false })
  @Type(() => JwtUserDto)
  @IsNotEmpty({ message: '用户数据不能为空' })
  // @Type(() => MetaDto) 的作用：
  // 1. 将普通对象转换为 MetaDto 实例
  // 2. 确保 class-transformer 能正确处理嵌套对象
  // 3. 让 class-validator 能正确进行嵌套验证
  // 4. 保持类型安全和面向对象特性
  user: JwtUserDto;
}
