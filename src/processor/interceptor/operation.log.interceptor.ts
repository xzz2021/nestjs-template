// request-log.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { extractIP } from '@/processor/utils/string';
import { ScheduleService } from '@/schedule/schedule.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
//  请求拦截器  提供日志记录

interface JwtUser {
  id: number;
  username: string;
  phone: string;
}

// Extend Express Request to include user
interface RequestWithUser extends Request {
  user?: JwtUser;
}

@Injectable()
export class OperationLogInterceptor implements NestInterceptor {
  constructor(
    readonly scheduleService: ScheduleService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<RequestWithUser>();
    // const response = ctx.getResponse<Response>();
    const { method, url, ip, headers, user } = request;
    //  注意所有public接口 是没有user的
    // console.log('xzz2021: OperationLogInterceptor -> request:', user);
    const userAgent = headers['user-agent'] ?? '';
    const userId = user?.id ?? null;

    return next.handle().pipe(
      //  tap 是rxjs 的 操作符 用于在流中进行操作  类似于finally
      //  tap是成功时的响应

      tap((data: any) => {
        this.logger.log({
          timestamp: new Date().toISOString(),
          message: 'api',
          // method,
          // url: url.split('?')[0],
          // duration: Date.now() - start,
          context: 'OperationLogInterceptor',
          info: `${url.split('?')[0]}, ${method} ${Date.now() - start}ms`,
        });
        if (url.includes('/log/getUserOperation')) return;
        // 构建日志数据
        const logData = {
          userId,
          // target: url,
          method,
          ip: extractIP(ip ?? ''),
          userAgent: userAgent,
          requestUrl: url,
          responseMsg: data?.message,
          detailInfo: {},
          status: 'success',
          duration: Date.now() - start,
        };

        // 调用任务 将日志 异步写入数据库
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.scheduleService.addUserOperationLog(logData);
      }),

      // 错误请求的日志记录   //  如果上层方法没有使用try catch 包裹 则错误会走到这里

      // 失败时 记录  操作日志
      catchError((err: any) => {
        const meta = {
          meta: err?.meta,
          stackName: err.stack.split(':')[0],
          ...err,
        };

        const logData = {
          userId,
          method,
          ip: extractIP(ip ?? ''),
          userAgent: userAgent,
          requestUrl: url,
          responseMsg: err?.message,
          detailInfo: meta,
          status: 'fail',
          duration: Date.now() - start,
        };
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.scheduleService.addUserOperationLog(logData);

        // this.logger.error({
        //   timestamp: new Date().toISOString(),
        //   // method,
        //   // url,
        //   // status: 'fail',
        //   // duration: Date.now() - start,
        //   context: 'OperationLogInterceptor',
        //   info: `${url.split('?')[0]}, ${method} ${Date.now() - start}ms`,
        // });
        // 将错误继续抛出，以便 NestJS 继续处理异常
        return throwError(() => err);
      }),
    );
  }
}
