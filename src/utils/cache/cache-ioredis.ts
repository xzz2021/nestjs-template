import { ConfigService } from '@nestjs/config';
import { RedisModule } from '@liaoliaots/nestjs-redis';

// 使用模块方式  可以设置多个实例
export const REDIS_MODULE = RedisModule.forRootAsync({
  // isGlobal: true,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const redis = configService.get('redis');
    // console.log('redis==================', redis);
    return {
      // 可声明多个命名实例
      config: [
        {
          namespace: 'default',
          // —— 稳健性（直接透传给 ioredis）——
          lazyConnect: true, // 首次使用再连
          enableAutoPipelining: true, // 自动 pipeline 降 RTT
          maxRetriesPerRequest: null, // 断线时不抛 MaxRetries
          retryStrategy: times => Math.min(1000 * 2 ** times, 10_000),

          reconnectOnError: err => (/READONLY/.test(err.message) ? 1 : false),
          ...redis,
          // TLS（有需要就打开）
          // tls: {},
        },
        // 可再加更多实例...
        // {
        //   namespace: 'master2',
        //   host: 'localhost',
        //   port: 6380,
        //   password: 'authpassword'
        // }
      ],
    };
  },
});
