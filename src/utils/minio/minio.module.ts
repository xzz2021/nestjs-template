import { Module } from '@nestjs/common';
import { MinioClientService } from './minio.service';
import { MinioClientController } from './minio.controller';
import { MinioModule } from 'nestjs-minio-client';
import { MinioS3Service } from './minio.s3.service';
import { S3Client } from '@aws-sdk/client-s3';
import { MinioS3Controller } from './minio.s3.controller';
import { ConfigService } from '@nestjs/config';
@Module({
  imports: [
    MinioModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const minio = configService.get('minio');
        return {
          endPoint: minio.host,
          port: Number(minio.port),
          useSSL: false,
          accessKey: minio.accessKey,
          secretKey: minio.secretKey,
        };
      },
    }),
  ],
  controllers: [MinioClientController, MinioS3Controller],
  providers: [
    MinioClientService,
    MinioS3Service,
    {
      provide: S3Client,
      useFactory: (configService: ConfigService) => {
        const minio = configService.get('minio');
        // console.log('🚀 ~ useFactory ===========~ minio:', minio);
        return new S3Client({
          region: 'us-east-1',
          endpoint: minio.url,
          credentials: {
            accessKeyId: minio.accessKey,
            secretAccessKey: minio.secretKey,
          },
          forcePathStyle: true, // MinIO 需要
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [S3Client, MinioClientService],
})
export class MinioClientModule {}
