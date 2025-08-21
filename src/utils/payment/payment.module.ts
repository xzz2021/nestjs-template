import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { WxPay } from './wxpay';
import { Alipay } from './alipay';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, WxPay, Alipay],
})
export class PaymentModule {}
