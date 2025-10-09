import { ConfigModule } from '@nestjs/config';
import developmentConfig from './development';
import dockerConfig from './docker';
import productionConfig from './production';
import { AppConfig, Environment } from './types';

// 应用配置工厂函数
export const appConfig = (): AppConfig => {
  const env = process.env.NODE_ENV as Environment;

  try {
    // 根据环境选择配置
    let config: AppConfig;
    switch (env) {
      case 'development':
        config = developmentConfig;
        break;
      case 'production':
        config = productionConfig;
        break;
      case 'docker':
        config = dockerConfig;
        break;
      default:
        throw new Error(`Unknown environment`);
    }

    return config;
  } catch (error) {
    console.error(`Failed to load configuration for environment: ${env}`, error);
    throw error;
  }
};

// 默认导出保持向后兼容
export default appConfig;

// 完整的配置模块，集成所有配置
export const CONFIG_MODULE = ConfigModule.forRoot({
  isGlobal: true,
  cache: true,
  ignoreEnvFile: true, // 注释  代表允许使用 .env 文件
  expandVariables: true,
  load: [
    appConfig, // 应用配置
    // 可以在这里添加其他配置工厂函数
  ],

  /*
  //  同时兼容env配置
  envFilePath: (() => {
    const env = process.env.NODE_ENV;
    console.log('🛠️ 当前使用的环境文件:', `.env.${env}`);
    return [`.env.${env}`, '.env'];
  })(),

  */
  // validationSchema: Joi.object({
  //   NODE_ENV: Joi.string().valid('development', 'production').required(),
  //   PORT: Joi.number().required(),
  //   // 可以添加更多验证规则
  // }),
});

/*

// 完整的配置模块
export const COMPLETE_CONFIG_MODULE = ConfigModule.forRoot({
  isGlobal: true,
  cache: true,
  ignoreEnvFile: false, // 允许使用 .env 文件
  expandVariables: true,
  load: [
    appConfig, // 应用配置 (TypeScript 配置)
    mail, // 邮件配置
    wxPay, // 微信支付配置
    aliSms, // 阿里云短信配置
    moduleFactory, // 模块工厂配置
    redis, // Redis 配置
    minio, // MinIO 配置
  ],
  envFilePath: (() => {
    const env = process.env.NODE_ENV;
    console.log('🛠️ 当前使用的环境文件:', `.env.${env}`);
    return [`.env.${env}`, '.env'];
  })(),
  // validationSchema: Joi.object({
  //   NODE_ENV: Joi.string().valid('development', 'production').required(),
  //   PORT: Joi.number().required(),
  //   // 可以添加更多验证规则
  // }),
});

// 仅应用配置的模块（轻量级）
export const APP_CONFIG_MODULE = ConfigModule.forRoot({
  isGlobal: true,
  cache: true,
  ignoreEnvFile: false,
  expandVariables: true,
  load: [appConfig],
  envFilePath: (() => {
    const env = process.env.NODE_ENV;
    console.log('🛠️ 当前使用的环境文件:', `.env.${env}`);
    return [`.env.${env}`, '.env'];
  })(),
});

*/
