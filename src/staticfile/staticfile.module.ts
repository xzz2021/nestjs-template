import { Module } from '@nestjs/common';
import { StaticfileController } from './staticfile.controller';
import { StaticfileService } from './staticfile.service';

@Module({
  controllers: [StaticfileController],
  providers: [StaticfileService],
  exports: [StaticfileService],
})
export class StaticfileModule {}
