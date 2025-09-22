import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MinioClientModule } from '@/utils/minio/minio.module';
@Module({
  imports: [MinioClientModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
