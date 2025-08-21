import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CORE_MODULE, GLOBAL_GUARD } from './core/app.core';
import { TABLE_MODULE } from './core/app.table';
// import { WsGateway } from './ws/ws.gateway';

@Module({
  imports: [...CORE_MODULE, ...TABLE_MODULE],
  controllers: [AppController],
  providers: [AppService, ...GLOBAL_GUARD],
  // providers: [AppService, ...GLOBAL_GUARD, WsGateway],  //  如果需要使用websocket 网关 需要在这里引入
  // 只有子模块MODULE 需要exports  这样其他模块导入后才能使用到 导出的service
  // exports: [AppService], //  导出  AppService 服务   也可以写成 'CUSTOM_APP_SERVICE'  以便其他模块可以注入使用
  /*
 providers: [AppService],  完整语法其实是
 providers: [
  {
    provide: AppService,   // 此处也可以使用指定的常量名称来定义 比如  useValue: 'CUSTOM_APP_SERVICE'     //  constructor(@Inject('CONNECTION') connection: Connection) {}
    useClass: AppService,  //  此处通过指定使用的类可用实现3点功能  1. 使用自定义的类   2.  项重复使用某个类   3.  使用模拟版本覆盖一个类进行测试
  },
];

useClass : process.env.NODE_ENV === 'development' ? DevelopmentConfigService : ProductionConfigService,  // 可以动态传入不同的实例


//  动态注入  依赖项 需 使用inject 注入  useFactory的形参才能接收到
{
  provide: 'CONNECTION',
  useFactory: (optionsProvider: MyOptionsProvider) => {
    const options = optionsProvider.get();
    return new DatabaseConnection(options);
  },
  inject: [MyOptionsProvider, { token: 'SomeOptionalProvider', optional: true }],
  //       \______________/             \__________________/
  //        This provider                The provider with this token
  //        is mandatory.                can resolve to `undefined`.
};


provide   可以提供任何值
{
  provide: 'CONFIG',
  useFactory: () => {
    return process.env.NODE_ENV === 'development' ? devConfig : prodConfig;
  },
};




异步provider   

{
  provide: 'ASYNC_CONNECTION',
  useFactory: async () => {
    const connection = await createConnection(options);
    return connection;
  },
}
  */
})
export class AppModule {}

/*

@Module() 装饰器中没有中间件的位置。相反，我们使用模块类的 configure() 方法来设置它们。包含中间件的模块必须实现 NestModule 接口。

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('cats');   //  控制  CatsController 的 所有路由

      .forRoutes({ path: 'cats', method: RequestMethod.GET });  // 限制中间件仅用于特定的请求方法  GET 请求
  }
}

*/

/*
动态模块

@Module({
  imports: [ConfigModule.register({ folder: './config' })],
  controllers: [AppController],
  providers: [AppService],
})

//  本质是 暴露一个静态方法  传入参数后返回当前module  导出的是 一个动态模块

@Module({})
export class ConfigModule {
  static register(): DynamicModule {
    return {
      module: ConfigModule,
      providers: [ConfigService],
      exports: [ConfigService],
    };
  }
}

*/
