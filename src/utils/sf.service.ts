import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderData, InputOrderData, ContactInfo } from './type';
import { ConfigService } from '@nestjs/config';

interface SfResponse {
  apiResponseID: string;
  apiErrorMsg: string;
  apiResultCode: string;
  apiResultData: string;
  succ?: string;
}
interface SfApiType {
  partnerID: string;
  checkWord: string;
  monthlyCard: string;
  createOrderUrl: string;
  logisticsQueryUrl: string;
  oauthUrl: string;
}

@Injectable()
export class SfService {
  private headers: { 'Content-Type': string } = { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' };
  private sfApi: SfApiType;
  constructor(configService: ConfigService) {
    this.sfApi = configService.get('sfApi') as SfApiType;
  }
  sign(msgDataStr: string, timestamp: number): string {
    const text = msgDataStr + timestamp + this.sfApi.checkWord;
    const toVerifyText = encodeURIComponent(text).replace(/%20/g, '+');
    const md5 = crypto.createHash('md5').update(toVerifyText, 'utf8').digest().toString('base64');
    return md5;
  }

  async getOAuth2Token() {
    const url = this.sfApi.oauthUrl;
    const body = new URLSearchParams({
      partnerID: this.sfApi.partnerID,
      secret: this.sfApi.checkWord,
      grantType: 'password',
    });
    const res = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body,
    });
    if (!res.ok) {
      throw new BadRequestException(`HTTP error! Status: ${res.status}`);
    }
    const { accessToken } = await res.json();
    if (!accessToken) {
      throw new BadRequestException('获取accessToken失败');
    }
    return accessToken;
  }

  generateBaseData({ serviceCode, msgData }: { serviceCode: string; msgData: any }) {
    const timestamp = Date.now();
    const uuid = uuidv4();
    const msgDataStr = JSON.stringify(msgData);
    const msgDigest = this.sign(msgDataStr, timestamp);
    return {
      partnerID: this.sfApi.partnerID,
      timestamp: timestamp.toString(),
      requestID: uuid,
      serviceCode,
      msgData: msgDataStr,
      msgDigest,
    };
  }

  //  下单
  async createOrder(data: InputOrderData): Promise<any> {
    const { contactInfo, isMonthlyCard, ...rest } = data;
    const newContactInfo = {
      ...contactInfo,
      contactType: 2,
      country: 'CN',
    };
    const monthlyCard = isMonthlyCard ? this.sfApi.monthlyCard : undefined;
    const msgData: CreateOrderData = {
      ...rest,
      contactInfoList: [
        newContactInfo,
        // 此处未默认的发件人及发件地址  需要根据实际情况进行修改
        {
          address: '福建省泉州市丰泽区666号',
          contact: 'aaa',
          contactType: 1,
          country: 'CN',
          company: 'aaaa科技有限公司',
          mobile: '18600000000',
        },
      ],
      language: 'zh-CN',
      monthlyCard,
      cargoDetails: data?.cargoDetails || [{ name: '衣服' }],
      isReturnRoutelabel: 1,
      expressTypeId: data?.expressTypeId || 2,
      payMethod: data?.payMethod || 1,
    };
    const baseData = this.generateBaseData({ serviceCode: 'EXP_RECE_CREATE_ORDER', msgData });

    const res = await this.fetchWrap(this.sfApi.createOrderUrl, baseData);
    const waybillNo = res?.msgData?.waybillNoInfoList[0]?.waybillNo;
    if (waybillNo) {
      return { waybillNo };
    } else {
      return { error: res };
    }
  }

  //  创建 云 面单   暂未使用
  async createCard(): Promise<any> {
    const msgData = {
      version: '2.0',
      templateCode: 'fm_76130_standard_DYSWD435344Z3', // 类似：fm_76130_standard_{partnerId}
      documents: [{ masterWaybillNo: 'SF744345451783' }],
      sync: true,
    };
    // console.log('msgData-------------------------', msgData);
    const baseData = this.generateBaseData({ serviceCode: 'COM_RECE_CLOUD_PRINT_WAYBILLS', msgData });
    // console.log('baseData-------------------------', baseData);
    const body = new URLSearchParams(baseData).toString();
    const res = await fetch(this.sfApi.createOrderUrl, {
      method: 'POST',
      headers: this.headers,
      body,
    });
    if (!res.ok) {
      throw new BadRequestException(`HTTP error! Status: ${res.status}`);
    }
    return await res.json();
  }

  //  根据单号 查询 物流
  async LogisticsQuery(waybillNo: string): Promise<any> {
    const msgData = {
      language: 0, //  0：中文 1：英文 2：繁体
      trackingType: 1, // 1. 顺丰运单号  2. 客户订单号
      trackingNumber: [waybillNo],
    };
    const baseData = this.generateBaseData({ serviceCode: 'EXP_RECE_SEARCH_ROUTES', msgData });
    const res = await this.fetchWrap(this.sfApi.logisticsQueryUrl, baseData);
    const newRes = res?.msgData?.routeResps[0];
    if (newRes?.mailNo) {
      return newRes;
    } else {
      return res;
    }
  }

  async cancelOrder(orderId: string) {
    const msgData = {
      orderId,
      dealType: 2,
    };
    const baseData = this.generateBaseData({ serviceCode: 'EXP_RECE_UPDATE_ORDER', msgData });
    const res = await this.fetchWrap(this.sfApi.createOrderUrl, baseData);
    if (res?.msgData?.success) {
      return { success: true };
    } else {
      return { error: res };
    }
  }

  //  只能改 重量  收货人信息  取消订单    //  订单取消之后，订单号是不能重复利用的, 同一外部订单号只能下单一次
  async updateOrder(rawData: { orderId: string; totalWeight?: number; destContactInfo: Partial<ContactInfo>; cargoDetails: { name: string }[] }) {
    const { destContactInfo, ...rest } = rawData;

    // 优化收货人信息处理，确保包含国家代码
    const msgData = {
      ...rest,
      destContactInfo: destContactInfo
        ? {
            ...destContactInfo,
            country: 'CN',
          }
        : undefined,
    };
    const baseData = this.generateBaseData({ serviceCode: 'EXP_RECE_UPDATE_ORDER', msgData });
    const res = await this.fetchWrap(this.sfApi.createOrderUrl, baseData);
    if (res?.msgData?.success) {
      return { success: true };
    } else {
      return { error: res };
    }
  }

  async fetchWrap(url: string, baseData: Record<string, string>) {
    const body = new URLSearchParams(baseData).toString();
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body,
      });
      if (!res.ok) {
        return { error: '网络请求异常', message: res?.status };
      }
      const data: SfResponse = await res.json();
      console.log('data-------------------------', data);
      if (data?.apiResultCode) {
        if (data?.apiResultCode == 'A1000' && data.apiResultData) {
          // 统一接入平台校验成功，调用后端服务成功； 注意：不代表后端业务处理成功，实际业务处理结果， 需要查看响应属性apiResultData中的详细结果
          const resData = JSON.parse(data.apiResultData); //  返回的数据是json字符串，需要解析  //  success 返回  true 或 false
          if (resData?.success) {
            return resData;
          } else {
            return { errMsg: '返回结果失败', error: resData };
          }
        } else {
          return { error: '顺丰接口调用返回结果异常', statusMsg: this.switchStatusMessage(data.apiResultCode), message: data?.apiErrorMsg };
        }
      } else {
        return { error: '顺丰接口响应失败' };
      }
    } catch (error) {
      console.log('error-------------------------', error);
      return { error: '网络请求异常', message: error.message };
    }
  }

  switchStatusMessage(status: string) {
    let message = '';
    switch (status) {
      case 'A1001':
        message = '必传参数不可为空';
        break;
      case 'A1002':
        message = '请求时效已过期';
        break;
      case 'A1003':
        message = 'IP无效';
        break;
      case 'A1004':
        message = '无对应服务权限';
        break;
      case 'A1005':
        message = '流量受控';
        break;
      case 'A1006':
        message = '数字签名无效';
        break;
      case 'A1007':
        message = '重复请求';
        break;
      case 'A1008':
        message = '数据解密失败';
        break;
      case 'A1009':
        message = '目标服务异常或不可达';
        break;
      case 'A1099':
        message = '系统异常';
        break;
      default:
        message = '未知错误';
    }
    return message;
  }
}
