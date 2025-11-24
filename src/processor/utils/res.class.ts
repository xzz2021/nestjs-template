/*
 * 统一返回结果
 */
export class ResResult {
  readonly code: number;
  readonly message: string;
  readonly timestamp: string;
  [key: string]: any;

  constructor(code: number, message: string, data: any) {
    this.code = code;
    this.message = message;
    this.timestamp = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }).split('T').join(' ').replaceAll('/', '-');
    Object.assign(this, data);
  }

  static success(data?: any) {
    // 如果返回值是基本类型或者数组，就组装一下。
    if (typeof data !== 'object') {
      const { message, ...rest } = data;
      return new ResResult(200, data?.message || '操作成功', rest);
    } else {
      return new ResResult(200, '操作成功', data);
    }
  }

  static error(msg = '操作失败', code = 500) {
    return new ResResult(code, msg, null);
  }
}
