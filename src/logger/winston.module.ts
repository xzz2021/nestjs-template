import { Module, Global } from '@nestjs/common';
import * as winston from 'winston';
import { WinstonModule, utilities } from 'nest-winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { LoggerService } from './logger.service';
import { LoggerController } from './logger.controller';
@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        utilities.format.nestLike('xzz2021', {
          colors: true,
          prettyPrint: true,
          processId: true,
          appName: true,
        }),
        winston.format.printf(({ timestamp, level, message, context, ...rest }) => {
          return JSON.stringify({ timestamp, level, message, context, ...rest });
        }),
      ),
      transports: [
        //   定义常规的 系统 运行 日志
        // new winston.transports.Console({
        //   level: 'info',
        // }),

        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            utilities.format.nestLike('xzz2021', {
              colors: true,
              prettyPrint: true,
              processId: true,
              appName: true,
            }),
          ),
        }),
        // 日志级别为 info 的日志输出到一个文件
        // new winston.transports.File({
        //   level: 'info',
        //   filename: generateLogFileName('info'),
        //   zippedArchive: true,
        //   maxsize: 20 * 1024 * 1024,
        //   maxFiles: 7,
        // }),

        // 使用 DailyRotateFile 按小时滚动日志文件
        new DailyRotateFile({
          level: 'error',
          filename: 'logs/error-%DATE%.log', // 日志文件名包含日期
          datePattern: 'YYYY-MM-DD-HH', // 设置时间精度为小时
          zippedArchive: true, // 启用压缩旧日志文件
          maxSize: '20M', // 每个文件最大 20MB
          maxFiles: 7, // 保留过去 7 天的日志文件
        }),
        new DailyRotateFile({
          level: 'warn',
          filename: 'logs/warn-%DATE%.log', // 日志文件名包含日期
          datePattern: 'YYYY-MM-DD-HH', // 设置时间精度为小时
          zippedArchive: true, // 启用压缩旧日志文件
          maxSize: '20M', // 每个文件最大 20MB
          maxFiles: 7, // 保留过去 7 天的日志文件
        }),
        // new DailyRotateFile({
        //   level: 'info',
        //   filename: 'logs/info-%DATE%.log', // 日志文件名包含日期
        //   datePattern: 'YYYY-MM-DD-HH', // 设置时间精度为小时
        //   zippedArchive: true, // 启用压缩旧日志文件
        //   maxSize: '20M', // 每个文件最大 20MB
        //   maxFiles: 7, // 保留过去 7 天的日志文件
        // }),
      ],
    }),
  ],
  controllers: [LoggerController],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class WinstonLoggerModule {}
