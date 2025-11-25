// 这里用于 对正常响应数据 做统一格式转换处理

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { formatDateToYMDHMS } from '../utils/date';

/**
 * 统一处理接口请求与响应结果
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      // 对所有响应数据进行包装
      map((data: any) => {
        //  如果数据不存在 也直接返回  这样可以看到未知异常
        if (!data) return data;
        // 如果返回的是文件流 则不记录日志
        if (data instanceof ReadableStream) {
          return data;
        }
        const { message, ...rest } = data;
        // return new ResOp(HttpStatus.OK, data ?? null)

        return {
          message,
          data: rest, // 返回数据  一律用  data 包裹
          code: 200,
          timestamp: formatDateToYMDHMS(new Date()),
        };
      }),
    );
  }
}
