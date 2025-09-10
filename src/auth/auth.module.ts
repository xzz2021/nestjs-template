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
  providers: [AuthService, LockoutService, TokenService, JwtStrategy, JwtRefreshStrategy],
  exports: [AuthService, LockoutService, TokenService],
})
export class AuthModule {}
