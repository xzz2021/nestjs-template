export interface RegisterInfo {
  username: string;
  password: string;
  phone: string;
  avatar?: string;
  wechatId?: string;
  code?: string;
}

export interface LoginInfo {
  phone: string;
  password: string;
}

export interface WechatCodeResponse {
  openid: string;
  unionid: string;
  access_token: string;
  refresh_token: string;
  errcode?: number;
}
