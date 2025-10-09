import { AppConfig } from './types';

const config: AppConfig = {
  port: 3000,
  pgDatabaseUrl: 'postgresql://odoo:xzz...@localhost:5432/newback',
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
  swagger: false,
  serverUrl: 'https://api.xzz2021.top',
  frontendUrl: 'https://admin.xzz2021.top/',
  minio: {
    host: 'xzz2021.top',
    port: 9091,
    url: 'https://oss.xzz2021.top',
    accessKey: 'iOwn4gxtGee1SNrNPfBe',
    secretKey: 'K34QIqPLHHooRFw9P4MPDkUyoPIuqsLTKVJnX8TU',
  },
  n8nHost: 'https://n8n.xzz2021.top',
  staticFileRootPath: 'public',
  wechat: {
    appId: 'wx1234567890',
    appSecret: '1234567890',
  },
  aliSms: {
    accessKeyId: '',
    accessKeySecret: '',
    signName: '',
    templateCode: '',
  },
  // 生产环境特定配置
  // featureXEnabled: false,  // 生产环境默认关闭实验性功能
  // 生产环境优化配置
  // logLevel: 'warn',
  // enableMetrics: true,
};

export default config;
