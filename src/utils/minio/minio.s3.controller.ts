import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { Public } from '@/processor/decorator/public.decorator';
import { MinioS3Service } from './minio.s3.service';

@Public()
@Controller('minio/s3')
export class MinioS3Controller {
  constructor(private readonly minioS3Service: MinioS3Service) {}

  @Post('init')
  async init(@Body() dto: { bucket: string; key: string; contentType?: string }) {
    return this.minioS3Service.initiateMultipartUpload(dto.bucket, dto.key, dto.contentType);
  }

  @Get('presign-part')
  async presign(
    @Query()
    q: {
      bucket: string;
      key: string;
      uploadId: string;
      partNumber: string;
      expiresIn?: string;
    },
  ) {
    const expires = q.expiresIn ? Number(q.expiresIn) : 3600;
    return this.minioS3Service.presignPartUrl(q.bucket, q.key, q.uploadId, Number(q.partNumber), expires);
  }

  @Get('list-parts')
  async list(@Query() q: { bucket: string; key: string; uploadId: string }) {
    return this.minioS3Service.listUploadedParts(q.bucket, q.key, q.uploadId);
  }

  @Post('complete')
  async complete(
    @Body()
    dto: {
      bucket: string;
      key: string;
      uploadId: string;
      parts: { partNumber: number; etag: string }[];
    },
  ) {
    return this.minioS3Service.completeMultipartUpload(dto.bucket, dto.key, dto.uploadId, dto.parts);
  }

  // 选配：便于中止与回查
  @Post('abort')
  async abort(@Body() dto: { bucket: string; key: string; uploadId: string }) {
    return this.minioS3Service.abortMultipartUpload(dto.bucket, dto.key, dto.uploadId);
  }

  @Get('head')
  async head(@Query() q: { bucket: string; key: string }) {
    return this.minioS3Service.headObject(q.bucket, q.key);
  }
}
