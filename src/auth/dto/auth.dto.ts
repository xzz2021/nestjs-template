import { Expose, Transform } from 'class-transformer';
import { Exclude } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterResDto {
  @Exclude()
  password: Date;

  // @Exclude()   //  指定时区 转换
  @Transform(({ value }) => value.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }).split('T').join(' '))
  updatedAt: Date;

  @Transform(({ value }) => value.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }).split('T').join(' '))
  createdAt: Date;

  @Exclude()
  deletedAt: Date;
  // 构造一个新的字段
  // @Expose()
  // @Transform(({ obj }) => obj.name + '111')
  // newName: string;
}
