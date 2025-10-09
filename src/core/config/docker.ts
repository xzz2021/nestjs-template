import { AppConfig } from './types';

/*
PG_DATABASE_URL="postgresql://root:xzz...@pgdb:5432/back"

#  token管理
JWT_SECRET=xzz2021
JWT_REFRESH_SECRET=xzz2022
JWT_EXPIRES_TIME=300 # 5分钟
JWT_REFRESH_EXPIRES_TIME=259200  # 3天


#  允许多点登录 的数量
SSO_COUNT=3

# ioredis使用
REDIS_HOST=redisdb
REDIS_PORT=6379

#  是否开启swaagger
SWAGGER=false

SERVER_URL=https://api.xzz2021.top

#  前端运行的域名端口 用于跨域放行
FRONTEND_URL=https://admin.xzz2021.top


# oss
MINIO_HOST=oss.xzz2021.top
MINIO_PORT=443
MINIO_URL=https://oss.xzz2021.top
MINIO_ACCESS_KEY='iOwn4gxtGee1SNrNPfBe'
MINIO_SECRET_KEY='K34QIqPLHHooRFw9P4MPDkUyoPIuqsLTKVJnX8TU'
*/

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
  minio: {
    host: 'oss.xzz2021.top',
    port: 443,
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
};

export default config;
