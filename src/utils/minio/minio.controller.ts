import { BadRequestException, Body, Controller, Delete, Get, Header, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { MinioClientService } from './minio.service';

// @Public()
@Controller('minio')
export class MinioClientController {
  constructor(private readonly minioClientService: MinioClientService) {}

  @Get('allBuckets')
  list() {
    return this.minioClientService.getListAllBuckets();
  }

  @Get('publicBucket')
  listPublicBucket(@Query('prefix') prefix: string = '') {
    return this.minioClientService.getListPublicBucket(prefix);
  }

  // 创建文件夹
  @Post('createFolder')
  createFolder(@Body() body: { folderName: string; parentPath?: string }) {
    const { folderName, parentPath = '' } = body;
    if (!folderName) {
      throw new BadRequestException('文件夹名称不能为空'); // 文件夹名称不能为空
    }
    return this.minioClientService.createFolder(folderName, parentPath);
  }

  // 上传文件
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File, @Body() body: { folderPath?: string }) {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件'); // 请选择要上传的文件
    }
    return this.minioClientService.uploadFile(file, body?.folderPath || '');
  }

  // 下载文件 - 修改路由路径
  @Get('download')
  @Header('Content-Type', 'application/octet-stream')
  async downloadFile(@Query('objectName') objectName: string, @Res() res: Response) {
    if (!objectName) {
      return res.status(400).json({ message: 'objectName 参数不能为空' });
    }

    try {
      const result = await this.minioClientService.downloadFile(objectName);

      // 设置响应头
      res.set({
        'Content-Type': result.mimeType,
        'Content-Length': result.size.toString(),
        'Content-Disposition': `attachment; filename="${encodeURIComponent(objectName)}"`,
      });

      // 使用 Promise 包装流处理，避免异常过滤器干扰
      return new Promise<void>((resolve, reject) => {
        let isFinished = false;

        // 流错误处理
        result.stream.on('error', error => {
          console.error('下载流错误:', error);
          if (!isFinished && !res.headersSent) {
            isFinished = true;
            res.status(500).json({ message: '文件下载失败' });
            reject(error as Error);
          }
        });

        // 流结束处理
        result.stream.on('end', () => {
          console.log('文件下载完成');
          if (!isFinished) {
            isFinished = true;
            resolve();
          }
        });

        // 响应结束处理
        res.on('close', () => {
          if (!isFinished) {
            isFinished = true;
            // result.stream.destroy();
          }
        });

        // 开始管道传输
        result.stream.pipe(res);
      });
    } catch (error) {
      if (!res.headersSent) {
        res.status(404).json({ message: error.message });
      }
    }
  }

  // 下载文件夹（压缩为ZIP）
  @Get('folder/download')
  @Header('Content-Type', 'application/zip')
  async downloadFolder(@Query('folderPath') folderPath: string, @Res() res: Response) {
    if (!folderPath) {
      return res.status(400).json({ message: 'folderPath 参数不能为空' });
    }

    try {
      const result = await this.minioClientService.downloadFolder(folderPath);
      console.log('xzz2021: 文件夹下载结果:', result);

      // 设置响应头
      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(result.objectName)}"`,
        'Cache-Control': 'no-cache',
      });

      // 使用 Promise 包装流处理
      return new Promise<void>((resolve, reject) => {
        let isFinished = false;

        // 流错误处理
        result.stream.on('error', error => {
          console.error('下载文件夹流错误:', error);
          if (!isFinished && !res.headersSent) {
            isFinished = true;
            res.status(500).json({ message: '文件夹下载失败' });
            reject(error as Error);
          }
        });

        // 流结束处理
        result.stream.on('end', () => {
          console.log('文件夹下载完成');
          if (!isFinished) {
            isFinished = true;
            resolve();
          }
        });

        // 响应结束处理
        res.on('close', () => {
          if (!isFinished) {
            isFinished = true;
          }
        });

        // 开始管道传输
        result.stream.pipe(res);
      });
    } catch (error) {
      if (!res.headersSent) {
        res.status(404).json({ message: error?.message || '文件夹下载失败' });
      }
    }
  }

  // 获取文件信息 - 修改路由路径
  @Get('info')
  getFileInfo(@Query('objectName') objectName: string) {
    if (!objectName) {
      throw new BadRequestException('objectName 参数不能为空'); // objectName 参数不能为空
    }
    return this.minioClientService.getFileInfo(objectName);
  }

  // 删除文件或文件夹 - 修改路由路径
  @Delete('delete')
  deleteObject(@Query('objectName') objectName: string) {
    if (!objectName) {
      throw new BadRequestException('objectName 参数不能为空'); // objectName 参数不能为空
    }
    return this.minioClientService.deleteObject(objectName);
  }

  // 搜索文件
  @Get('search')
  searchFiles(@Query('searchTerm') searchTerm: string, @Query('prefix') prefix: string = '') {
    if (!searchTerm) {
      throw new BadRequestException('搜索关键词不能为空'); // 搜索关键词不能为空
    }
    // console.log('xzz2021: MinioClientController -> searchFiles -> searchTerm:', searchTerm, 'prefix:', prefix);
    return this.minioClientService.searchFiles(searchTerm, prefix);
  }

  // 生成预签名URL - 修改路由路径
  @Get('presigned')
  getPresignedUrl(@Query('objectName') objectName: string, @Query('operation') operation: 'get' | 'put' = 'get', @Query('expiry') expiry: string = '3600') {
    if (!objectName) {
      throw new BadRequestException('objectName 参数不能为空'); // objectName 参数不能为空
    }
    return this.minioClientService.getPresignedUrl(objectName, operation, parseInt(expiry));
  }

  // 获取公开桶文件的固定URL
  @Get('publicFileUrl')
  getPublicFileUrl(@Query('objectName') objectName: string) {
    return this.minioClientService.getPublicFileUrl(objectName);
  }
}
