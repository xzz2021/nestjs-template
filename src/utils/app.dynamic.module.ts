/*
动态模块 原理  
  1. register静态方法接收options, 再通过providers 注入 常量名  CONFIG_OPTIONS 
  2. service  通过 常量名 CONFIG_OPTIONS 依赖注入 获取  options  参数

  ====ConfigService==========

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { Injectable, Inject } from '@nestjs/common';
import { EnvConfig } from './interfaces';

@Injectable()
export class ConfigService {
  private readonly envConfig: EnvConfig;

  constructor(@Inject('CONFIG_OPTIONS') private options: Record<string, any>) {
    const filePath = `${process.env.NODE_ENV || 'development'}.env`;
    const envFile = path.resolve(__dirname, '../../', options.folder, filePath);
    this.envConfig = dotenv.parse(fs.readFileSync(envFile));
  }

  get(key: string): string {
    return this.envConfig[key];
  }
}




=====ConfigModule==========

import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { DepartmentModule } from './src/table/department/department.module';
import { CaslModule } from './casl/casl.module';

@Module({})
export class ConfigModule {
  static register(options: Record<string, any>): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        {
          provide: 'CONFIG_OPTIONS',
          useValue: options,
        },
        ConfigService,
      ],
      exports: [ConfigService],
    };
  }
}



*/

/*
  控制   注入范围  作用域
  
  不建议滥用
  

| Scope 类型          | 创建次数      | 生命周期说明                         | 适用场景               |
| ----------------- | --------- | ------------------------------ | ------------------ |
| `DEFAULT`（默认）     | 全应用只创建一次  | 单例，全局唯一                        | 大多数服务、数据库连接、配置服务等  |
| `Scope.REQUEST`   | 每个请求创建一次  | Nest 每次收到 HTTP 请求都会 new 一个新的实例 | 多租户、权限隔离、请求上下文相关逻辑 |
| `Scope.TRANSIENT` | 每次注入都创建一次 | 谁用我我就 new 一次                   | 动态多实例服务、临时状态依赖     |


@Injectable({ scope: Scope.REQUEST })




*/
