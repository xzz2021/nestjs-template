import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PgService } from '@/prisma/pg.service';
import { LoginInfo, RegisterInfo } from './types';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { resultDataType, UndiciHttpService } from '@/utils/http/undici.http.service';
import { hashPayPassword, verifyPayPassword } from '@/processor/utils/encryption';
import { AliSmsService } from '@/utils/sms/sms.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private wxAppSecret: string;
  private wxAppId: string;
  constructor(
    private readonly pgService: PgService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly httpService: UndiciHttpService,
    private readonly smsService: AliSmsService,
    private readonly configService: ConfigService,
  ) {
    this.wxAppSecret = this.configService.get<string>('WX_APP_SECRET') || '';
    this.wxAppId = this.configService.get<string>('WX_APP_ID') || '';
  }

  async create(createUserDto: RegisterInfo) {
    const { phone, code, password, username } = createUserDto;
    // 应该要先查询下手机号是否存在,  存在 抛出异常提示
    const user = await this.isUserExist(phone);
    if (user) {
      return { code: 400, message: phone + '手机号已存在' };
    }

    //  比对验证码
    const smsCheck = await this.smsService.checkSmsCode('register_' + phone, code as string);
    if (!smsCheck.status) return smsCheck;

    try {
      const hashedPassword = await hashPayPassword(password);
      const res = await this.pgService.user.create({
        data: {
          phone,
          username,
          password: hashedPassword,
        },
      });
      await this.cacheManager.del('register_' + phone);
      return { code: 200, message: phone + '注册成功', data: res };
    } catch (error) {
      console.log(error);
      //  错误  抛出异常
      return { code: 400, message: error?.sqlMessage };
    }
  }

  async login(loginInfo: LoginInfo) {
    console.log('🚀 ~ AuthService ~ login ~ loginInfo:', loginInfo);
    const user = await this.pgService.user.findUnique({
      where: { phone: loginInfo.phone },
      select: {
        id: true,
        username: true,
        phone: true,
        password: true,
        roles: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!user) {
      return { code: 400, message: '用户不存在' };
    }
    const isPasswordValid = await verifyPayPassword(user.password, loginInfo.password);
    if (!isPasswordValid) {
      return { code: 400, message: loginInfo.phone + '密码错误' };
    }
    const { password, ...result } = user;
    const ssoEnabled = this.configService.get<string>('SSO');
    let tokenVersion = 1;
    if (ssoEnabled == 'true') {
      // console.log('ssoEnabled', ssoEnabled);
      tokenVersion = await this.updateTokenVersion(user.phone);
    }
    return {
      code: 200,
      message: user.username + '登录成功',
      userinfo: result,
      access_token: this.jwtService.sign(ssoEnabled ? { ...result, tokenVersion } : result),
    };
  }

  async isUserExist(phone: string) {
    const user = await this.pgService.user.findUnique({
      where: { phone },
    });
    return !!user;
  }

  async updateTokenVersion(phone: string) {
    const tokenVersionKey = 'tokenVersion_' + phone;
    const tokenVersion = (await this.cacheManager.get(tokenVersionKey)) as number;
    const newTokenVersion = tokenVersion ? tokenVersion + 1 : 1;
    await this.cacheManager.set(
      tokenVersionKey,
      newTokenVersion,
      //  过期时间与token的过期时间一致
      this.configService.get<number>('TOKEN_VERSION_EXPIRES_IN', 1000 * 60 * 60 * 24 * 3),
    );
    return newTokenVersion;
  }

  async getSmsCode(phone: string, cachekey: string) {
    if (cachekey === 'register') {
      const user = await this.isUserExist(phone);
      if (user) {
        return { code: 400, message: '用户已存在, 请直接登录!' };
      }
    }
    return this.smsService.generateSmsCode(phone, cachekey);
  }

  //  ① 验证码登录
  //   1. 发送验证码后  前端轮询  会带上code和phone   发给后端进行核对
  //   2. 核对成功后  前端会带上phone和password  进行登录

  //  ② 扫码登录
  //   1. 前端拿到code后  发给后端
  //   2. 后端通过code  拿到用户的phone 或者 unionid等 唯一身份识别
  //   3. 根据唯一身份获取对应信息(从数据库查找)
  //   3.1 按正常登录流程  返回 token 及相关信息
  //   3.2 如果数据库没有对应信息  则向微信三方再次请求  获取用户信息  并写入到数据库 再执行3.1
  //   3.1.1 由于要设置初始密码 及用户信息  可能需要更改策略  ? 1. 后端直接初始化 , 再提供一个更新信息接口  2. 后端只设置正常信息, 前端提交头像密码后再返回token

  async getPhoneByToken(token: string) {
    const api = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${token}`;
    const res = await this.httpService.get(api);
    return res.data;
  }
  async getWechatInfoByOpenId(openid: string, token: string) {
    let userInfo = { nickname: '', headimgurl: '' };
    if (!openid || !token) return userInfo;
    const api = `https://api.weixin.qq.com/sns/userinfo?access_token=${token}&openid=${openid}`;

    const res: resultDataType<{ errcode?: number; nickname: string; headimgurl: string }> = await this.httpService.get(api);
    if (res.data.errcode) {
      console.log('xzz2021: AuthService -> getWechatInfoByOpenId -> res.data', res.data);
      return userInfo;
    }
    const { nickname, headimgurl } = res.data as { nickname: string; headimgurl: string };
    userInfo = { nickname, headimgurl };
    return userInfo;
  }

  async refreshToken(token: string) {
    const api = `https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=wxfcddbb227afa4d1d&grant_type=refresh_token&refresh_token=${token}`;
    try {
      const res: resultDataType<{ errcode?: number; access_token: string; refresh_token: string }> = await this.httpService.get(api);
      console.log('xzz2021: AuthService -> refreshToken -> res.data', res.data);
      if (res.data.errcode) {
        return null;
      }
      const { access_token, refresh_token } = res.data;
      return { access_token, refresh_token };
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async getUnionidBycode(code: string) {
    console.log('xzz2021: AuthService -> getUnionidBycode -> code', code);
    if (!code) return null;
    const api = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${this.wxAppId}&secret=${this.wxAppSecret}&code=${code}&grant_type=authorization_code`;
    // console.log('xzz2021: AuthService -> getUnionidBycode -> api', api);
    try {
      const res: resultDataType<{ errcode?: number; access_token: string; openid: string; refresh_token: string; unionid: string }> =
        await this.httpService.get(api);
      if (res.data.errcode) {
        console.log('xzz2021: AuthService -> getUnionidBycode -> res.data', res.data);
        return null;
      }
      const { access_token, openid, refresh_token, unionid } = res.data;
      // 查询unionid是否存在
      const wechatInfo = await this.pgService.wechatInfo.findUnique({
        where: { unionid },
      });
      if (wechatInfo) {
        // 更新
        await this.pgService.wechatInfo.update({
          where: { unionid },
          data: {
            accessToken: access_token,
            refreshToken: refresh_token,
          },
        });
      } else {
        const userInfo = await this.getWechatInfoByOpenId(openid, access_token);
        // 插入
        await this.pgService.wechatInfo.create({
          data: {
            accessToken: access_token,
            refreshToken: refresh_token,
            openid,
            unionid,
            ...userInfo,
          },
        });
      }
      return unionid;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async wechatLoginCheck(unionid: string) {
    const user = await this.pgService.user.findUnique({
      where: { wechatId: unionid },
      include: {
        roles: {
          select: {
            id: true,
          },
        },
      },
    });
    if (!user) {
      const wechatInfo = await this.pgService.wechatInfo.findUnique({
        where: { unionid },
      });
      if (!wechatInfo) {
        return { code: 400, message: '微信关联信息不存在, 请重新扫码!' };
      }
      const { nickname, headimgurl } = wechatInfo;
      return {
        code: 200,
        message: '用户手机号不存在, 需要进行绑定!',
        userinfo: { username: nickname, avatar: headimgurl, unionid },
      };
    }
    /// 如果手机号已存在  则不需要绑定   直接登录

    const { password, ...result } = user;
    const payload = {
      username: result.username,
      phone: result.phone,
      id: result.id,
      roleIds: result.roles.map(item => item.id),
    };
    return {
      code: 200,
      message: user.username + '登录成功',
      userinfo: result,
      access_token: this.jwtService.sign(payload),
    };
  }

  async wechatBind(data: { phone: string; password: string; smsCode: string; unionid: string; username: string; avatar: string }) {
    // 1. 校验 验证码
    const code = await this.cacheManager.get('bind_' + data.phone);
    if (code !== data.smsCode) {
      return { code: 400, message: '验证码错误, 请重新输入!' };
    }

    // 2. 校验 手机号是否存在  存在  ??抛出异常??   直接绑定 并更新对应帐号
    const user = await this.pgService.user.findUnique({
      where: { phone: data.phone },
    });
    if (user) {
      const hashedPassword = await hashPayPassword(data.password);
      try {
        await this.pgService.user.update({
          where: {
            phone: data.phone,
          },
          data: {
            wechatId: data.unionid,
            password: hashedPassword,
          },
        });
        const res2 = await this.login({ phone: data.phone, password: data.password });
        return res2;
      } catch (error) {
        console.log(error);
        return { code: 400, message: '绑定失败, 请重试!' };
      }
    }

    // 3.  如果用户不存在 正常流程注册帐号

    const res = await this.create({
      phone: data.phone,
      username: data.username,
      password: data.password,
      avatar: data.avatar,
      wechatId: data.unionid,
    });
    if (res?.code == 200) {
      const res2 = await this.login({ phone: data.phone, password: data.password });
      return res2;
    } else {
      return { code: 400, message: '绑定失败, 请重试!' };
    }

    // 4. 返回 正常流程登录  的数据
  }
  async wechatLogin(code: string) {
    try {
      const unionid = await this.getUnionidBycode(code);
      if (!unionid) {
        return { code: 400, message: '登录失败, 请重新扫码' };
      }
      const res = await this.wechatLoginCheck(unionid);
      return res;
    } catch (error) {
      console.log(error);
      return { code: 400, message: '登录失败, 请重新扫码' };
    }

    /*
    1. 通过code 获取 unionid 1.1 到数据库查询unionid关联信息  1.2 拿到phone 查询详情  1.3 直接登录 返回token
    2. 没有unionid关联信息  2.1 调用微信接口获取 并写入数据库  2.2 直接登录 返回token
    3. 无法查询到关联信息  提示帐号异常 使用手机号注册

    001. 拿到phone name avatar 调用注册 密码默认123456
    await this.create({ phone: phone, username: name, avatar: avatar, password: '123456' });
    const res = await this.login({ phone: phone, password: '123456' });
    */
    // const res = await this.getInfoBycode(data.code);
    return 'res';
  }

  //  短信登录
  async smsLogin(data: { phone: string; code: string }) {
    const checkCode = await this.cacheManager.get('login_' + data.phone);
    console.log('xzz2021: AuthService -> smsLogin -> checkCode', checkCode);
    if (checkCode != data.code) {
      return { code: 400, message: '验证码错误, 请重新输入!' };
    }

    // 如果验证码正确  则直接登录
    const user = await this.pgService.user.findUnique({
      where: { phone: data.phone },
      include: {
        roles: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
    if (!user) {
      return {
        code: 200,
        message: '用户手机号不存在, 需要进行绑定!',
        userinfo: { phone: data.phone },
      };
    }

    const { password, ...result } = user;
    return {
      code: 200,
      message: user.username + '登录成功',
      userinfo: result,
      access_token: this.jwtService.sign(result),
    };
  }

  async smsBind(data: { phone: string; password: string; username: string }) {
    //  1. 走正常注册流程
    await this.create({ phone: data.phone, username: data.username, password: data.password });
    const res = await this.login({ phone: data.phone, password: data.password });
    return res;
  }

  // refreshTokens(userId: number, _refreshToken: string) {
  //   // 校验refreshToken是否有效，是否和数据库存的匹配
  //   const payload = { sub: userId };

  //   const newAccessToken = this.jwtService.sign(payload, {
  //     secret: process.env.JWT_ACCESS_SECRET,
  //     expiresIn: '15m',
  //   });

  //   const newRefreshToken = this.jwtService.sign(payload, {
  //     secret: process.env.JWT_REFRESH_SECRET,
  //     expiresIn: '7d',
  //   });

  //   // 更新数据库里的refreshToken，旧的作废

  //   return {
  //     accessToken: newAccessToken,
  //     refreshToken: newRefreshToken,
  //   };
  // }
}
