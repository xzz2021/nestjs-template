import { AppConfig } from './types';

const config: AppConfig = {
  port: 3000,
  pgDatabaseUrl: 'postgresql://root:xzz...@localhost:5432/newback',
  token: {
    secret: 'xzz2021',
    refreshSecret: 'xzz2022',
    expiresTime: 300,
    refreshExpiresTime: 259200,
  },
  redis: {
    host: 'localhost',
    port: 6379,
    url: 'redis://localhost:6379',
  },
  ssoCount: 3,
  swagger: true,
  serverUrl: 'http://localhost:3000',
  frontendUrl: 'http://localhost:4173',
  n8nHost: 'https://n8n.xzz2021.top',
  staticFileRootPath: 'public',
  // featureXEnabled: true,  // 可以轻松启用/禁用功能
  // 开发环境可以添加更多调试选项
  // debugMode: true,
  // logLevel: 'debug',
};

export default config;
