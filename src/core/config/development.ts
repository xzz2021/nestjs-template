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
  swagger: true,
  serverUrl: 'http://localhost:3000',
  frontendUrl: 'http://localhost:4173',
  minio: {
    host: '127.0.0.1',
    port: 9089,
    url: 'http://127.0.0.1:9089',
    accessKey: 'ltVS29P31TtHrhqBZgRj',
    secretKey: 'E8eq8L3d3SOYfhA2X38RFnveORc6BQlqDeqIvF61',
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
  mail: {
    host: 'smtp.exmail.qq.com',
    port: 465,
    secure: true,
    sender: 'aaa@aaa.com',
    auth: {
      user: '',
      pass: '',
    },
  },

  // featureXEnabled: true,  // 可以轻松启用/禁用功能
  // 开发环境可以添加更多调试选项
  // debugMode: true,
  // logLevel: 'debug',
};

export default config;
