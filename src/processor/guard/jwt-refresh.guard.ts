// jwt-refresh-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

//  局部接口使用
@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard('jwt-refresh') {}
