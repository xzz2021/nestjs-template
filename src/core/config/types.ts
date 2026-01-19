// 配置类型定义

export interface AppConfig {
  port: number;
  pgDatabaseUrl: string;
  token: {
    secret: string;
    refreshSecret: string;
    expiresTime: number;
    refreshExpiresTime: number;
  };
  redis: {
    host: string;
    port: number;
    url: string;
  };
  ssoCount: number;
  swagger: boolean;
  serverUrl: string;
  frontendUrl: string;
  n8nHost: string;
  // 静态文件目录
  staticFileRootPath: string;

  // 可以添加更多配置项
  [key: string]: any;
}

// 环境类型
export type Environment = 'development' | 'production' | 'docker';
