import { Exclude, Expose, Transform } from 'class-transformer';

/*
结合配置参数使用

// 设为true 则所有参数必须使用@Expose()  才会返回  
//  设为false 则未定义的参数也会返回   要排除的话必须使用@Exclude()
 excludeExtraneousValues: true,   

 // 设为true 将会对出参进行类型转换
 enableImplicitConversion: true,

*/
export class Department1Entity {
  // @Transform(({ value }) => value.toString())
  id: number;

  name: string;

  status: boolean;
  remark: string;
  @Expose()
  isDeleted: boolean;

  parentId: number;
  //  转换成 2025-05-28 11:41:45
  // @Transform(({ value }) => value.toISOString().split('T').join(' '))
  createdAt: Date;

  // @Exclude()   //  指定时区 转换
  @Transform(({ value }) => value.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }).split('T').join(' '))
  updatedAt: Date;

  @Exclude()
  deletedAt: Date;
  // 构造一个新的字段
  @Expose()
  @Transform(({ obj }) => obj.name + '111')
  newName: string;

  /*
  // 加解密
@Expose()
@Transform(({ value, type }) => type === 'plainToClass' ? encrypt(value) : decrypt(value))
password: string;


//  重命名
@Expose({ name: 'first_name' })
firstName: string;


//  条件判断
@Expose()
@Transform(({ obj }) => obj.isAdmin ? obj.secret : undefined)
secret: string;

// 格式化日期字段
@Expose()
@Transform(({ value }) => value.toISOString().split('T')[0])
birthDate: Date;

// 敏感字段脱敏
@Expose()
@Transform(({ value }) => value.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2'))
phone: string;

//  构建权限相关字段
@Expose()
@Transform(({ obj }) => obj.role === 'admin' ? obj.secretInfo : undefined)
adminOnlyField: string;

//嵌套数据提取
@Expose()
@Transform(({ obj }) => obj.profile?.email)
email: string;


@Transform(({ obj, type }) => type === 'classToPlain' ? undefined : obj.secret)
adminField: string;




  // constructor(partial: Partial<Department1Entity>) {
  //   Object.assign(this, partial);
  // }


  */
}
