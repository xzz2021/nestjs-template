import * as fs from 'fs';
import * as crypto from 'crypto';
import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
interface WxPayData {
  appid: string;
  mchid: string;
  description: string;
  out_trade_no: string;
  notify_url: string;
  amount: { total: number; currency: string };
}

interface CertificateItem {
  effective_time: string;
  expire_time: string;
  serial_no: string;
  encrypt_certificate: {
    algorithm: string;
    associated_data: string;
    ciphertext: string;
    nonce: string;
  };
}

interface WxPayNotifyData {
  mchid: string;
  appid: string;
  out_trade_no: string;
  transaction_id: string;
  trade_type: string;
  trade_state: string;
  trade_state_desc: string;
  bank_type: string;
  attach: string;
  success_time: string;
  payer: {
    openid: string;
  };
  amount: {
    total: number;
    payer_total: number;
    currency: string;
    payer_currency: string;
  };
}

interface WxPayKey {
  appid: string;
  mchid: string;
  notifyUrl: string;
  serialNo: string;
  apiV3Secret: string;
  nativePayUrl: string;
  privateKeyPath: string;
}
@Injectable()
export class WxPay {
  // 回调url官方设置地址 https://pay.weixin.qq.com/index.php/core/risk_ctrl?uri=/index.php/extend/pay_setting/modify_callback_url&return_url=https%3A%2F%2Fpay.weixin.qq.com%2Findex.php%2Fextend%2Fpay_setting

  private readonly wxKey: WxPayKey;
  private certificates: any = {};

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.wxKey = this.configService.get('wxPay') as WxPayKey;
  }
  signWithPrivateKey(data: string): string {
    //  如果是测试 使用文件apiclient_test_key.pem
    // 1. 读取私钥
    // 2. 创建签名器
    const sign = crypto.createSign('RSA-SHA256');
    // const sign = crypto.createSign('SHA256');
    sign.update(data);
    sign.end();
    const privateKey = fs.readFileSync(this.wxKey.privateKeyPath, 'utf8');
    // 3. 生成签名（Base64编码）
    const signature = sign.sign(privateKey, 'base64');
    return signature;
  }

  generateAuthorization(type: string = 'native', body: Partial<WxPayData> = {}) {
    const newBody = {
      ...body,
      appid: this.wxKey.appid,
      mchid: this.wxKey.mchid,
      notify_url: this.wxKey.notifyUrl,
    };
    const nonce_str = crypto.randomBytes(16).toString('hex').toUpperCase();
    const timestamp = Math.floor(Date.now() / 1000).toString();
    let message = '';
    switch (type) {
      case 'native':
        message = `POST\n/v3/pay/transactions/native\n${timestamp}\n${nonce_str}\n${JSON.stringify(newBody)}\n`;
        break;
      case 'certificates':
        message = `GET\n/v3/certificates\n${timestamp}\n${nonce_str}\n\n`;
        break;
      default:
        throw new BadRequestException('不支持的类型');
    }
    const signature = this.signWithPrivateKey(message);
    // 不可换行
    const Authorization = `WECHATPAY2-SHA256-RSA2048 mchid="${this.wxKey.mchid}",nonce_str="${nonce_str}",signature="${signature}",timestamp="${timestamp}",serial_no="${this.wxKey.serialNo}"`;
    return { Authorization, body: newBody };
  }

  //  解密 报文 resource
  async decryptAESGCM(base64Ciphertext: string, nonce: string, associatedData: string): Promise<WxPayNotifyData> {
    const key = this.wxKey.apiV3Secret; // Must be 32 bytes (for AES-256)
    const enc = new TextEncoder();
    const keyBytes = enc.encode(key);
    const nonceBytes = enc.encode(nonce);
    const adBytes = enc.encode(associatedData);
    const cipherBytes = Uint8Array.from(atob(base64Ciphertext), c => c.charCodeAt(0));
    const cryptoKey = await crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['decrypt']);
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: nonceBytes,
        additionalData: adBytes,
        tagLength: 128,
      },
      cryptoKey,
      cipherBytes,
    );
    return JSON.parse(new TextDecoder().decode(decrypted));
  }

  //  解密 证书 获得publicKey
  aesGcmDecrypt({ associatedData, nonce, ciphertext }: { associatedData: string; nonce: string; ciphertext: string }): string {
    const key = Buffer.from(this.wxKey.apiV3Secret, 'utf8');
    const nonceBuf = Buffer.from(nonce, 'utf8');
    const aadBuf = Buffer.from(associatedData, 'utf8');
    const cipherBuf = Buffer.from(ciphertext, 'base64');

    const tag = cipherBuf.subarray(cipherBuf.length - 16);
    const data = cipherBuf.subarray(0, cipherBuf.length - 16);

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, nonceBuf);
    decipher.setAuthTag(tag);
    decipher.setAAD(aadBuf);

    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return decrypted.toString('utf8');
  }

  //  获取微信官方 返回的 商户自己的  平台证书   并存储publicKey
  async fetchCertificates() {
    const url = `https://api.mch.weixin.qq.com/v3/certificates`;
    try {
      const response = await this.httpService.axiosRef.get(url, {
        headers: {
          Authorization: this.generateAuthorization('certificates')?.Authorization,
          Accept: 'application/json',
        },
      });
      const certificatesArray = (response?.data?.data as CertificateItem[]) || [];
      certificatesArray.forEach(item => {
        this.certificates[item.serial_no] = this.aesGcmDecrypt({
          associatedData: item.encrypt_certificate.associated_data,
          nonce: item.encrypt_certificate.nonce,
          ciphertext: item.encrypt_certificate.ciphertext,
        });
      });
    } catch (_err) {
      throw new BadRequestException('获取平台证书失败'); // 获取平台证书失败
    }
  }

  async verifySign(params: { timestamp: string | number; nonce: string; serial: string; signature: string; body: Record<string, any> | string }) {
    const { timestamp, nonce, serial, signature, body } = params;
    if (!serial || !signature || !timestamp || !nonce) {
      throw new BadRequestException('请求头解析出的参数错误或者有遗漏!'); // 请求头解析出的参数错误或者有遗漏!
    }
    // 获取平台证书公钥
    let publicKey = this.certificates[serial] || '';
    if (!publicKey) {
      await this.fetchCertificates();
      publicKey = this.certificates[serial] || '';
      if (!publicKey) {
        throw new BadRequestException(`未找到平台证书序列号: ${serial}`); // 未找到平台证书序列号: ${serial}
      }
    }
    // 构造签名字符串
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
    const signStr = `${timestamp}\n${nonce}\n${bodyStr}\n`;

    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(signStr);
    verify.end();
    const isVerify = verify.verify(publicKey as crypto.KeyLike, signature, 'base64');
    if (!isVerify) {
      throw new BadRequestException('签名验证失败'); // 签名验证失败
    }
  }

  async getWxQrcode(objdata: any) {
    const { Authorization, body } = this.generateAuthorization('native', objdata as WxPayData);
    try {
      const response = await this.httpService.axiosRef.post(this.wxKey.nativePayUrl, body, {
        headers: {
          Authorization,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 30000,
      });
      return response.data;
    } catch (error) {
      console.log('🚀 ~ WxPay ~ getWxQrcode ~ error:', error);
      throw new BadRequestException('获取微信支付二维码失败, 原因: ' + error?.response?.data); // 获取微信支付二维码失败, 原因: ${error?.response?.data}
    }
  }
}
