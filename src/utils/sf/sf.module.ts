import { Module } from '@nestjs/common';
import { SfService } from './sf.service';

@Module({
  providers: [SfService],
  exports: [SfService],
})
export class SfModule {}
