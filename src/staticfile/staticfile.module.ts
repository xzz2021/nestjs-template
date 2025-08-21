import { Module, Global } from '@nestjs/common';
import { StaticfileService } from './staticfile.service';
import { StaticfileController } from './staticfile.controller';

@Global()
@Module({
  controllers: [StaticfileController],
  providers: [StaticfileService],
  exports: [StaticfileService],
})
export class StaticfileModule {}
