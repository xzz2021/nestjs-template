import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AlipaySdk, AlipaySdkConfig } from 'alipay-sdk';

@Injectable()
export class Alipay extends AlipaySdk {
  constructor(configService: ConfigService) {
    const obj = configService.get('aliPay') as AlipaySdkConfig;
    super(obj);
  }
}
