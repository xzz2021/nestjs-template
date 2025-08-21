import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { plainToInstance, ClassConstructor } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// 序列化拦截器   将此拦截器 提供给 装饰器 使用  简化代码
@Injectable()
export class SerializeInterceptor<T> implements NestInterceptor {
  constructor(private dto: ClassConstructor<T>) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: any) => {
        /*
        //  普通方案一=======  适用于直接返回查询实体结果
        return plainToInstance(this.dto, data, {
          // 设为true 将会对出参进行严格的控制 以及类型转换
          excludeExtraneousValues: false,
          // 设为true 将会对出参进行类型转换
          // enableImplicitConversion: true,
          exposeUnsetFields: false,
        });
        */
        if (data?.list) {
          data.list = plainToInstance(this.dto, data.list, {
            excludeExtraneousValues: false,
            exposeUnsetFields: false,
          });
        }
        if (data?.data) {
          data.data = plainToInstance(this.dto, data.data, {
            excludeExtraneousValues: false,
            exposeUnsetFields: false,
          });
        }
        return data;
      }),
    );
  }
}

/*
结合装饰器使用


import { UseInterceptors } from '@nestjs/common';
import { ClassConstructor } from 'class-transformer';
import { SerializeInterceptor } from '../interceptor/serialize';

// 序列化装饰器  简化代码
export function Serialize(dto: ClassConstructor<any>) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

使用示例  在控制器 controller 中使用

@Serialize(OutputDto)   //  传递出参dto
  @Get()
  @Serialize(OutputDto)
  async findAll() {
    return this.departmentService.findAll();
  }



*/
