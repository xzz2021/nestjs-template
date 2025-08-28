import { Inject, Injectable } from '@nestjs/common';
// import { PgService } from '@/prisma/pg.service';
// import { CACHE_MANAGER } from '@nestjs/cache-manager';
// import { Cache } from 'cache-manager';
import { Logger } from 'winston';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
@Injectable()
export class LoggerService {
  constructor(
    // private readonly pgService: PgService,
    // @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(WINSTON_MODULE_NEST_PROVIDER as 'NestWinston') private readonly logger: Logger,
  ) {}

  getLogList(searchParam: any) {
    const newSearchParam = {
      ...searchParam,
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
      orderBy: { id: 'desc' as const },
    };
    // 将日志写入数据库
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
}
