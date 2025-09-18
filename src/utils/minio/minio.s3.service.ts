// upload.service.ts
import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  HeadObjectCommand,
  ListPartsCommand,
  S3Client,
  AbortMultipartUploadCommand,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class MinioS3Service {
  private readonly redis: Redis;
  constructor(
    private readonly s3: S3Client,
    private readonly redisService: RedisService,
  ) {
    this.redis = this.redisService.getOrThrow();
  }
  async initiateMultipartUpload(bucket: string, key: string, contentType?: string) {
    const cmd = new CreateMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType || 'application/octet-stream',
    });
    const out = await this.s3.send(cmd);
    if (!out.UploadId) throw new Error('No UploadId returned');
    return { uploadId: out.UploadId };
  }

  async presignPartUrl(bucket: string, key: string, uploadId: string, partNumber: number, expiresInSec = 3600) {
    const cmd = new UploadPartCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
      // Body 可不填；预签名仅基于 HTTP 方法与路径/查询参数
    });
    const url = await getSignedUrl(this.s3, cmd, { expiresIn: expiresInSec });
    return { url };
  }

  /** 拉取所有分片（处理分页） */
  async listUploadedParts(bucket: string, key: string, uploadId: string) {
    const all: { partNumber: number; etag: string; size: number }[] = [];
    let partNumberMarker: string | undefined = undefined;

    while (true) {
      const out = await this.s3.send(
        new ListPartsCommand({
          Bucket: bucket,
          Key: key,
          UploadId: uploadId,
          PartNumberMarker: partNumberMarker,
          MaxParts: 1000,
        }),
      );
      for (const p of out.Parts || []) {
        all.push({
          partNumber: p.PartNumber!,
          etag: p.ETag!,
          size: p.Size!,
        });
      }
      if (!out.IsTruncated) break;
      partNumberMarker = out.NextPartNumberMarker;
    }
    // 升序返回
    all.sort((a, b) => a.partNumber - b.partNumber);
    return { list: all };
  }

  async completeMultipartUpload(bucket: string, key: string, uploadId: string, parts: { partNumber: number; etag: string }[]) {
    const cmd = new CompleteMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts
          .slice()
          .sort((a, b) => a.partNumber - b.partNumber)
          .map(p => ({
            ETag: ensureQuoted(p.etag),
            PartNumber: p.partNumber,
          })),
      },
    });
    await this.s3.send(cmd);

    // 合并完成后回查对象信息
    const head = await this.s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return {
      data: {
        ok: true,
        bucket,
        key,
        size: Number(head.ContentLength || 0),

        etag: stripQuotes(head.ETag || ''),
        contentType: head.ContentType,
        lastModified: head.LastModified?.toISOString(),
      },
      message: '合并成功!',
    };

    function ensureQuoted(s: string) {
      if (!s) return s;
      return s.startsWith('"') ? s : `"${s}"`;
    }
    function stripQuotes(s: string) {
      return s?.startsWith('"') && s.endsWith('"') ? s.slice(1, -1) : s;
    }
  }

  async abortMultipartUpload(bucket: string, key: string, uploadId: string) {
    await this.s3.send(new AbortMultipartUploadCommand({ Bucket: bucket, Key: key, UploadId: uploadId }));
    return { ok: true };
  }

  async headObject(bucket: string, key: string) {
    const head = await this.s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return {
      bucket,
      key,
      size: Number(head.ContentLength || 0),
      etag: head.ETag && head.ETag.replace(/^"|"$/g, ''),
      contentType: head.ContentType,
      lastModified: head.LastModified?.toISOString(),
    };
  }
}
