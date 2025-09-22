import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createSwagger } from './core/swagger';
import { GLOBAL_VALIDATION_PIPE } from './processor/pipe/global.validation.pipe';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import cookieParser from 'cookie-parser';
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
  if (configService.get<string>('SWAGGER') == 'true') {
    createSwagger(app);
  }

  if (configService.get<string>('HELMET') == 'true') {
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

  const frontendUrl = configService.get<string>('FRONTEND_URL');
  const serverUrl = configService.get<string>('SERVER_URL');
  console.log('frontendUrl--serverUrl', frontendUrl, serverUrl);
  //  重要  origin内的域名结尾一定不能带/  否则请求头会忽略掉origin
  // cookies 携带 跨域
  app.use(cookieParser());
  app.enableCors({
    origin: [frontendUrl, serverUrl],
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
  // app.enableVersioning({ type: VersioningType.URI }); // 版本控制  方法一 需要在所有请求url加上v1 v2 等
  // app.enableVersioning({ type: VersioningType.HEADER, header: 'X-API-Version' }); // 方法二 需要在请求头中加上X-API-Version: v1

  // 通过configService打印  所有环境变量
  // const configService = app.get(ConfigService);
  // console.log(configService);

  /*
  // app.use(cookieParser());

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



    // 允许跨域
  app.enableCors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // 明确允许方法
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'], // 按需配置允许的请求头
  })


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
  const port = process.env.PORT ?? 3000;
  await app.listen(port, () => {
    console.log(`Server is running on: ${configService.get<string>('SERVER_URL')}`);
  });
}

void bootstrap();

/*
核心概念

单独创建的 service 服务  多处调用 会创建多个实例 

而 使用module进行注册 则 只会创建一个实例  service 会放入 容器管理池  实现 单例 模式



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



多个拦截器执行顺序

app.useGlobalInterceptors(
  new AInterceptor(),
  new BInterceptor(),
  new CInterceptor()
);
请求时：A → B → C → Controller

响应时：Controller → C → B → A




User  - Profile  一对一
Post  - Comment 一对多
Post  - Category 多对多 

model User {
  id      Int      @id @default(autoincrement())
  posts   Post[]
  profile Profile?
}

model Profile {
  id     Int  @id @default(autoincrement())
  user   User @relation(fields: [userId], references: [id])
  userId Int  @unique // relation scalar field (used in the `@relation` attribute above)
}

model Post {
  id         Int        @id @default(autoincrement())
  author     User       @relation(fields: [authorId], references: [id])
  authorId   Int // relation scalar field  (used in the `@relation` attribute above)
  categories Category[]
}

model Category {
  id    Int    @id @default(autoincrement())
  posts Post[]
}

//  对同一张表 定义多个  一对多关系  时  会产生歧义 需要设置@relation 的 name  字段

model User {
  id           Int     @id @default(autoincrement())
  name         String?
  writtenPosts Post[]  @relation("WrittenPosts")
  pinnedPost   Post?   @relation("PinnedPost")
}

model Post {
  id         Int     @id @default(autoincrement())
  title      String?
  author     User    @relation("WrittenPosts", fields: [authorId], references: [id])
  authorId   Int
  pinnedBy   User?   @relation("PinnedPost", fields: [pinnedById], references: [id])
  pinnedById Int?    @unique
}


//  显式多对多关系

model Post {
  id         Int                 @id @default(autoincrement())
  title      String
  categories CategoriesOnPosts[]
}

model Category {
  id    Int                 @id @default(autoincrement())
  name  String
  posts CategoriesOnPosts[]
}

model CategoriesOnPosts {
  post       Post     @relation(fields: [postId], references: [id])
  postId     Int // relation scalar field (used in the `@relation` attribute above)
  category   Category @relation(fields: [categoryId], references: [id])
  categoryId Int // relation scalar field (used in the `@relation` attribute above)
  assignedAt DateTime @default(now())
  assignedBy String

  @@id([postId, categoryId])
}




*/
