import { Module } from '@nestjs/common';
import { MinioClientService } from './minio.service';
import { MinioClientController } from './minio.controller';
import { MinioModule } from 'nestjs-minio-client';
import { MinioS3Service } from './minio.s3.service';
import { S3Client } from '@aws-sdk/client-s3';
import { MinioS3Controller } from './minio.s3.controller';
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
  controllers: [MinioClientController, MinioS3Controller],
  providers: [
    MinioClientService,
    MinioS3Service,
    {
      provide: S3Client,
      useFactory: () =>
        new S3Client({
          region: 'us-east-1',
          endpoint: 'http://127.0.0.1:9089',
          credentials: {
            accessKeyId: 'ltVS29P31TtHrhqBZgRj',
            secretAccessKey: 'E8eq8L3d3SOYfhA2X38RFnveORc6BQlqDeqIvF61',
          },
          forcePathStyle: true, // MinIO 需要
        }),
    },
  ],
  exports: [S3Client],
})
export class MinioClientModule {}
