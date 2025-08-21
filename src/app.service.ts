import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from '@nestjs/cache-manager';
import { ModuleRef } from '@nestjs/core';
import { UndiciHttpService } from './utils/http/undici.http.service';

@Injectable() // @Injectable() 装饰器将 AppService 类声明为可由 Nest IoC 容器管理的类。  放入容器  自动管理 实现单例 全局只 new 一次
export class AppService {
  constructor(
    private readonly configService: ConfigService,
    private readonly cacheManager: Cache,
    private readonly moduleRef: ModuleRef,
    private readonly http: UndiciHttpService,
  ) {}
  async getHello(): Promise<string> {
    console.log(this.configService.get('PORT'));
    console.log(this.configService.get('JWT_SECRET'));
    // console.log(this.configService.get('aliPayKey'));
    await this.cacheManager.set('aaaa', 'reyrteyrty');
    return 'Hello World!';
  }

  //  moduleRef  动态获取service服务  // get 获取已注册的服务    create  创建一个类实例（但要有 @Injectable 装饰器）
  doSomething() {
    const service = this.moduleRef.get(ConfigService, { strict: false }); // strict: true（默认）：只能获取当前模块注册的 provider
    console.log(service.get('PORT'));
  }

  async getApi() {
    const res = await this.http.get('https://jsonplaceholder.typicode.com/posts', {
      // responseType: 'text',
      // headers: {
      //   'content-type': 'text/html',
      // },
    });
    return res;
  }
}
