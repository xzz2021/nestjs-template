import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CONFIG_MODULE, moduleFactory } from './config.module';
import { CacheInterceptor } from '@nestjs/cache-manager';
// import KeyvRedis from '@keyv/redis';
import { SERVER_STATIC_MODULE } from './server.static';
import { PrismaModule } from '@/prisma/prisma.module';
import { StaticfileModule } from '@/staticfile/staticfile.module';
import { HttpModule } from '@/utils/http/http.module';
import { AuthModule } from '@/auth/auth.module';
import { JwtAuthGuard } from '@/processor/guard/jwt-auth.guard';
// import { CaslGuard } from '@/processor/guard/casl.guard';
// import { CaslModule } from '@/casl/casl.module';
// import { PoliciesGuard } from '@/processor/guard/casl.guard';
// import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
// import { DynamicThrottlerGuard } from '@/processor/guard/throttler.guard';
import { ClsModule } from 'nestjs-cls';
import { WinstonLoggerModule } from '@/logger/winston.module';
import { RequestLogInterceptor } from '@/processor/interceptor/log';
import { AllExceptionsFilter } from '@/processor/filter/exceptions';
import { WsModule } from '@/ws/ws.module';
import { CACHE_MODULE } from './cache';

const FLAG_MODULE: Record<string, any> = {
  WS: WsModule,
};

function buildFeatureImports() {
  const imports: any[] = [];
  for (const [key, enabled] of Object.entries(moduleFactory())) {
    if (enabled) {
      imports.push(FLAG_MODULE[key]);
    }
  }
  return imports;
}
export const CORE_MODULE = [
  CONFIG_MODULE,
  SERVER_STATIC_MODULE,
  StaticfileModule,
  // 外部 redis 缓存  版本一
  CACHE_MODULE,
  //  @SkipThrottle()  跳过速率限制
  //  @Throttle({ default: { limit: 3, ttl: 60000 } }) 装饰器，可用于覆盖全局模块中设置的 limit 和 ttl
  //  @Throttle('medium') // 使用 medium 策略
  // ThrottlerModule.forRoot([
  //   {
  //     name: 'short',
  //     ttl: 1000,
  //     limit: 3,
  //   },
  //   {
  //     name: 'medium',
  //     ttl: 10000,
  //     limit: 20,
  //   },
  //   {
  //     name: 'long',
  //     ttl: 60000,
  //     limit: 100,
  //   },
  // ]),
  PrismaModule,
  HttpModule,
  AuthModule,
  // CaslModule,

  ClsModule.forRoot({
    middleware: {
      mount: true,
      setup: (cls, req) => {
        cls.set('userId', req.headers['x-user-id']);
      },
    },
  }),
  /*
  用法
  private readonly cls: ClsService,
  this.cls.get('userId');

  */
  WinstonLoggerModule,
  // WsModule,
  ...buildFeatureImports(),
];

export const GLOBAL_GUARD = [
  // {
  //   // 全局速率限制   默认全局限流只使用第一个配置项
  //   provide: APP_GUARD,
  //   useClass: ThrottlerGuard,
  // },
  // {
  //   // 全局动态限流   相当于上面 原生 ThrottlerGuard 的  加强版
  //   provide: APP_GUARD,
  //   useClass: DynamicThrottlerGuard,
  // },
  {
    //  全局缓存所有端点  无论什么请求
    provide: APP_INTERCEPTOR,
    useClass: CacheInterceptor, //  自定义 处理  HttpCacheInterceptor
    /*
    内置的缓存拦截器  CacheInterceptor  可以应用在 不同层级上
@Controller()
@UseInterceptors(CacheInterceptor)
export class AppController {
  @Get()
  findAll(): string[] { return [] }
}

启用全局缓存后 依然可以 在 单个接口上 覆盖某些缓存设置  @CacheKey() 和 @CacheTTL()
@Controller()
@CacheTTL(50)
export class AppController {
  @CacheKey('custom_key')
  @CacheTTL(20)
  findAll(): string[] { return [] }
}



    */
  },

  {
    // 全局JWT token校验
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },

  //  全局casl权限校验
  // {
  //   provide: APP_GUARD,
  //   useClass: PoliciesGuard,
  // },

  // {
  //   // 全局权限校验   //  必须放在jwt校验之后  因为需要获取用户身份
  //   provide: APP_GUARD,
  //   useClass: PermissionGuard,
  // },
  // {
  //   provide: APP_FILTER,
  //   useClass: AllExceptionsFilter,
  // },
  //  管道 校验器 其实可以对单个特殊接口的输入数据进行颗粒度控制
  // {
  //   provide: APP_PIPE,
  //   useClass: ValidationPipe,
  // },

  // { provide: APP_INTERCEPTOR, useClass: RequestLogInterceptor }, // 全局启用日志拦截器
];
