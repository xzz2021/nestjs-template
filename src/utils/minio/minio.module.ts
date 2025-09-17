import { Module } from '@nestjs/common';
import { MinioClientService } from './minio.service';
import { MinioClientController } from './minio.controller';
import { MinioModule } from 'nestjs-minio-client';
@Module({
  imports: [
    MinioModule.register({
      endPoint: '127.0.0.1',
      port: 9089,
      useSSL: false,
      accessKey: 'ltVS29P31TtHrhqBZgRj',
      secretKey: 'E8eq8L3d3SOYfhA2X38RFnveORc6BQlqDeqIvF61',
    }),
  ],
  controllers: [MinioClientController],
  providers: [MinioClientService],
})
export class MinioClientModule {}
