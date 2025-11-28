import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { createSwagger } from './core/swagger';
import { GLOBAL_VALIDATION_PIPE } from './processor/pipe/global.validation.pipe';
// import { AllExceptionsFilter } from './processor/filter/exceptions';
// import { VersioningType } from '@nestjs/common';
// =============csfr防攻击 跨站请求伪造=========
// import * as cookieParser from 'cookie-parser';
// import { doubleCsrf } from 'csrf-csrf';
async function bootstrap() {
  /*
  https用法
        const httpsOptions = {
          key: fs.readFileSync('./secrets/private-key.pem'),
          cert: fs.readFileSync('./secrets/public-certificate.pem'),
        };
        const app = await NestFactory.create(AppModule, {
          httpsOptions,
        });

*/

  const app = await NestFactory.create(AppModule);
  // 修复：INestApplication 没有 set 方法，使用 express 实例设置 trust proxy     反向代理/CDN 后必开
  app.getHttpAdapter().getInstance().set('trust proxy', true);

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER)); // 使用winston替换掉nest内置日志
  // app.setGlobalPrefix('api');
  const configService = app.get(ConfigService);
  if (configService.get<boolean>('swagger')) {
    createSwagger(app);
  }

  if (configService.get<boolean>('helmet')) {
    app.use(
      helmet({
        crossOriginEmbedderPolicy: false,
        contentSecurityPolicy: {
          directives: {
            imgSrc: [`'self'`, 'data:', '*'],
            scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
            manifestSrc: [`'self'`, 'apollo-server-landing-page.cdn.apollographql.com'],
            frameSrc: [`'self'`, 'sandbox.embed.apollographql.com'],
          },
        },
        crossOriginResourcePolicy: { policy: 'cross-origin' }, // 加这一行才能加载图片资源
      }),
    );
  }

  const frontendUrl = configService.get<string>('frontendUrl');
  const serverUrl = configService.get<string>('serverUrl');
  const n8nUrl = configService.get<string>('n8nHost');
  // console.log('frontendUrl--serverUrl--n8nUrl', frontendUrl, serverUrl, n8nUrl);
  //  重要  origin内的域名结尾一定不能带/  否则请求头会忽略掉origin
  // cookies 携带 跨域
  app.use(cookieParser());
  app.enableCors({
    origin: [frontendUrl, serverUrl, n8nUrl],
    credentials: true,
    vary: ['origin'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  });

  /*

  // 创建日志流
  const logStream = fs.createWriteStream(path.join(__dirname, '..', 'logs', 'access.log'), {
    flags: 'a',
  });
  app.use(
    morgan('combined', {
      stream: logStream,
    }),
  );

  */
  // app.use(morganMiddleware); // 启用 Morgan + Winston 日志流

  // app.useGlobalFilters(new AllExceptionsFilter()); //  全局异常过滤器

  /*
  版本控制 方案
 app.enableVersioning({ type: VersioningType.URI }); //  方法一 需要在所有请求url加上v1 v2 等
 app.enableVersioning({ type: VersioningType.HEADER, header: 'X-API-Version' }); // 方法二 需要在请求头中加上X-API-Version: v1
*/
  // 通过configService打印  所有环境变量
  // const configService = app.get(ConfigService);
  // console.log(configService);

  /*


  const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
    getSecret: () => 'csf-secret', // 可选传递 secret 或自定义策略
    getSessionIdentifier: req => req.headers['x-csrf-token'], // 默认为 header
  });

  app.use(doubleCsrfProtection); // 全局中间件保护 POST/PUT/DELETE
  // 或针对某些路由用 app.use('/api', doubleCsrfProtection)

  // 可用于需要手动生成 token 的场景
  app.use((req, res, next) => {
    res.cookie(
      'XSRF-TOKEN',
      generateCsrfToken(res, 'XSRF-TOKEN', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30,
      }),
    );
    next();
  });


    支持 多节点共享消息 的自定义适配器  支持多实例/分布式部署
  app.useWebSocketAdapter(new RedisIoAdapter(app))



  //  前端Axios 示例
  function getCsrfToken() {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];
}
axios.post('/api/resource', data, {
  headers: { 'X-CSRF-TOKEN': getCsrfToken() },
  withCredentials: true,
});

  app.useStaticAssets({ root: path.join(__dirname, '..', 'public') })

  */

  app.useGlobalPipes(GLOBAL_VALIDATION_PIPE); // 全局类转换校验  定义了dto的会自动转换
  const port = configService.get<number>('port') as number;
  await app.listen(port, () => {
    console.log(`Server is running on: ${serverUrl} port: ${port}`);
  });
}

void bootstrap();

/*
核心概念

单独创建的 service 服务  多处调用 会创建多个实例 
而 使用module进行注册 的 service 会放入 容器管理池  实现 单例 模式


Execution context 执行上下文  用于在 守卫（Guard）、拦截器（Interceptor）、异常过滤器（Exception Filter） 等生命周期钩子
  
context.getClass();        // 当前处理的 controller 类
context.getHandler();      // 当前处理的方法（handler）
context.getArgs();         // 所有原始参数（如 req, res 等）
context.switchToHttp();    // 用于 HTTP 请求场景
context.switchToRpc();     // 用于微服务场景
context.switchToWs();      // 用于 WebSocket 场景


cookies使用

@Get()
findAll(@Req() request: Request) {
  console.log(request.cookies); // or "request.cookies['cookieKey']"
  // or console.log(request.signedCookies);
}
 
@Get()
findAll(@Res({ passthrough: true }) response: Response) {
  response.cookie('key', 'value')
}


单向的HTTP协议的类websocket 广播 sse技术 可以实现 服务端主动推送数据到客户端(浏览器原生支持)


@Sse('sse')
sse(): Observable<MessageEvent> {
  return interval(1000).pipe(map((_) => ({ data: { hello: 'world' } })));
}



高德天气

export const getWeatherApi = (params: Partial<WeatherParams>) => {
  const key = 'ec5077777baeeeafeb5f42573'
  const extensions = 'all'
  const output = 'JSON'
  return request.get<WeatherResponse>({
    url: 'weather/v3/weather/weatherInfo',
    params: {
      key,
      extensions,
      output,
      ...params
    }
  })
}

export const getLocationApi = () => {
  return request.get({
    url: 'weather/v3/ip',
    params: {
      key: 'ec50177777eafeb5f42573'
    }
  })
}



CASL 权限控制


AbilityFactory → 定义“谁能干什么”；

Decorator → 声明“这个接口要谁干什么”；  等于 检查  是否有 当前指定的 权限

Guard → 执行“拿到资源→校验→异常/放行”。



改价策略   封装一个 can函数  从user信息提取出role或permission 拿到允许的折扣信息


const rules = [
  {
    action: 'update',
    subject: 'OrderInfo',
    condition: (user, order, dto) => {
      if (dto.price !== undefined) {
        return dto.price >= order.price * user.minDiscount;
      }
      return true;
    },
  },
];


function can(action: string, subject: string, user: IUser, resource: any, dto: any): boolean {
  const matchedRules = rules.filter(r => r.action === action && r.subject === subject);
  return matchedRules.every(rule => rule.condition(user, resource, dto));
}



每个中间件或拦截器都会引入一些处理开销。最好谨慎使用它们，并尽可能将多个拦截器合并成一个精简高效的拦截器。

拦截器封装了请求处理，可以修改输入/输出。如果使用拦截器，请尽量保持轻量级。始终避免覆盖响应，这是使用拦截器时常见的陷阱。

多个拦截器执行顺序

app.useGlobalInterceptors(
  new AInterceptor(),
  new BInterceptor(),
  new CInterceptor()
);
请求时：A → B → C → Controller

响应时：Controller → C → B → A


// 重要功能  ---  事件发射器

内置发布/订阅模式

@Injectable()
export class NotificationService {
  constructor(private eventEmitter: EventEmitter2) {}

  sendNotification(data: string) {
    this.eventEmitter.emit('notification', data);
  }
}


延迟加载模块
import { Module, DynamicModule } from '@nestjs/common';
import { LazyService } from './lazy.service';

@Module({})
export class LazyModule {
  static forRoot(): DynamicModule {
    return {
      module: LazyModule,
      providers: [LazyService], 
      exports: [LazyService], 
    };
  }
}



*/
