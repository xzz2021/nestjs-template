import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Alipay } from './alipay';
import { AlipayNotifyDto, GetAlipayQrcodeDto, GetWxQrcodeDto, WxPayBody } from './dto/payment.dto';
import { WxPay } from './wxpay';

@Injectable()
export class PaymentService {
  constructor(
    private readonly wxPay: WxPay,
    private readonly alipay: Alipay,
  ) {}

  async getWxQrcode(getWxQrcodeData: GetWxQrcodeDto, _userId: number) {
    const orderInfo = { order_number: 8734658734654 }; // 伪代码
    const description = 'xzz2021-豆豆';
    const out_trade_no = orderInfo.order_number;
    const amount = {
      // total: orderInfo.total_final_price * 100,
      total: 1,
      currency: 'CNY',
    };
    const objdata = {
      description,
      out_trade_no,
      amount,
    };
    const response = await this.wxPay.getWxQrcode(objdata);
    if (!response) {
      throw new HttpException('获取微信二维码失败', HttpStatus.BAD_REQUEST);
    }
    return response;
  }

  async wechatNotify(headerData: any, bodyData: WxPayBody) {
    //  商户接收到回调通知报文后，需在5秒内完成对报文的验签，并应答回调通知。

    // id   create_time   event_type   resource_type  resource  summary
    //  1. 接收通知  请求体body会有支付结果信息

    // 2. 对通知进行验签, 如果失败 返回 fail  微信会再次发起请求
    // 2.1 获取请求头中的 Wechatpay-Serial  Wechatpay-Signature  Wechatpay-Timestamp  Wechatpay-Nonce
    //  验签 是 为了 保证 信息是 微信传递的 不是伪造的

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await this.wxPay.verifySign({ ...headerData, body: bodyData });

    // 解析数据
    const { nonce, ciphertext, associated_data } = bodyData.resource;
    const decryptData = await this.wxPay.decryptAESGCM(ciphertext, nonce, associated_data);
    console.log('💣 decryptData', decryptData);

    // 新建一张表  存储 微信回调信息  尤其是订单异常信息

    // throw new ServiceUnavailableException('数据解析成功, 但我在测试接口');
    /*
      {"mchid":"1679792969",
        "appid":"wxb0144e19caaa6fa0",
        "out_trade_no":"agjzgev28j6",
        "transaction_id":"4200002698202506093983738178",
        "trade_type":"NATIVE",
        "trade_state":"SUCCESS",
        "trade_state_desc":"支付成功",
        "bank_type":"OTHERS",
        "attach":"",
        "success_time":"2025-06-09T08:08:50+08:00",
        "payer":{"openid":"o2agb1VEzZ0xnDvyieT-ShU6Sb88"},
        "amount":{"total":1,"payer_total":1,"currency":"CNY","payer_currency":"CNY"}}
      */
    // 返回数据
    // return { code: 200, message: '数据解析成功' };

    // 2.2 检查是否成功支付   如果是   解密 resource 报文
    if (bodyData?.event_type === 'TRANSACTION.SUCCESS') {
      /*
{
    "id": "EV-2018022511223320873",
    "create_time": "2015-05-20T13:29:35+08:00",
    "resource_type": "encrypt-resource",
    "event_type": "TRANSACTION.SUCCESS",
    "summary": "支付成功",
    "resource": {
        "original_type": "transaction",
        "algorithm": "AEAD_AES_256_GCM",
        "ciphertext": "",
        "associated_data": "",
        "nonce": ""
    }
}
    // 更新自己平台的订单数据   伪代码
      await this.checkOrder({
        order_number: decryptData.out_trade_no,
        trade_no: decryptData.transaction_id,
        amount: decryptData.amount.total * 100,
        meta: JSON.stringify(decryptData),
        pay_method: PayMethod.WXPAY,
        transaction_no: decryptData?.transaction_id,
        paid_at: decryptData?.success_time,
      });
*/

      // 4. 如果一切顺利   对回调进行正常应答  返回 { code: 200}
      return { code: 200, message: '订单处理成功!' };
    }
  }

  alipayNotify(notifyData: AlipayNotifyDto) {
    /*
{
  gmt_create: '2025-06-11 15:16:47',
  charset: 'utf-8',
  seller_email: 'bill_he004@163.com',
  subject: '测试xzz2021-豆豆',
  sign: 'OyU2BuAp8FVvMGMIyV/iuCQ7cCbrwHHYl8G9yuExTL8LeeMYk8ERpZqH6daRRCJQzD3r
  invoice_amount: '0.01',
  buyer_open_id: '064aI-cmf-JCiuD749MsmnX4gNiPq5nne15SXZh3xJRLrEc',
  notify_id: '2025061101222151650010641498837783',
  fund_bill_list: '[{"amount":"0.01","fundChannel":"ALIPAYACCOUNT"}]',
  notify_type: 'trade_status_sync',
  trade_status: 'TRADE_SUCCESS',
  receipt_amount: '0.01',
  buyer_pay_amount: '0.01',
  app_id: '2021005159614138',
  sign_type: 'RSA2',
  seller_id: '2088031806797227',
  gmt_payment: '2025-06-11 15:16:49',
  notify_time: '2025-06-11 15:19:05',
  merchant_app_id: '2021005159614138',
  version: '1.0',
  out_trade_no: 'order1749626199447',
  total_amount: '0.01',
  trade_no: '2025061122001410641414667173',
  auth_app_id: '2021005159614138',
  buyer_logon_id: '130****8822',
  point_amount: '0.00'
}


    const { out_trade_no, trade_no, total_amount, gmt_payment } = notifyData; // 订单号 交易号 总金额

    await this.checkOrder({
      order_number: out_trade_no,
      trade_no: trade_no,
      amount: +total_amount,
      meta: JSON.stringify(notifyData),
      pay_method: PayMethod.ALIPAY,
      transaction_no: trade_no,
      paid_at: gmt_payment,
    });
    */

    return { code: 200, message: '支付宝回调成功' };
  }

  async getAlipayQrcode(getAlipayQrcodeData: GetAlipayQrcodeDto, _userId: number) {
    // const orderInfo = await this.checkOrderStatus(getAlipayQrcodeData.order_number);
    const orderInfo = { order_number: 87347774654 }; // 伪代码

    const result = await this.alipay.exec('alipay.trade.precreate', {
      notifyUrl: 'https://xzz.yun3d.com/api/payment/alipay_notify', // 异步通知地址
      bizContent: {
        out_trade_no: orderInfo.order_number,
        // total_amount: orderInfo.total_final_price,
        total_amount: 0.01,
        subject: '测试xzz2021-豆豆',
        store_id: 'NJ_00145737545',
      },
    });
    /*

 {
  code: '10000',
  msg: 'Success',
  outTradeNo: 'order1749458250879',
  qrCode: 'https://qr.alipay.com/bax00214iuktjfpcknhm0015',
  traceId: '219078ab17494582500422122e3521'
}

    */
    console.log('🚀 ~ PaymentService ~ getAlipayQrcode ~ result:', result);
    if (result.code !== '10000') {
      throw new HttpException('获取支付宝二维码失败', HttpStatus.BAD_REQUEST);
    }
    return { code_url: result.qrCode, code: 200, message: '测试' }; //二维码url;
  }

  pollingOrderStatus(_orderInfo: { order_number: string }) {
    //  不能抛出异常, 不然前端轮询会一直出   报错 提示
    // 1. 获取订单信息
    // const orderInfo = await this.pgService.orderInfo.findFirst({
    //   where: { order_number: _orderInfo.order_number },
    // });
    const orderInfo = { order_number: 87347774654, status: 'OrderStatus.PAID' }; // 伪代码
    if (!orderInfo) {
      return { status: false, message: '订单不存在' };
    }
    // 2. 轮询订单状态
    if (orderInfo.status == 'OrderStatus.PAID') {
      return { status: true, message: '订单已支付' };
    }
    return { status: false, message: '订单正在核实中...' };
  }

  async alipayRefund(refundData: any) {
    const randomNumber6 = Math.floor(100000 + Math.random() * 900000); //  退款单号 应该由上级下发
    // 支付宝退款可以直接获取到响应
    const result = await this.alipay.exec('alipay.trade.refund', {
      bizContent: {
        out_trade_no: refundData.order_number, // 原始订单单号
        refund_amount: refundData.adjustedNet,
        refund_reason: '正常退款',
        out_request_no: refundData.order_number + '00REFUND' + randomNumber6,
      },
    });
    return result;
  }
}
