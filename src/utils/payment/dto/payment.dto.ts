import { IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertPayPasswordDto {
  @ApiProperty({ type: Number })
  @IsOptional()
  id?: number;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  code: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  password: string;
}

export class VerifyPayPasswordDto {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  password: string;
}

export class GetWxQrcodeDto {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  order_number: string;
}

export class GetAlipayQrcodeDto {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  order_number: string;
}

export interface WxPayBody {
  id: string;
  create_time: string;
  resource_type: string;
  event_type: string;
  summary: string;
  resource: {
    original_type: string;
    algorithm: string;
    ciphertext: string;
    associated_data: string;
    nonce: string;
  };
}

export interface AlipayNotifyDto {
  gmt_create: string;
  charset: string;
  seller_email: string;
  subject: string;
  sign: string;
  invoice_amount: string;
  buyer_open_id: string;
  notify_id: string;
  fund_bill_list: string;
  notify_type: string;
  trade_status: string;
  receipt_amount: string;
  buyer_pay_amount: string;
  app_id: string;
  sign_type: string;
  seller_id: string;
  gmt_payment: string;
  notify_time: string;
  merchant_app_id: string;
  version: string;
  out_trade_no: string;
  total_amount: string;
  trade_no: string;
  auth_app_id: string;
  buyer_logon_id: string;
  point_amount: string;
}

export enum PayMethod {
  WXPAY = 'wxpay',
  ALIPAY = 'alipay',
  BANK = 'bank',
  WALLET = 'wallet',
}

export enum PayStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export enum ChangeType {
  // 充值 支付 退款 还款 多种类型的订单消费
  RECHARGE = 'recharge',
  PAY = 'pay',
  REFUND = 'refund',
  ORDER = 'order',
  TRANSFER = 'transfer',
}
