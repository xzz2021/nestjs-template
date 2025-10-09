import { Public, Serialize } from '@/processor/decorator';
import { CaptchaGuard, JwtRefreshAuthGuard } from '@/processor/guard';
import { extractIP } from '@/processor/utils';
import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { ForceLogoutDto, JwtReqDto, LoginInfoDto, RegisterDto, RegisterResDto, SmsBindDto, SmsCodeDto, SmsLoginDto } from './dto/auth.dto';

@Public()
@ApiTags('帐号权限')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Serialize(RegisterResDto)
  @ApiOperation({ summary: '用户注册' })
  create(@Body() createUserinfo: RegisterDto) {
    return this.authService.create(createUserinfo);
  }

  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @UseGuards(CaptchaGuard)
  login(@Body() loginInfo: LoginInfoDto, @Req() req: Request) {
    return this.authService.login(loginInfo, extractIP((req['ip'] as string) ?? ''));
  }

  @Post('rt/login')
  @ApiOperation({ summary: '用户登录(refreshToken版本)' })
  @UseGuards(CaptchaGuard)
  rtLogin(@Body() loginInfo: LoginInfoDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.rtLogin(loginInfo, extractIP((req['ip'] as string) ?? ''), res);
  }

  @Post('getSmsCode')
  @Throttle({ default: { limit: 5, ttl: 5 * 60 * 1000 } })
  @ApiOperation({ summary: '获取短信验证码' })
  getSmsCode(@Body() data: SmsCodeDto) {
    return this.authService.getSmsCode(data.phone, data.type);
  }

  @Post('wechat/login')
  @ApiOperation({ summary: '微信登录' })
  wechatLogin(@Body() data: { code: string }) {
    return this.authService.wechatLogin(data.code);
  }

  @Post('wechat/bind')
  @ApiOperation({ summary: '微信绑定' })
  wechatBind(
    @Body()
    data: {
      phone: string;
      password: string;
      smsCode: string;
      unionid: string;
      username: string;
      avatar: string;
    },
  ) {
    return this.authService.wechatBind(data);
  }

  @Post('sms/login')
  @ApiOperation({ summary: '短信登录' })
  smsLogin(@Body() data: SmsLoginDto) {
    return this.authService.smsLogin(data);
  }

  @Post('sms/bind')
  @ApiOperation({ summary: '短信绑定' })
  smsBind(@Body() data: SmsBindDto) {
    return this.authService.smsBind(data);
  }

  @Post('refresh')
  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  refresh(@Req() req: JwtReqDto, @Res({ passthrough: true }) res: Response) {
    // console.log('xzz2021: AuthController -> refresh -> userId:', req.user);
    const { id: userId, jti: oldJti } = req.user;
    return this.authService.rtRefresh(userId, res, oldJti);
  }

  @Post('logout')
  @ApiOperation({ summary: '用户主动退出登录' })
  logout(@Body() body: ForceLogoutDto, @Req() req: JwtReqDto) {
    const jti: string = req.user.jti;
    return this.authService.logout(body.id, jti);
  }

  @Post('forceLogout')
  @ApiOperation({ summary: '强制用户下线' })
  forceLogout(@Body() body: ForceLogoutDto) {
    return this.authService.forceLogout(body.id);
  }

  @Post('unlock')
  @ApiOperation({ summary: '解锁用户' })
  unlock(@Body() body: ForceLogoutDto) {
    return this.authService.unlock(body.id);
  }
}
