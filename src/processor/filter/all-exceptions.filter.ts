//  这里是捕获所未知异常  无法拿到源信息
// 如果需要源信息   后期考虑 实现return next.handle().pipe() 来捕获

import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger, Inject, NotFoundException } from '@nestjs/common';
import { Response, Request } from 'express';
import { checkPrismaError } from './prisma.exception';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

//  捕获 HttpException 异常 或 HttpException 子类 异常
@Catch() // @Catch()参数留空  表示 捕获所有异常
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger) {}
  catch(exception: unknown, host: ArgumentsHost) {
    // console.log('🚀 ~ AllExceptionsFilter ~ catch ~ exception:', exception);
    const start = Date.now();
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const path = request.url.split('?')[0];
    // ✅ 忽略 favicon.ico 请求
    if (path === 'favicon.ico') {
      return response.status(204).send(); // No Content
    }
    let status = 400;
    let message = 'Internal server error';
    let metaData = {};
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
      metaData = exception.getResponse();
    } else if (exception instanceof Error) {
      message = exception.message;
    }
    if (exception instanceof NotFoundException) {
      status = exception.getStatus();
      message = `接口不存在: ${path}`;
      // throw new NotFoundException();
    }

    const { msg, meta } = checkPrismaError(exception) || {};

    this.logger.error({
      timestamp: new Date().toISOString(),
      // method: request.method,
      // url: request.url,
      // status,
      // message,
      stack: exception instanceof Error ? exception.stack?.slice(0, 50) : null,
      context: 'AllExceptionsFilter',
      info: `${path}, ${request.method} ${Date.now() - start}ms`,
    });

    //  一定要返回数据 否则会截断
    response.status(status).json({
      code: status || 400,
      timestamp: new Date(),
      path,
      message: msg || message || '未捕获异常,请检查后端代码!',
      meta: metaData || meta,
    });
  }
  // //  对正常返回数据进行处理
  // async handle(exception: unknown, host: ArgumentsHost) {
  //   const ctx = host.switchToHttp();
  //   const response = ctx.getResponse();
  //   console.log('🚀 ~ AllExceptionsFilter ~ handle ~ response:', response);
  //   const request = ctx.getRequest();
  // }
  // async catch(exception: unknown, host: ArgumentsHost) {
  //   // 这里处理的是异常情况  如果上层有数据正常返回则不会走到这里
  //   const ctx = host.switchToHttp();
  //   const response = ctx.getResponse();
  //   const request = ctx.getRequest();
  //   let status = HttpStatus?.INTERNAL_SERVER_ERROR || 400;
  //   let message = 'Internal server error';
  //   // const start = Date.now();
  //   // const userPhone = request['user']?.phone || request?.body?.phone || '';
  //   console.log('🚀 ~ AllExceptionsFilter ~ exception:', exception);
  //   if (exception instanceof HttpException) {
  //     // 如果是 HttpException，直接获取状态码和错误信息
  //     status = exception.getStatus();
  //     const exceptionResponse = exception.getResponse();
  //     message =
  //       typeof exceptionResponse === 'string' ? exceptionResponse : (exceptionResponse as any).message || message;
  //   } else if (exception instanceof Error) {
  //     // 处理其他类型的错误 (非 HttpException)
  //     message = exception?.message || message;
  //   }
  //   let feedbackMsg = message;
  //   if (message === 'Unauthorized') {
  //     feedbackMsg = '没有操作权限';
  //   }
  //   if (message.includes('Cannot GET')) {
  //     feedbackMsg = '请求路径错误';
  //   }
  //   // const logData = {
  //   //   resCode: status,
  //   //   method: request.method,
  //   //   url: request.url,
  //   //   ip: request.ip,
  //   //   userAgent: request.headers['user-agent'],
  //   //   feedbackMsg,
  //   //   duration: Date.now() - start,
  //   // };
  //   // console.log('xzz2021: AllExceptionsFilter -> logData', logData);
  //   // const isPrismaClientErr = exception instanceof PrismaClientKnownRequestError;
  //   // console.log('🚀 ~ AllExceptionsFilter ~ ======11111===isPrismaClientErr:', isPrismaClientErr);
  //   // //  如果是数据库异常 则跳过记录 因为再调用也是失败
  //   // await this.loggerService.createRequestLog(logData, userPhone as string, isPrismaClientErr);
  //   // 返回标准化的错误响应
  //   response.status(status).json({
  //     statusCode: status,
  //     timestamp: new Date().toISOString(),
  //     //   path: request.url,
  //     message: feedbackMsg,
  //   });
  // }
}
