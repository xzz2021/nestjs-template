import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../prisma/client/postgresql';

/*
pnpm add pgdb@link:@/prisma/client/postgresql   //  创建软链接
import { PrismaClient } from 'pgdb';   // pgdb依赖别名


  //  全局排除字段  omit
const prisma = new PrismaClient({
  omit: {
    user: {
      password: true
    }
  }
})

*/

//  关于 中间件已废弃  封装使用prisma的extend的曲线方法 https://github.com/prisma/prisma/issues/18628
@Injectable()
export class PgService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      // 连接池配置
      //   connection: {
      //     pool: {
      //       min: 2, // 最小连接数
      //       max: 10, // 最大连接数
      //       idleTimeoutMillis: 30000, // 空闲超时时间（毫秒）
      //       acquireTimeoutMillis: 60000, // 获取连接超时时间（毫秒）
      //     },
      //   },
      // 日志配置
      //   log: ['error', 'warn', 'query'],
      // omit: { user: { password: true } },  //  慎重使用全局排除
    });
    // this.$extends({
    //   model: {
    //     user: {
    //       async findSecond() {
    //         return await this.user.findUnique({
    //           where: { id: 2 },
    //         });
    //       },
    //     },
    //   },
    // });
  }

  async retryConnect() {
    const MAX_RETRY = 5;
    let retryCount = 0;
    while (retryCount < MAX_RETRY) {
      try {
        await this.$connect();
        console.log('数据库连接成功');
        break;
      } catch (_err) {
        console.error('重连数据库失败, 3秒后重试!');
        await new Promise(resolve => setTimeout(resolve, 3000));
        retryCount++;
        continue;
      }
    }
    throw new Error('重连数据库失败, 达到最大重试次数!');
  }

  // 健康检查方法
  async reconnect() {
    try {
      await this.$connect();
    } catch (_err) {
      console.error('重连数据库失败, 3秒后重试!');
      await new Promise(resolve => setTimeout(resolve, 3000));
      await this.reconnect();
    }
  }

  async onModuleInit() {
    // 无限重连
    await this.$connect();
    console.log('数据库连接成功');
    // try {
    //   await this.healthCheck();
    // } catch (_error) {
    //   console.error('数据库启动连接失败, 正在自动重连!');
    //   await this.reconnect();
    // }
  }

  async healthCheck() {
    try {
      await this.$queryRaw`SELECT 1`;
      await new Promise(resolve => setTimeout(resolve, 5000));
      await this.healthCheck();
    } catch (_error) {
      console.error('数据库健康状态异常, 请进行检查!');
      await this.reconnect();
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // 获取连接池状态
  async getConnectionPoolStats() {
    try {
      const stats = await this.$queryRaw`
        SELECT 
          numbackends as active_connections,
          max_connections,
          state
        FROM pg_stat_database 
        WHERE datname = current_database();
      `;
      return stats;
    } catch (error) {
      console.error('Failed to get connection pool stats:', error);
      throw error;
    }
  }
}
