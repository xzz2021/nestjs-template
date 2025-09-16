import { ConfigModule } from '@nestjs/config';
// import * as Joi from 'joi';

//  此处加载的文件是静态编译的  而cross-env 传递的变量是运行时生效的
// const envPath = [`.env.${process.env.NODE_ENV}`, '.env']; // 两者变量会去重合并   前者覆写后者

export const mail = () => {
  return {
    mail: {
      sender: process.env.MAIL_SENDER,
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  };
};

export const wxPay = () => {
  return {
    wxPay: {
      appId: process.env.WX_PAY_APPID,
      mchId: process.env.WX_PAY_MCHID,
      notifyUrl: process.env.WX_PAY_NOTIFY_URL,
      serialNo: process.env.WX_PAY_SERIAL_NO,
      apiV3Secret: process.env.WX_PAY_API_V3_SECRET,
      nativePayUrl: process.env.WX_PAY_NATIVE_URL,
      privateKeyPath: process.env.WX_PAY_PRIVATE_KEY_PATH,
    },
  };
};
export const aliPay = () => {
  return {
    aliPay: {
      appId: process.env.ALIPAY_APP_ID,
      privateKey: process.env.ALIPAY_PRIVATE_KEY,
      alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
    },
  };
};

export const aliSms = () => {
  // 工厂函数 可以组织变量到一起成为对象  方便使用
  return {
    aliSms: {
      accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
      accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
      signName: process.env.ALIYUN_SMS_SIGN_NAME,
      templateCode: process.env.ALIYUN_SMS_TEMPLATE_CODE,
    },
  };
};

export const sfApi = () => {
  return {
    sfApi:
      process.env.SF_SBOX == 'true'
        ? {
            partnerID: process.env.SF_SBOX_PARTNER_ID,
            checkWord: process.env.SF_SBOX_CHECK_WORD,
            monthlyCard: process.env.SF_SBOX_MONTHLY_CARD,
            createOrderUrl: process.env.SF_SBOX_CREATE_ORDER_URL,
            logisticsQueryUrl: process.env.SF_SBOX_LOGISTICS_QUERY_URL,
            oauthUrl: process.env.SF_SBOX_OAUTH_URL,
          }
        : {
            partnerID: process.env.SF_PARTNER_ID,
            checkWord: process.env.SF_CHECK_WORD,
            monthlyCard: process.env.SF_MONTHLY_CARD,
            createOrderUrl: process.env.SF_CREATE_ORDER_URL,
            logisticsQueryUrl: process.env.SF_LOGISTICS_QUERY_URL,
            oauthUrl: process.env.SF_OAUTH_URL,
          },
  };
};

export const moduleFactory = () => {
  return {
    WS: process.env.WS === 'true',
  };
};

export const redis = () => {
  return {
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    },
  };
};

// 通过上面方法可以打点调用
// const dbHost = this.configService.get<string>('database.host');

export const CONFIG_MODULE = ConfigModule.forRoot({
  // load: [aliSms, aliPay, wxPay, mail, redis],
  load: [aliPay, wxPay, sfApi, aliSms, redis],
  isGlobal: true,
  cache: true,
  envFilePath: (() => {
    const env = process.env.NODE_ENV;
    console.log('🛠️ 当前使用的环境文件:', `.env.${env}`);
    return [`.env.${env}`, '.env'];
  })(),
  expandVariables: true,
  // validationSchema: Joi.object({
  //   // NODE_ENV: Joi.string().valid('development', 'production').required(),
  //   // PORT: Joi.number().required(),
  //   // JWT_SECRET: Joi.string().required(),
  //   // MAIL_PORT: Joi.number().required(),
  // }),
});

/*
使用注意事项

1. 如果模块在变量加载后 根据变量 动态加载  需要加一行等待代码 await ConfigModule.envVariablesLoaded;


export async function getStorageModule() {
  await ConfigModule.envVariablesLoaded;
  return process.env.STORAGE === 'S3' ? S3StorageModule : DefaultStorageModule;
}


2. 根据变量 条件加载模块
ConditionalModule.registerWhen(FooModule, 'USE_FOO'),

*/
