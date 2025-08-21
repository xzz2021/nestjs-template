// common/http/undici-http.module.ts
import { Global, Module } from '@nestjs/common';
import { UndiciHttpService } from './undici.http.service';

@Global()
@Module({
  providers: [UndiciHttpService],
  exports: [UndiciHttpService],
})
export class HttpModule {}

/*
此服务不稳定 不建议使用

*/
