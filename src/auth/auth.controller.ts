import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginInfoDto, RegisterDto, SmsBindDto, SmsCodeDto, SmsLoginDto } from './dto/auth.dto';
import { Public } from '@/processor/decorator/public.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
// import { JwtRefreshAuthGuard } from '@/processor/guard/jwt-refresh.guard';
import { Serialize } from '@/processor/decorator/serialize';
import { RegisterResDto } from './dto/auth.dto';
import { extractIP } from '@/processor/utils/string';

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
  login(@Body() loginInfo: LoginInfoDto, @Req() req: Request) {
    return this.authService.login(loginInfo, extractIP((req['ip'] as string) ?? ''));
  }

  @Post('getSmsCode')
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

  // @UseGuards(JwtRefreshAuthGuard)
  // @Post('refresh')
  // refresh(@Req() req: any) {
  //   const { userId, refreshToken } = req['body'] as { userId: number; refreshToken: string };
  //   return this.authService.refreshTokens(userId, refreshToken);
  // }
}
