import { Injectable } from '@nestjs/common';
import maxmind, { CityResponse } from 'maxmind';
import path from 'path';

export interface IPAddress {
  /**国家 */
  country: string;
  /**省份 */
  province: string;
  /**城市 */
  city: string;
  /**地区 */
  // district: string;
  // /**行政区划代码 */
  // adcode: string;

  address: string;
  message: string;
}
@Injectable()
export class IpToAddressService {
  public async getAddress(ip?: string): Promise<IPAddress> {
    // console.log('ip============------===========', ip);
    // 运行目录下的assets文件夹
    const filePath = path.join(process.cwd(), './src/assets/GeoLite2-City.mmdb');
    const lookup = await maxmind.open<CityResponse>(filePath);
    const ad = lookup.get(ip || '112.47.255.103');

    // console.log('ad============------===========', ad);
    const country = ad?.country?.names['zh-CN'] as string;
    const province = ad?.subdivisions?.[0]?.names['zh-CN'] as string;
    const city = ad?.city?.names['zh-CN'] as string;
    return { address: country + province + city, country, province, city, message: '获取ip地址成功' };
  }
}
