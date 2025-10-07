// src/shared/sms/ali-sms.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Dysmsapi20170525, { SendSmsRequest } from '@alicloud/dysmsapi20170525';
import * as $OpenApi from '@alicloud/openapi-client';
import * as $Util from '@alicloud/tea-util';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

export interface SmsPayload {
  phone: string;
  code: number;
}
interface AliSmsKeyType {
  accessKeyId: string;
  accessKeySecret: string;
  signName: string;
  templateCode: string;
}

@Injectable()
export class AliSmsService {
  private client: Dysmsapi20170525;
  private runtime: $Util.RuntimeOptions;
  private readonly aliSmsKey: AliSmsKeyType;
  private readonly redis: Redis;
  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.redis = this.redisService.getOrThrow();
    this.aliSmsKey = this.configService.get('aliSms') as AliSmsKeyType;
    this.runtime = new $Util.RuntimeOptions({});
    this.initClient();
  }

  private initClient() {
    const { accessKeyId, accessKeySecret, signName, templateCode } = this.aliSmsKey;
    if (!accessKeyId || !accessKeySecret || !signName || !templateCode) {
      throw new Error('Aliyun SMS 配置错误：缺少 AccessKey');
    }
    const openApiConfig = new $OpenApi.Config({
      accessKeyId,
      accessKeySecret,
      endpoint: 'dysmsapi.aliyuncs.com',
    });
    // openApiConfig.endpoint = 'dysmsapi.aliyuncs.com';
    this.client = new Dysmsapi20170525(openApiConfig);
  }

  async send({ phone, code }: SmsPayload) {
    const sendSmsRequest = new SendSmsRequest({
      phoneNumbers: phone,
      signName: this.aliSmsKey.signName,
      templateCode: this.aliSmsKey.templateCode,
      //  code 是数字 需要转换为字符串  不然会超时
      templateParam: JSON.stringify({ code: code.toString() }),
    });
    // console.log('🚀 ~ AliSmsService ~ send ~ sendSmsRequest:', sendSmsRequest);
    try {
      const result = await this.client.sendSmsWithOptions(sendSmsRequest, this.runtime);
      return result;
    } catch (error) {
      return {
        message: '发送失败',
        error: error.message,
      };
    }
  }

  //  校验短信  验证码
  async checkSmsCode(smskey: string, code: string) {
    try {
      const cacheCode = await this.redis.get(smskey);
      if (!cacheCode) {
        return { status: false, message: '验证码已过期, 请重新获取!' };
      }
      if (cacheCode != code) {
        return { status: false, message: '验证码错误, 请重新输入!' };
      }
      await this.redis.del(smskey);
      return { status: true, message: '验证码正确' };
    } catch (error) {
      console.log('🚀 ~ AuthService ~ checkSmsCode ~ error:', error);
      return { status: false, message: '验证码校验错误, 请稍候重试!' };
    }
  }

  //  生成   短信验证码
  async generateSmsCode(phone: string, cachekey: string) {
    const cacheKeyName = cachekey + '_' + phone;
    const code = await this.redis.get(cacheKeyName);
    if (code) {
      return { code: 200, message: '验证码已发送,请60秒后再试!' };
    }
    // 随机生成6位数字 且首位不为0
    const newCode = Math.floor(Math.random() * 900000) + 100000;

    const res = await this.send({ code: newCode, phone });
    const isSuccess = res?.error ? false : true;
    if (isSuccess) {
      await this.redis.set(cacheKeyName, newCode, 'EX', 60);
    }
    return { message: isSuccess ? '发送验证码成功' : '发送验证码失败', res };
  }
}
