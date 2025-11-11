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
    host: 'oss.xzz2021.top',
    port: 443,
    url: 'https://oss.xzz2021.top',
    accessKey: 'iOwn4gxtAAGee1SNrNPfBe',
    secretKey: 'K34QIqPLHHooBBRFw9P4MPDkUyoPIuqsLTKVJnX8TU',
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
  wxPay: {
    appid: 'wx1234567890',
    mchid: 'wx1234567890',
    notifyUrl: 'https://api.xzz2021.top/api/v1/wxpay/notify',
    refundNotifyUrl: 'https://api.mch.weixin.qq.com/v3/refund/domestic/refunds',
    serialNo: 'wx1234567890',
    apiV3Secret: 'wx1234567890',
    nativePayUrl: 'https://api.xzz2021.top/api/v1/wxpay/native',
    privateKeyPath: 'src/table/payment/cert/wechat/apiclient_key.pem',
  },
  aliPay: {
    appId: 'wx1234567890',
    privateKey: 'wx1234567890',
    alipayPublicKey: 'wx1234567890',
    gatewayUrl: 'https://api.xzz2021.top/api/v1/alipay/notify',
  },

  // featureXEnabled: true,  // 可以轻松启用/禁用功能
  // 开发环境可以添加更多调试选项
  // debugMode: true,
  // logLevel: 'debug',
};

export default config;
