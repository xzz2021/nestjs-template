# 项目架构分析文档

## 1. 项目概述

### 1.1 项目定位

这是一个基于 **NestJS 11.0** 构建的后台管理系统模板框架，整合了常用的库和业务功能，包括多数据库支持、字段校验、文件上传等核心功能。项目复杂度较高，采用模块化设计，便于扩展和维护。

### 1.2 核心技术栈

| 技术分类     | 技术选型                     |
| ------------ | ---------------------------- |
| **框架**     | NestJS 11.0                  |
| **ORM**      | Prisma 7.0                   |
| **数据库**   | PostgreSQL / Redis           |
| **对象存储** | MinIO / AWS S3               |
| **认证授权** | JWT / CASL                   |
| **日志系统** | Winston / Morgan             |
| **任务调度** | BullMQ / Cron                |
| **部署方案** | Docker / Nginx Proxy Manager |

### 1.3 项目结构

```
nestjs-template/
├── src/                    # 源代码目录
│   ├── core/              # 核心配置模块
│   ├── prisma/            # 数据库ORM模块
│   ├── processor/         # 处理器模块（守卫/拦截器/管道/过滤器等）
│   ├── table/             # 业务表模块（RBAC/字典/认证等）
│   ├── utils/             # 工具模块
│   ├── staticfile/        # 静态资源管理模块
│   ├── app.module.ts      # 应用根模块
│   └── main.ts            # 应用入口文件
├── assets/                # 项目静态资源
├── public/                # 静态资源托管目录
├── dist/                  # 编译输出目录
└── logs/                  # 日志文件目录
```

---

## 2. 核心模块分析

### 2.1 Core 模块 (`src/core/`)

核心配置模块，负责应用的基础配置和初始化。

#### 2.1.1 模块组成

- **`config/`** - 环境配置管理
  - `index.ts` - 配置模块导出
  - `development.ts` - 开发环境配置
  - `production.ts` - 生产环境配置
  - `docker.ts` - Docker环境配置
  - `types.ts` - 配置类型定义

- **`app.core.ts`** - 核心模块集合
  - 导出 `CORE_MODULE` - 核心模块数组
  - 导出 `GLOBAL_GUARD` - 全局守卫/拦截器/过滤器配置

- **`swagger.ts`** - Swagger API文档配置
  - 支持Basic认证保护
  - 自动生成API文档

- **`server.static.ts`** - 静态资源服务配置

- **`socket.adapter.ts`** - WebSocket适配器（支持Redis多节点）

#### 2.1.2 核心功能

```typescript
// CORE_MODULE 包含的模块
export const CORE_MODULE = [
  CONFIG_MODULE, // 配置模块（全局）
  SERVER_STATIC_MODULE, // 静态资源模块
  StaticfileModule, // 静态文件管理（全局）
  REDIS_MODULE, // Redis缓存模块
  ThrottlerModule, // 限流模块（基于Redis）
  ScheduleTaskModule, // 任务调度模块（全局）
  PrismaModule, // Prisma数据库模块（全局）
  UtilsModule, // 工具模块（全局）
  WinstonLoggerModule, // 日志模块（全局）
  CaptchaModule, // 验证码模块（全局）
  MinioClientModule, // MinIO客户端模块
  HealthModule, // 健康检查模块
];
```

### 2.2 Prisma 模块 (`src/prisma/`)

数据库ORM模块，提供全局数据库服务。

#### 2.2.1 模块特点

- **全局模块** (`@Global()`)，所有模块可直接注入使用
- 支持多数据库连接（PostgreSQL为主）
- 提供 `PgService` 作为数据库服务提供者

#### 2.2.2 核心服务

- `PgService` - PostgreSQL数据库服务
- `PrismaService` - Prisma客户端服务
- `MysqlService` - MySQL数据库服务（可选）

### 2.3 Processor 模块 (`src/processor/`)

处理器模块，包含所有请求处理相关的组件。

#### 2.3.1 模块结构

```
processor/
├── constants/          # 常量定义
│   ├── cache.ts       # 缓存相关常量
│   ├── error-code.ts  # 错误码定义
│   ├── oss.ts         # OSS相关常量
│   ├── response.ts    # 响应相关常量
│   └── system.ts      # 系统常量
├── decorator/         # 装饰器
│   ├── captcha.ts     # 验证码装饰器
│   ├── casl.ts        # CASL权限装饰器
│   ├── dto.ts         # DTO装饰器
│   ├── permission.ts # 权限装饰器
│   ├── public.ts      # 公开路由装饰器
│   ├── serialize.ts   # 序列化装饰器
│   └── ...
├── enum/              # 枚举定义
├── exception/         # 异常定义
├── filter/            # 异常过滤器
│   ├── all-exceptions.filter.ts  # 全局异常过滤器
│   ├── http-exception.filter.ts  # HTTP异常过滤器
│   └── prisma.exception.ts       # Prisma异常过滤器
├── guard/             # 守卫
│   ├── jwt-auth.ts           # JWT认证守卫
│   ├── jwt-refresh.ts        # JWT刷新守卫
│   ├── rt-jwt-auth.ts        # 双Token认证守卫
│   ├── permission.ts         # 权限守卫
│   ├── captcha.ts            # 验证码守卫
│   ├── global-throttler.ts  # 全局限流守卫
│   └── ...
├── interceptor/       # 拦截器
│   ├── transform.ts          # 响应转换拦截器
│   ├── operation.log.ts      # 操作日志拦截器
│   ├── http.cache.ts         # HTTP缓存拦截器
│   ├── http.timeout.ts       # 超时拦截器
│   └── ...
├── middleware/        # 中间件
├── pipe/              # 管道
│   ├── global.validation.pipe.ts  # 全局验证管道
│   ├── file.pipe.ts               # 文件验证管道
│   └── ...
└── utils/             # 工具函数
```

#### 2.3.2 全局配置

在 `app.core.ts` 中配置的全局处理器：

```typescript
export const GLOBAL_GUARD = [
  // 全局限流守卫
  { provide: APP_GUARD, useClass: GlobalThrottlerGuard },

  // 全局JWT认证守卫（双Token）
  { provide: APP_GUARD, useClass: RtJwtAuthGuard },

  // 全局操作日志拦截器
  { provide: APP_INTERCEPTOR, useClass: OperationLogInterceptor },

  // 全局响应转换拦截器
  { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },

  // 全局异常过滤器
  { provide: APP_FILTER, useClass: AllExceptionsFilter },
];
```

### 2.4 Table 模块 (`src/table/`)

业务表模块，实现RBAC权限模型和基础业务功能。

#### 2.4.1 模块组成

| 模块                 | 功能描述                        |
| -------------------- | ------------------------------- |
| **AuthModule**       | 认证模块（登录/注册/Token刷新） |
| **UserModule**       | 用户管理模块                    |
| **RoleModule**       | 角色管理模块                    |
| **PermissionModule** | 权限管理模块                    |
| **MenuModule**       | 菜单管理模块                    |
| **DepartmentModule** | 部门管理模块                    |
| **DictionaryModule** | 字典管理模块                    |
| **CaslModule**       | CASL权限控制模块                |

#### 2.4.2 认证模块详解

**AuthModule** 是核心认证模块，实现以下功能：

- **双Token机制**
  - Access Token (JWT) - 存储在Header，用于常规接口认证
  - Refresh Token (RT) - 存储在Cookie，用于Token刷新

- **多点登录控制**
  - `TokenService` - Token白名单管理
  - 支持强制下线功能

- **登录锁定机制**
  - `LockoutService` - 登录失败次数限制
  - 支持后台解锁功能

- **认证策略**
  - `JwtStrategy` - JWT认证策略
  - `JwtRefreshStrategy` - Refresh Token策略

### 2.5 Utils 模块 (`src/utils/`)

工具模块集合，提供各种通用功能服务。

#### 2.5.1 核心工具模块

| 模块                    | 功能                       | 全局性  |
| ----------------------- | -------------------------- | ------- |
| **UtilsModule**         | SSH/HTTP/IP解析/服务器信息 | ✅ 全局 |
| **WinstonLoggerModule** | Winston日志服务            | ✅ 全局 |
| **CaptchaModule**       | 图形验证码生成             | ✅ 全局 |
| **ScheduleTaskModule**  | 定时任务调度               | ✅ 全局 |
| **CacheModule**         | Redis缓存服务              | -       |
| **MinioClientModule**   | MinIO对象存储              | -       |
| **HealthModule**        | 健康检查                   | -       |
| **JobModule**           | 任务队列（BullMQ）         | -       |
| **SseModule**           | 服务端推送（SSE）          | -       |
| **PaymentModule**       | 支付服务（支付宝/微信）    | -       |

#### 2.5.2 工具服务

- **邮件服务** - `mail.service.ts` (Nodemailer)
- **短信服务** - `alisms.service.ts` (阿里云短信)
- **支付服务** - `payment/` (支付宝/微信支付)
- **文件服务** - `minio/` (MinIO/S3)
- **SSH服务** - `ssh.service.ts`
- **Excel服务** - `excel.service.ts`
- **顺丰服务** - `sf.service.ts` (物流下单)

### 2.6 Staticfile 模块 (`src/staticfile/`)

静态资源管理模块，提供文件上传、下载、管理功能。

- **全局模块**，所有模块可直接使用
- 支持文件上传、下载、删除
- 集成Multer处理文件上传

---

## 3. 模块依赖关系

### 3.1 模块依赖图

```
┌─────────────────────────────────────────────────────────┐
│                    AppModule (根模块)                    │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
┌───────────────────┐            ┌──────────────────┐
│   CORE_MODULE     │            │ CORE_TABLE_MODULE │
└───────────────────┘            └──────────────────┘
        │                                   │
        ├─ CONFIG_MODULE                    ├─ AuthModule
        ├─ SERVER_STATIC_MODULE             ├─ UserModule
        ├─ StaticfileModule                 ├─ RoleModule
        ├─ REDIS_MODULE                     ├─ PermissionModule
        ├─ ThrottlerModule                  ├─ MenuModule
        ├─ ScheduleTaskModule (Global)      ├─ DepartmentModule
        ├─ PrismaModule (Global)            ├─ DictionaryModule
        ├─ UtilsModule (Global)             └─ CaslModule
        ├─ WinstonLoggerModule (Global)
        ├─ CaptchaModule
        ├─ MinioClientModule
        └─ HealthModule
```

### 3.2 全局模块说明

以下模块使用 `@Global()` 装饰器，可在任何模块中直接注入：

1. **PrismaModule** - 数据库服务
2. **UtilsModule** - 工具服务（SSH/HTTP/IP解析等）
3. **WinstonLoggerModule** - 日志服务
4. **ScheduleTaskModule** - 任务调度服务

### 3.3 依赖注入流程

```
请求流程：
HTTP Request
    ↓
[中间件 Middleware]
    ↓
[守卫 Guard] - JWT认证 → 权限校验
    ↓
[拦截器 Interceptor] - 日志记录 → 响应转换
    ↓
[管道 Pipe] - 数据验证 → 数据转换
    ↓
[控制器 Controller]
    ↓
[服务 Service] - 业务逻辑处理
    ↓
[Prisma Service] - 数据库操作
    ↓
HTTP Response
```

### 3.4 全局处理器执行顺序

1. **GlobalThrottlerGuard** - 限流守卫（基于Redis）
2. **RtJwtAuthGuard** - JWT认证守卫（双Token）
3. **OperationLogInterceptor** - 操作日志拦截器
4. **TransformInterceptor** - 响应转换拦截器
5. **AllExceptionsFilter** - 全局异常过滤器

---

## 4. 架构设计特点

### 4.1 模块化设计

- **单一职责原则** - 每个模块负责特定功能
- **高内聚低耦合** - 模块间通过依赖注入通信
- **可扩展性** - 新功能通过新增模块实现

### 4.2 依赖注入模式

- 使用NestJS内置的依赖注入容器
- 支持构造函数注入、属性注入
- 支持动态模块和异步提供者

### 4.4 请求处理链

NestJS请求处理链的执行顺序：

```
1. 中间件 (Middleware)
2. 守卫 (Guard) - 认证/授权
3. 拦截器 (Interceptor) - 前置处理
4. 管道 (Pipe) - 数据验证/转换
5. 控制器 (Controller) - 路由处理
6. 服务 (Service) - 业务逻辑
7. 拦截器 (Interceptor) - 后置处理（响应转换）
8. 异常过滤器 (Exception Filter) - 异常处理
```

### 4.5 配置管理

- 环境隔离 - 开发/生产/Docker环境配置分离
- 类型安全 - TypeScript类型定义
- 集中管理 - 统一配置入口

---

## 5. 技术实现细节

### 5.1 认证授权机制

#### 5.1.1 双Token认证

```typescript
// Access Token (JWT)
- 存储位置: HTTP Header (Authorization: Bearer <token>)
- 用途: 常规接口认证
- 有效期: 较短（如3天）

// Refresh Token (RT)
- 存储位置: HTTP Cookie
- 用途: Token刷新
- 有效期: 较长（如7天）
```

#### 5.1.2 多点登录控制

- **TokenService** 维护Token白名单（Redis）
- 支持同一用户多个设备登录
- 支持强制下线功能
- 登录时生成唯一Token ID，存储在Redis

#### 5.1.3 登录锁定机制

- **LockoutService** 记录登录失败次数
- 超过阈值后锁定账户
- 支持后台管理员解锁
- 锁定信息存储在Redis

#### 5.1.4 CASL权限控制

- 基于属性的访问控制（ABAC）
- 支持细粒度权限控制
- 可扩展的权限规则定义

### 5.2 数据库连接

#### 5.2.1 Prisma ORM

- **类型安全** - 自动生成TypeScript类型
- **迁移管理** - 版本化数据库迁移
- **查询优化** - 支持连接池、事务
- **多数据库支持** - PostgreSQL为主，支持MySQL

#### 5.2.2 连接池配置

- 自动管理数据库连接
- 支持连接池大小配置
- 自动重连机制

### 5.3 缓存策略

#### 5.3.1 Redis缓存

- **多实例支持** - 可配置多个Redis实例
- **命名空间** - 不同业务使用不同命名空间
- **自动重连** - 断线自动重连机制
- **Pipeline优化** - 自动Pipeline降低延迟

#### 5.3.2 缓存应用场景

- Token白名单管理
- 登录锁定信息
- 限流计数器
- 数据缓存（可选）

### 5.4 文件存储

#### 5.4.1 MinIO对象存储

- S3兼容的API
- 支持分片上传
- 支持文件加密
- 支持预签名URL

#### 5.4.2 AWS S3支持

- 支持AWS S3存储
- 支持预签名URL生成
- 支持大文件上传

### 5.5 日志系统

#### 5.5.1 Winston日志

- **多传输方式** - 控制台/文件/数据库
- **日志级别** - Error/Warn/Info/Debug
- **日志轮转** - 按日期自动轮转
- **格式化** - 自定义日志格式

#### 5.5.2 操作日志

- **OperationLogInterceptor** 自动记录操作日志
- 记录用户操作、IP地址、请求参数等
- 支持日志查询和分析

### 5.6 任务调度

#### 5.6.1 Cron定时任务

- 基于 `@nestjs/schedule`
- 支持Cron表达式
- 支持任务启停控制

#### 5.6.2 BullMQ任务队列

- 基于Redis的分布式任务队列
- 支持任务重试
- 支持任务优先级
- 支持任务延迟执行

### 5.7 限流机制

#### 5.7.1 全局限流

- 基于Redis的分布式限流
- IP级别限流
- 可配置限流策略
- 支持跳过限流装饰器

#### 5.7.2 限流配置

### 5.8 异常处理

#### 5.8.1 全局异常过滤器

- **AllExceptionsFilter** 统一处理所有异常
- 自动转换异常为HTTP响应
- 记录异常日志
- 返回统一错误格式

#### 5.8.2 Prisma异常处理

- 捕获Prisma特定异常
- 转换为友好的HTTP状态码
- 提供详细的错误信息

---

## 6. 数据流图

### 6.1 用户认证流程

```
用户登录
    ↓
验证用户名密码
    ↓
检查登录锁定状态
    ↓
生成Access Token + Refresh Token
    ↓
Token存入Redis白名单
    ↓
返回Token给客户端
```

### 6.2 请求处理流程

```
HTTP请求
    ↓
限流检查 (GlobalThrottlerGuard)
    ↓
JWT认证 (RtJwtAuthGuard)
    ↓
权限检查 (PermissionGuard - 可选)
    ↓
操作日志记录 (OperationLogInterceptor)
    ↓
数据验证 (ValidationPipe)
    ↓
业务处理 (Controller → Service)
    ↓
响应转换 (TransformInterceptor)
    ↓
返回HTTP响应
```

### 6.3 Token刷新流程

```
客户端发送Refresh Token (Cookie)
    ↓
验证Refresh Token有效性
    ↓
检查Token是否在白名单
    ↓
生成新的Access Token + Refresh Token
    ↓
旧Token从白名单移除
    ↓
新Token加入白名单
    ↓
返回新Token给客户端
```

---

## 7. 扩展点

### 7.1 添加新业务模块

1. 在 `src/table/` 下创建新模块目录
2. 实现 `Module`、`Controller`、`Service`
3. 在 `src/table/app.table.ts` 中注册模块
4. 自动集成到应用

### 7.2 添加新工具服务

1. 在 `src/utils/` 下创建服务文件
2. 如需全局使用，创建Module并标记 `@Global()`
3. 在 `src/core/app.core.ts` 中注册

### 7.3 自定义守卫/拦截器

1. 在 `src/processor/guard/` 或 `src/processor/interceptor/` 下创建
2. 在 `src/core/app.core.ts` 的 `GLOBAL_GUARD` 中注册
3. 或使用装饰器在特定路由使用

---

## 8. 总结

### 8.1 架构优势

1. **模块化设计** - 清晰的模块划分，易于维护和扩展
2. **类型安全** - 全面使用TypeScript，提供类型检查
3. **功能完整** - 集成认证、授权、日志、缓存等常用功能
4. **可扩展性** - 支持插件式扩展，便于添加新功能
5. **生产就绪** - 包含异常处理、限流、日志等生产环境必需功能

### 8.2 技术亮点

1. **双Token认证** - 提高安全性，支持无感刷新
2. **多点登录控制** - 灵活的登录管理策略
3. **分布式限流** - 基于Redis的分布式限流
4. **操作日志** - 完整的操作审计功能
5. **多数据库支持** - 灵活的数据库选择

### 8.3 适用场景

- 后台管理系统
- 企业级应用
- 需要完整RBAC权限控制的应用
- 需要高可扩展性的项目
