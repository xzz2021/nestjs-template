import { AppConfig } from './types';

const config: AppConfig = {
  port: 3000,
  pgDatabaseUrl: 'postgresql://root:xzz...@pgdb:5432/back',
  token: {
    secret: 'xzz2021',
    refreshSecret: 'xzz2022',
    expiresTime: 300,
    refreshExpiresTime: 259200,
  },
  redis: {
    host: 'redisdb',
    port: 6379,
    url: 'redis://redisdb:6379',
  },
  ssoCount: 3,
  swagger: false,
  serverUrl: 'https://api.xzz2021.top',
  frontendUrl: 'https://admin.xzz2021.top',

  n8nHost: 'https://n8n.xzz2021.top',
  staticFileRootPath: 'public',
};

export default config;
