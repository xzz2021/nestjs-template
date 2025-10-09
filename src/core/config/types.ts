// 配置类型定义

interface SfApiType {
  partnerID: string;
  checkWord: string;
  monthlyCard: string;
  createOrderUrl: string;
  logisticsQueryUrl: string;
  oauthUrl: string;
}

interface WxPayType {
  appid: string;
  mchid: string;
  notifyUrl: string;
  serialNo: string;
  apiV3Secret: string;
  nativePayUrl: string;
  privateKeyPath: string;
}
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
  minio: {
    host: string;
    port: number;
    url: string;
    accessKey: string;
    secretKey: string;
  };
  n8nHost: string;
  // 静态文件目录
  staticFileRootPath: string;
  // 微信配置
  wechat?: {
    appId: string;
    appSecret: string;
  };
  //  阿里短信配置
  aliSms?: {
    accessKeyId: string;
    accessKeySecret: string;
    signName: string;
    templateCode: string;
  };
  //  邮箱
  mail?: {
    host: string;
    port: number;
    secure: boolean;
    sender: string;
    auth: {
      user: string;
      pass: string;
    };
  };
  // 阿里支付
  aliPay?: {
    appId: string;
    privateKey: string;
    publicKey: string;
    gatewayUrl: string;
  };
  // 微信支付
  wxPay?: WxPayType;
  // 顺丰配置
  sfApi?: SfApiType;
  // 可以添加更多配置项
  [key: string]: any;
}

// 环境类型
export type Environment = 'development' | 'production' | 'docker';
