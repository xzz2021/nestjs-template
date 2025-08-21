import { Module, Global } from '@nestjs/common';
import { SshService } from './ssh.service';

@Module({
  providers: [SshService],
  exports: [SshService],
})
@Global()
export class SshModule {}
