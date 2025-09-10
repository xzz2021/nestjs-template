### 框架架构

#### 运行说明

1. 这是一个基于nestjs-cli生成的模板框架,整合了常用的库和业务功能, 多数据库, 字段校验, 文件上传等, 复杂度较高, 后期会逐渐优化成flag配置式, 减轻使用者的心智负担
2. 前置条件:
   > 准备好数据库, 执行`pnpm i`安装依赖, `pnpm prisma:push`生成表, `pnpm prisma:generate`生成prisma客户端, `pnpm prisma:seed`生成菜单种子数据
   >
   > 运行 `pnpm prepare` 生成husky
   >
   > `pnpm dev`启动项目

#### 必备功能定位

- [√] 环境变量配置
- [√] redis缓存
- [√] swagger自动文档
- [√] 版本控制
- [√] 静态资源/文件上传/流文件
- [√] 架构基础(中间件/守卫/拦截器/管道/控制器/服务/过滤器-异常捕获处理)
- [√] 任务调度(定时/队列)
- [√] ORM与连接池及多数据库
- [√] DTO校验/序列化/反序列化
- [√] websocket通信(socket.io)
- [ x ] 安全限制(限流/幂等/串行)
- [ x ] 认证与授权(JWT+RBAC+CASL)
- [ x ] 日志系统(操作√埋点审计)
- [ x ] OSS文件管理(分片/上传/下载)

#### 小功能点实现

- [√] 多点登录限制,强制下线
- [√] 登录失败锁定,后台解锁
- [ x ] 双token
- [ x ] 高频限流guard

#### 待深入学习

1. 多租户/分库分表
2. 任务调度
3. Cookie和Session
4. GraphQL
5. WebSocket
6. Microservices
7. swagger-cli
8. prisma官方文档
9. 流程引擎
10. 日志审计(操作/接口访问)
11. 系统监控
12. 数据可视化
13. 消息通知(邮件/站内/报表)
14. 内容管理(富文本/文件/excel)
15. 多语言

#### 开发历程

1. 核心依赖

   > 环境变量配置: `@nestjs/config`  
   > Joi验证器: `joi`  
   > 自定义环境变量: `cross-env`  
   > 缓存功能: `@nestjs/cache-manager` `cache-manager`  
   > redis缓存: `@liaoliaots/nestjs-redis` `ioredis`
   > 接口文档: `@nestjs/swagger` `basic-auth` `@types/basic-auth`  
   > 静态资源托管及文件上传: `@nestjs/serve-static` `@types/multer`  
   > 任务和队列: `@nestjs/schedule` `cron` `@nestjs/bullmq` `bullmq`  
   > 安全速率限制: `@nestjs/throttler`  
   > websocket通信: `@nestjs/websockets` `@nestjs/platform-socket.io` `socket.io`  
   > swc快速编译: `@swc/cli` `@swc/core`  
   > ALS异步调用链私有上下文存储: `nestjs-cls`  
   > 系统日志: `winston` `nest-winston` `winston-daily-rotate-file` `winston-transport` `morgan` `@types/morgan`

2. 外部业务依赖

   > 邮件服务: `nodemailer`  
   > 阿里云短信:`@alicloud/dysmsapi20170525` `@alicloud/openapi-client` `@alicloud/tea-util`  
   > ssh连接远程服务器: `node-ssh`  
   > ORM平台prisma: `@prisma/client` `prisma`  
   > 字段转换与校验: `class-validator` `class-transformer`  
   > DTO自动生成: `prisma-class-generator`  
   > Cookies: `cookie-parser` `@types/cookie-parser`  
   > HTTP请求: `undici` `@nestjs/axios` `axios`  
   > JWT认证和权限: `@nestjs/passport` `@nestjs/jwt` `passport-jwt`  
   > CASL权限: `@casl/ability` `@casl/prisma`  
   > 支付加密: `argon2`  
   > 安全防护: `helmet` `csrf-csrf` `cookie-parser`  
   > 支付宝api: `alipay-sdk`
   > 验证码生成: `svg-captcha`

#### 注意事项

1. 自定义多数据库连接时,需要配置nest-cli.json文件,将自定义client输出目录进行设置,否则打包dist内会缺少client(路径不需要src,因为打包入口就是src)
2. 如果`npx prisma push`出现警告会重置数据库, 一定要取消; 如果是字段冲突, 可以尝试删除冲突表, 再重新生成,避免影响整个数据库;

#### 开发功能笔记

1. 多点登录: TokenService实现白名单签发及剔除, JwtGuard校验白名单
2. 登录锁定: LockoutService实现登录失败多次锁定

#### 系统设计要点

ERP系统:

> 1.  人力资源(员工档案/招聘/考勤/薪资/培训与绩效)
> 2.  财务(总账/应收应付/资产/报表)
> 3.  采购(申请/订单/供应商/合同/流程)
> 4.  生产(物料/bom/工单/车间/设备/品控)
> 5.  仓储(入出库/盘点/条码/预警)
> 6.  销售与客户(订单/客户/报价单/物流)
> 7.  报表(数据分析统计/文档导出)
> 8.  项目(计划/任务/成本/进度)

找到你喜欢并擅长的那件事

#### 代码规范

1. 异常抛出,一律使用nest内置封装好的函数, 这样可以在全局统一捕获处理

- BadRequestException (400): 请求参数不合法，例如缺少必填字段、类型错误、非法输入。

- UnauthorizedException (401): 需要认证但未提供凭证，或凭证无效。

- ForbiddenException (403): 已认证但没有权限访问资源。

- NotFoundException (404): 请求的资源不存在。

- RequestTimeoutException (408): 客户端请求超时。

- ConflictException (409): 请求和当前状态冲突。

- GoneException (410): 请求的资源已永久移除。

- InternalServerErrorException (500): 通用错误，表示服务器内部异常。

- ServiceUnavailableException (503): 服务不可用，可能宕机或过载。

2. 返回前端数据格式保持一致

   ```ts
   interface ResData {
     code: number;
     data: any;
     message: string;
     timestamp: Date;
   }
   ```
