import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { UndiciHttpService } from './utils/http/undici.http.service';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import maxmind, { CityResponse, CountryResponse } from 'maxmind';
import path from 'path';
@Injectable() // @Injectable() 装饰器将 AppService 类声明为可由 Nest IoC 容器管理的类。  放入容器  自动管理 实现单例 全局只 new 一次
export class AppService {
  private readonly redis: Redis;
  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly moduleRef: ModuleRef,
    private readonly http: UndiciHttpService,
  ) {
    this.redis = this.redisService.getOrThrow();
  }
  getHello() {
    // console.log(this.configService.get('PORT'));
    // console.log(this.configService.get('JWT_SECRET'));
    // // console.log(this.configService.get('aliPayKey'));
    // await this.redis.set('aaaa', 'reyrteyrty');
    return { message: 'Hello World!' };
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

  async getIp(ip: string) {
    // const isValid = maxmind.validate(ip);
    // if (!isValid) {
    //   return { message: 'ip is invalid' };
    // }
    console.log('ip============------===========', ip);
    const filePath = path.join(__dirname, './assets/GeoLite2-City.mmdb');
    const lookup = await maxmind.open<CityResponse>(filePath);
    const ad = lookup.get('112.47.255.103');
    const country = ad?.country?.names['zh-CN'] as string;
    const province = ad?.subdivisions?.[0]?.names['zh-CN'];
    const city = ad?.city?.names['zh-CN'] as string;
    return { address: country + province + city, message: 'success', ad };
  }
}
