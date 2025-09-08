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
          signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRES_IN', '3d'), // 默认 7 天
          },
        };
      },
    }),
    SmsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LockoutService, TokenService, JwtStrategy, JwtRefreshStrategy],
  exports: [AuthService, LockoutService, TokenService],
})
export class AuthModule {}
