import { Controller, Post, Req, Body, Headers, HttpCode } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { GetWxQrcodeDto, GetAlipayQrcodeDto, WxPayBody, AlipayNotifyDto } from './dto/payment.dto';
import { ApiOperation } from '@nestjs/swagger';
import { Public } from '@/processor/decorator/public.decorator';
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  //  微信二维码
  @Post('wechat_qrcode')
  @ApiOperation({ summary: '调起微信支付返回二维码' })
  getWxQrcode(@Body() getWxQrcodeData: GetWxQrcodeDto, @Req() req: any) {
    console.log('🚀 ~ PaymentController ~ 调起支付返回二维码:');
    return this.paymentService.getWxQrcode(getWxQrcodeData, req?.user?.id as number);
  }

  // 支付宝二维码
  @Post('alipay_qrcode')
  @ApiOperation({ summary: '支付宝支付' })
  getAlipayQrcode(@Body() getAlipayQrcodeData: GetAlipayQrcodeDto, @Req() req: any) {
    return this.paymentService.getAlipayQrcode(getAlipayQrcodeData, req?.user?.id as number);
  }

  @Public()
  @HttpCode(200) // 微信必须返回200 状态码 才算成功
  @Post('wechat_notify')
  @ApiOperation({ summary: '微信支付回调' })
  wechatNotify(@Body() notifyData: WxPayBody, @Headers() headers: any) {
    // 获取请求头中的 Wechatpay-Serial  Wechatpay-Signature  Wechatpay-Timestamp  Wechatpay-Nonce
    // { timestamp: string | number; nonce: string; serial: string; signature: string;
    const nonce = headers['wechatpay-nonce'];
    const serial = headers['wechatpay-serial'];
    const signature = headers['wechatpay-signature'];
    const timestamp = headers['wechatpay-timestamp'];
    const headerData = { timestamp, nonce, serial, signature };
    return this.paymentService.wechatNotify(headerData, notifyData);
  }

  @Public()
  @Post('alipay_notify')
  @ApiOperation({ summary: '支付宝支付回调' })
  alipayNotify(@Body() notifyData: AlipayNotifyDto) {
    return this.paymentService.alipayNotify(notifyData);
  }

  @Post('polling_order_status')
  @ApiOperation({ summary: '轮询订单支付状态' })
  pollingOrderStatus(@Body() orderInfo: { order_number: string }) {
    return this.paymentService.pollingOrderStatus(orderInfo);
  }
}
