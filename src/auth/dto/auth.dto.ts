import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Exclude } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
