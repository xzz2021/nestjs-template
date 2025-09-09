import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PgService } from '@/prisma/pg.service';
import { DeleteLogDto, QueryLogParams } from './dto/logger.dto';
import { buildPrismaWhere } from '@/processor/utils/object';

@Injectable()
export class LogService implements LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER as 'NestWinston') private readonly logger: Logger,
    private readonly pgService: PgService,
  ) {}

  log(message: string, context?: string) {
    this.logger.info(message, context);
  }

  error(message: string, trace?: string) {
    this.logger.error(message, trace);
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, context);
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, context);
  }

  // async addUserOperationLog(data: any) {
  //   // 添加用户 操作日志 包含 成功和失败的
  //   await this.logQueue.add('user-operation', data);
  // }

  async getUserOperationLogList(searchParam: QueryLogParams) {
    // console.log('xzz2021: LogServic==================~ searchParam:');
    const { where, skip, take } = buildPrismaWhere(searchParam);
    // console.log('xzz2021: LogService -> getUserOperationLogList -> where:', where);
    const newSearchParam = {
      where,
      skip,
      take,
      include: {
        user: {
          select: {
            username: true,
            phone: true,
          },
        },
      },
      orderBy: { id: 'desc' as const },
    };
    const list = await this.pgService.userOperationLog.findMany({
      ...newSearchParam,
    });
    const total = await this.pgService.userOperationLog.count({
      where,
    });
    return { list, total, message: '获取日志列表成功' };
  }

  /*
  async deleteLog(ids: number[]) {
    const res = await this.pgService.requestLog.deleteMany({
      where: { id: { in: ids } },
    });
    return { code: 200, res, message: '删除日志成功' };
  }

  async createRequestLog(data: RequestLog, userPhone: string, isPrismaClientErr: boolean = false) {
    if (isPrismaClientErr) {
      return { code: 400, message: '创建日志失败, 因为数据库服务异常' };
    }
    // 1. 先根据phone查出用户信息   2. 创建log表同时关联user信息  3. 使用事务操作
    try {
      const transaction = await this.pgService.$transaction(async pgService => {
        const user = await pgService.user.findUnique({
          where: { phone: userPhone },
        });
        const log = await pgService.requestLog.create({
          data: { ...data, userId: user?.id },
        });
        return log;
      });
      if (transaction) {
        return { code: 200, message: '创建日志成功', data: transaction.id };
      } else {
        return { code: 400, message: '创建日志失败' };
      }
    } catch (error) {
      console.log('xzz2021: UtilService -> createRequestLog -> error', error);
      return { code: 400, error: error.message, message: '创建日志失败' };
    }
  }

  */
  createErrorLog(msgObj: any) {
    this.logger.error(msgObj);
  }

  createWarningLog(msgObj: any) {
    this.logger.warn(msgObj);
  }

  createInfoLog(msgObj: { message: string; context: string; [key: string]: any }) {
    const { message, context, ...rest } = msgObj;

    this.logger.log(message, context, rest);
  }

  createDebugLog(msgObj: any) {
    this.logger.debug(msgObj);
  }

  async deleteUserOperationLog(obj: DeleteLogDto) {
    await this.pgService.userOperationLog.deleteMany({
      where: { id: { in: obj.ids } },
    });
    return { message: '删除用户操作日志成功' };
  }
}
