import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { JwtRefreshStrategy } from './jwt.refresh.strategy';
import { SmsModule } from '@/utils/sms/sms.module';
import { ConfigService } from '@nestjs/config';
import { LockoutService } from './lockout.service';
import { TokenService } from './token.service';
import { SseController } from '@/utils/sse/sse.controller';
import { SseModule } from '@/utils/sse/sse.module';
import { RtTokenService } from './rt.token.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // console.log(configService.get<string>('JWT_SECRET'));
        // console.log(configService.get<string>('JWT_EXPIRES_IN', '3d'));
        return {
          // global: true,
          secret: configService.get<string>('JWT_SECRET'),
          // signOptions: {
          //   expiresIn: Number(configService.get<string>('JWT_EXPIRES_TIME')), // 默认 7 天
          // },
        };
      },
    }),
    SmsModule,
    SseModule,
  ],
  controllers: [AuthController, SseController],
  providers: [AuthService, LockoutService, TokenService, RtTokenService, JwtStrategy, JwtRefreshStrategy],
  exports: [AuthService, LockoutService, TokenService, RtTokenService],
})
export class AuthModule {}

/*
2种token注意事项

1. 一般jwttoken 前端存入localstroage  后端从header取   多点登录 根据 数组长度限制  以及单个jwtid记录 用于加黑剔除
1.2 token到期自动失效


2. 双token  弱化jwttoken  一般校验有效期即可    而rttoken依据第一点的逻辑 进行处理   
2.1  区别在于 rttoken取自cookies  且token需要不断刷新 换取2个新token 同时移除旧的


*/
