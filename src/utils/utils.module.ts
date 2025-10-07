import { Global, Module } from '@nestjs/common';
import { SshService } from './ssh.service';
import { ConfigModule } from '@nestjs/config';
import { UndiciHttpService } from './undici.http.service';
import { IpToAddressService } from './ip-to-address.service';
@Global()
@Module({
  imports: [ConfigModule],
  providers: [SshService, UndiciHttpService, IpToAddressService],
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
