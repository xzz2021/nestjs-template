import { PgService } from '@/prisma/pg.service';
import { hashPayPassword, verifyPayPassword } from '@/processor/utils';
import { resultDataType, UndiciHttpService } from '@/utils/undici.http.service';
import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginInfoDto, RegisterDto, SmsBindDto, SmsLoginDto } from './dto/auth.dto';
// import { AliSmsService } from '@/utils/sms/sms.service';
import { SseService } from '@/utils/sse/sse.service';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import Redis from 'ioredis';
import { LockoutService } from './lockout.service';
import { RtTokenService } from './rt.token.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  private readonly redis: Redis;
  private wxAppSecret: string;
  private wxAppId: string;
  constructor(
    private readonly pgService: PgService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly httpService: UndiciHttpService,
    // private readonly smsService: AliSmsService,
    private readonly configService: ConfigService,
    private readonly lockout: LockoutService,
    private readonly tokenService: TokenService,
    private readonly sseService: SseService,
    private readonly rtTokenService: RtTokenService,
  ) {
    const wechat = this.configService.get<{ appId: string; appSecret: string }>('wechat');
    this.wxAppSecret = wechat?.appSecret || '';
    this.wxAppId = wechat?.appId || '';
    this.redis = this.redisService.getOrThrow();
  }

  async create(createUserDto: RegisterDto, checkCode: boolean = true): Promise<{ message: string; res?: { id: number } }> {
    const { phone, password, username } = createUserDto;
    const user = await this.isUserExist(phone);
    if (user) {
      throw new ConflictException(phone + '手机号已存在');
    }

    // 注册前需要请求验证码 请求时已经将验证码存入cache  此处比对验证码 是否正确
    // if (checkCode) {
    //   // if 是为了复用create方法
    //   const smsCheck = await this.smsService.checkSmsCode('register_' + phone, code);
    //   if (!smsCheck.status) return smsCheck;
    // }

    const hashedPassword = await hashPayPassword(password);
    const res = await this.pgService.user.create({
      data: {
        phone,
        username,
        password: hashedPassword,
      },
    });
    await this.redis.del('register_' + phone); // 删除缓存的 验证码
    return { message: phone + '注册成功', res };
  }

  private async getUserForLogin(phone: string) {
    const user = await this.pgService.user.findUnique({
      where: { phone },
      select: {
        id: true,
        username: true,
        phone: true,
        password: true,
        roles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        avatar: true,
        email: true,
        birthday: true,
        gender: true,
        lockedUntil: true,
      },
    });
    return user;
  }

  async login(loginInfo: LoginInfoDto, ip: string) {
    const user = await this.getUserForLogin(loginInfo.phone);

    if (user) {
      //  校验锁定状态
      await this.lockout.ensureNotLocked(user);

      // 比对密码（无用户也走失败分支以防枚举）
      const ok = user ? await verifyPayPassword(user.password, loginInfo.password) : false;
      if (!ok) {
        await this.lockout.onFail(loginInfo.phone, ip, user ?? undefined);
        throw new BadRequestException('账号或密码错误'); //  不能抛出401  会导致前端请求 refresh token
      }

      // 成功：复位锁定状态
      await this.lockout.onSuccess(loginInfo.phone, ip, user);

      // 移除密码字段，避免返回给前端
      const { password, ...result } = user;
      const { username, phone, id, lockedUntil, roles } = result;

      const accessToken = await this.tokenService.signToken(id, { username, phone, id, lockedUntil, roles: roles.map(item => item.role) });

      return {
        message: user?.username + '登录成功',
        userinfo: result,
        access_token: accessToken,
      };
    }
  }

  async rtLogin(loginInfo: LoginInfoDto, ip: string, res: Response) {
    const user = await this.getUserForLogin(loginInfo.phone);

    if (user) {
      //  校验锁定状态
      await this.lockout.ensureNotLocked(user);

      // 比对密码（无用户也走失败分支以防枚举）
      const ok = user ? await verifyPayPassword(user.password, loginInfo.password) : false;
      if (!ok) {
        await this.lockout.onFail(loginInfo.phone, ip, user ?? undefined);
        throw new BadRequestException('账号或密码错误');
      }

      // 成功：复位锁定状态
      await this.lockout.onSuccess(loginInfo.phone, ip, user);

      // 移除密码字段，避免返回给前端
      const { password, ...result } = user;
      const { username, phone, id, lockedUntil, roles } = result;

      const { accessToken } = await this.rtTokenService.signToken(id, { username, phone, id, lockedUntil, roles: roles.map(item => item.role) }, res);
      // 暂未 利用 refreshToken 相应 功能  只是先实现
      // res.cookie('rt', refreshToken, {
      //   httpOnly: true,
      //   secure: !true,
      //   sameSite: 'lax',
      //   path: '/',
      //   maxAge: 15 * 24 * 60 * 60 * 1000,
      // });
      /*
      注意使用res设置cookie后   直接返回数据是无效的
      1. 使用return res.status(200).json({ accessToken });
      2. 使用@Res({ passthrough: true }), 让 Nest 继续负责序列化（JSON）, 因为NestJS接管了响应

      */
      return {
        message: user?.username + '登录成功',
        userinfo: result,
        access_token: accessToken,
      };
    }
  }

  async isUserExist(phone: string) {
    const user = await this.pgService.user.findUnique({
      where: { phone },
    });
    return !!user;
  }

  // async updateTokenVersion(phone: string) {
  //   const tokenVersionKey = 'tokenVersion_' + phone;
  //   const tokenVersion = (await this.redis.get(tokenVersionKey)) as number;
  //   const newTokenVersion = tokenVersion ? tokenVersion + 1 : 1;
  //   await this.redis.set(
  //     tokenVersionKey,
  //     newTokenVersion,
  //     //  过期时间与token的过期时间一致
  //     this.configService.get<number>('TOKEN_VERSION_EXPIRES_IN', 1000 * 60 * 60 * 24 * 3),
  //   );
  //   return newTokenVersion;
  // }

  async getSmsCode(phone: string, cachekey: string) {
    if (cachekey === 'register') {
      const user = await this.isUserExist(phone);
      if (user) {
        throw new BadRequestException('用户已存在, 请直接登录!');
      }
    }
    return { code: 200, message: '演示模式, 模拟验证码已发送,请60秒后再试!' };
    // return this.smsService.generateSmsCode(phone, cachekey);
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

  async refreshWechatToken(token: string) {
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
    const code = await this.redis.get('bind_' + data.phone);
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
        const res2 = await this.login2({ phone: data.phone, password: data.password });
        return res2;
      } catch (error) {
        console.log(error);
        return { code: 400, message: '绑定失败, 请重试!' };
      }
    }

    // 3.  如果用户不存在 正常流程注册帐号

    const res = await this.create(
      {
        phone: data.phone,
        username: data.username,
        password: data.password,
        avatar: data.avatar,
        wechatId: data.unionid,
        code: '',
      },
      false,
    );
    if (res?.res?.id) {
      return await this.login2({ phone: data.phone, password: data.password });
    }
    // return { code: 400, message: '绑定失败, 请重试!', res };

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
  async smsLogin(data: SmsLoginDto) {
    const checkCode = await this.redis.get('login_' + data.phone);
    if (checkCode != data.code) {
      throw new BadRequestException('验证码错误, 请重新输入!');
    }

    // 如果验证码正确  则直接登录
    const user = await this.pgService.user.findUnique({
      where: { phone: data.phone },
      include: {
        roles: true,
      },
    });
    if (!user) {
      throw new BadRequestException('用户手机号不存在, 需要进行绑定!');
    }

    const { password, ...result } = user;
    return { message: user.username + '登录成功', userinfo: result, access_token: this.jwtService.sign(result) };
  }

  async smsBind(data: SmsBindDto) {
    //  1. 走正常注册流程
    await this.create({ ...data, code: '' }, false);
    return await this.login2({ phone: data.phone, password: data.password });
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

  async forceLogout(id: number) {
    await this.tokenService.kickOthers(id);
    await this.sseService.removeOnlineUser(id);
    this.sseService.sendToClients(id, { type: 'focusLogOut' });

    return { message: '强制用户下线成功', id };
  }

  async logout(id: number, jti: string) {
    await this.tokenService.logout(id, jti);
    return { message: '退出登录成功', id };
  }

  async unlock(id: number) {
    //  移除redis限制   重置数据库锁定信息
    await this.lockout.unlockUser(id);
    return { message: '解锁用户成功', id };
  }

  /**
   * 验证Token是否正确,如果正确则返回所属用户对象
   * @param token
   */
  async verifyAccessToken(token: string): Promise<any> {
    return this.jwtService.verifyAsync(token);
  }

  async login2(loginInfo: { phone: string; password: string }) {
    const user = await this.pgService.user.findUnique({
      where: { phone: loginInfo.phone },
      select: {
        id: true,
        username: true,
        phone: true,
        password: true,
        roles: true,
        avatar: true,
        email: true,
        birthday: true,
        gender: true,
        lockedUntil: true,
      },
    });

    if (user) {
      // 比对密码（无用户也走失败分支以防枚举）
      const ok = user ? await verifyPayPassword(user.password, loginInfo.password) : false;
      if (!ok) {
        throw new UnauthorizedException('账号或密码错误');
      }
      // 移除密码字段，避免返回给前端
      const { password, ...result } = user;
      const access_token = await this.tokenService.signToken(user.id, result);
      return {
        message: user.username + '登录成功',
        userinfo: result,
        access_token,
      };
    }
  }

  async rtRefresh(userId: number, res: Response, oldJti: string) {
    //  这里需要返回2个token  最好存入redis  每次获取新的   都要revoke旧的
    const user = await this.pgService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        phone: true,
        password: true,
        roles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        avatar: true,
        email: true,
        birthday: true,
        gender: true,
        lockedUntil: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    const { username, phone, id, lockedUntil, roles } = user;
    //  正常需要在签发新的时  更新refreshToken(已实现)  revoke旧的accessToken(未实现, 后期优化)
    const { accessToken } = await this.rtTokenService.signToken(userId, { username, phone, id, lockedUntil, roles: roles.map(item => item.role) }, res, oldJti);
    return { access_token: accessToken, message: '获取新的token成功' };
  }
}
