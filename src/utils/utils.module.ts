import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IpToAddressService } from './ip-to-address.service';
import { ServerService } from './server.service';
import { SshService } from './ssh.service';
import { UndiciHttpService } from './undici.http.service';
import { UtilsController } from './utils.controller';
@Global()
@Module({
  imports: [ConfigModule],
  controllers: [UtilsController],
  providers: [SshService, UndiciHttpService, IpToAddressService, ServerService],
  exports: [SshService, UndiciHttpService, IpToAddressService],
})
export class UtilsModule {}

/*


const FLAG_MODULE: Record<string, any> = {
  WS: WsModule,
};

function buildFeatureImports() {
  const imports: any[] = [];
  for (const [key, enabled] of Object.entries(moduleFactory())) {
    if (enabled) {
      imports.push(FLAG_MODULE[key]);
    }
  }
  return imports;
}


*/
