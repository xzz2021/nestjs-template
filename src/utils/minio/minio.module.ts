import { S3Client } from '@aws-sdk/client-s3';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MinioModule } from 'nestjs-minio-client';
import { MinioClientController } from './minio.controller';
import { MinioS3Controller } from './minio.s3.controller';
import { MinioS3Service } from './minio.s3.service';
import { MinioClientService } from './minio.service';
@Module({
  imports: [
    MinioModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const minio = configService.get('minio');
        // 注意  外网代理会导致出错  需要关闭
        return {
          endPoint: minio.host,
          port: Number(minio.port),
          useSSL: minio.url.includes('https'), // 一律使用false 否则要配置证书
          accessKey: minio.accessKey,
          secretKey: minio.secretKey,
          region: 'us-east-1',
          forcePathStyle: true,
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
  exports: [MinioClientService],
})
export class MinioClientModule {}
