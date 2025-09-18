import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { MinioService } from 'nestjs-minio-client';
import { FileInfoDto, SearchFilesResDto, UploadChunkDto } from './dto/minio.dto';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
@Injectable()
export class MinioClientService {
  private readonly redis: Redis;
  constructor(
    private readonly minioService: MinioService,
    private readonly redisService: RedisService,
  ) {
    this.redis = this.redisService.getOrThrow();
  }

  async getListAllBuckets(): Promise<any> {
    const list = await this.minioService.client.listBuckets();
    console.log('xzz2021: MinioClientService -> getListAllBuckets -> list:', list);
    return { list, message: '获取所有桶成功' };
  }

  // 获取public桶的列表 - 文件夹排列在前面
  async getListPublicBucket(prefix: string = '') {
    return new Promise((resolve, reject) => {
      const objectsList: any[] = [];

      const stream = this.minioService.client.listObjects('public', prefix, !true);

      stream.on('data', obj => {
        objectsList.push(obj);
        // console.log('xzz2021: 对象信息:', obj);
      });

      stream.on('error', err => {
        console.error('xzz2021: 流错误:', err);
        reject(err);
      });

      stream.on('end', () => {
        // 过滤掉空的占位文件（文件夹占位符）
        const filteredList = objectsList.filter(obj => {
          // 过滤掉以 / 结尾且大小为 0 的占位文件
          if (obj.name && obj.name.endsWith('/') && obj.size === 0) {
            return false;
          }
          return true;
        });

        // 修复排序逻辑：处理文件夹和文件的不同属性
        const sortedList = filteredList.sort((a, b) => {
          // 获取用于比较的名称
          const aName = a.name || a.prefix || '';
          const bName = b.name || b.prefix || '';

          // 判断是否为文件夹
          const aIsDir = !!a.prefix;
          const bIsDir = !!b.prefix;

          // 文件夹在前，文件在后
          if (aIsDir && !bIsDir) return -1;
          if (!aIsDir && bIsDir) return 1;

          // 同类型按名称排序
          return aName.localeCompare(bName);
        });

        // console.log('xzz2021: MinioClientService -> getListPublicBucket -> 总对象数:', sortedList.length);
        resolve({
          list: sortedList,
          total: sortedList.length,
          message: '获取public文件列表成功',
        });
      });
    });
  }

  // 创建文件夹
  async createFolder(folderName: string, parentPath: string = '') {
    const folderPath = parentPath ? `${parentPath}/${folderName}/` : `${folderName}/`;
    try {
      // 确保文件夹名称以 / 结尾

      // 检查文件夹是否已存在
      const exists = await this.minioService.client.statObject('public', folderPath);
      if (exists) {
        throw new BadRequestException('文件夹已存在');
      }
    } catch (error) {
      if (error.code === 'NotFound') {
        // 文件夹不存在，可以创建
        try {
          // 创建一个空的占位文件来模拟文件夹
          await this.minioService.client.putObject('public', folderPath, '');
          console.log('xzz2021: 文件夹创建成功:', folderPath);
          return {
            message: '文件夹创建成功',
            folderPath,
            folderName,
          };
        } catch (createError) {
          console.error('xzz2021: 创建文件夹失败:', createError);
          throw new BadRequestException('创建文件夹失败');
        }
      } else {
        throw error;
      }
    }
  }

  // 上传文件
  async uploadFile(file: Express.Multer.File, folderPath: string = '') {
    try {
      const fileName = file.originalname;
      const objectName = folderPath ? `${folderPath}${fileName}` : fileName;

      // 检查文件是否已存在
      try {
        await this.minioService.client.statObject('public', objectName);
        throw new BadRequestException('文件已存在，请重命名后上传');
      } catch (error) {
        if (error.code !== 'NotFound') {
          throw error;
        }
      }

      // 上传文件
      const result = await this.minioService.client.putObject('public', objectName, file.buffer, file.size, {
        'Content-Type': file.mimetype,
        'Content-Length': file.size.toString(),
      });

      console.log('xzz2021: 文件上传成功:', objectName);
      return {
        message: '文件上传成功',
        fileName,
        objectName,
        size: file.size,
        mimeType: file.mimetype,
        etag: result.etag,
      };
    } catch (error) {
      console.error('xzz2021: 文件上传失败:', error);
      throw new BadRequestException('文件上传失败: ' + error.message);
    }
  }

  // 下载文件
  async downloadFile(objectName: string): Promise<UploadChunkDto> {
    try {
      // 检查文件是否存在
      const stat = await this.minioService.client.statObject('public', objectName);

      // 获取文件流
      const stream = await this.minioService.client.getObject('public', objectName);

      console.log('xzz2021: 文件下载成功:', objectName);
      return {
        stream,
        stat,
        objectName,
        size: stat.size,
        mimeType: stat.metaData['content-type'] || 'application/octet-stream',
      };
    } catch (error) {
      if (error.code === 'NotFound') {
        throw new NotFoundException('文件不存在');
      }
      console.error('xzz2021: 文件下载失败:', error);
      throw new BadRequestException('文件下载失败: ' + error.message);
    }
  }

  // 删除文件或文件夹
  async deleteObject(objectName: string) {
    try {
      await this.minioService.client.removeObject('public', objectName);
      console.log('xzz2021: 对象删除成功:', objectName);
      return {
        message: '删除成功',
        objectName,
      };
    } catch (error) {
      console.error('xzz2021: 对象删除失败:', error);
      throw new BadRequestException('删除失败: ' + error.message);
    }
  }

  // 获取文件信息
  async getFileInfo(objectName: string): Promise<FileInfoDto> {
    try {
      const stat = await this.minioService.client.statObject('public', objectName);
      return {
        objectName,
        size: stat.size,
        lastModified: stat.lastModified,
        etag: stat.etag,
        mimeType: stat.metaData['content-type'] || 'application/octet-stream',
        metaData: stat.metaData,
      };
    } catch (error) {
      if (error.code === 'NotFound') {
        throw new NotFoundException('文件不存在');
      }
      throw new BadRequestException('获取文件信息失败: ' + error.message);
    }
  }

  // 生成预签名URL（用于直接上传/下载）
  async getPresignedUrl(objectName: string, operation: 'get' | 'put' = 'get', expiry: number = 3600) {
    try {
      let url: string;
      if (operation === 'get') {
        url = await this.minioService.client.presignedGetObject('public', objectName, expiry);
      } else {
        url = await this.minioService.client.presignedPutObject('public', objectName, expiry);
      }

      return {
        url,
        objectName,
        operation,
        expiry,
        message: '预签名URL生成成功',
      };
    } catch (error) {
      console.error('xzz2021: 生成预签名URL失败:', error);
      throw new BadRequestException('生成预签名URL失败: ' + error.message);
    }
  }

  // 搜索文件
  async searchFiles(searchTerm: string, prefix: string = ''): Promise<SearchFilesResDto> {
    return new Promise((resolve, reject) => {
      const objectsList: any[] = [];

      const stream = this.minioService.client.listObjects('public', prefix, true);

      stream.on('data', obj => {
        objectsList.push(obj);
      });

      stream.on('error', err => {
        console.error('xzz2021: 搜索流错误:', err);
        reject(err);
      });

      stream.on('end', () => {
        // 过滤掉空的占位文件（文件夹占位符）
        const filteredList = objectsList.filter(obj => {
          // 过滤掉以 / 结尾且大小为 0 的占位文件
          if (obj.name && obj.name.endsWith('/') && obj.size === 0) {
            return false;
          }
          return true;
        });

        // 根据搜索词过滤文件
        const searchResults = filteredList.filter(obj => {
          const fileName = obj.name || obj.prefix || '';
          return fileName.toLowerCase().includes(searchTerm.toLowerCase());
        });

        // 排序：文件夹在前，文件在后，同类型按名称排序
        const sortedList = searchResults.sort((a, b) => {
          const aName = a.name || a.prefix || '';
          const bName = b.name || b.prefix || '';
          const aIsDir = !!a.prefix;
          const bIsDir = !!b.prefix;

          if (aIsDir && !bIsDir) return -1;
          if (!aIsDir && bIsDir) return 1;
          return aName.localeCompare(bName);
        });

        console.log('xzz2021: 搜索完成，找到', sortedList.length, '个匹配项');
        resolve({
          list: sortedList,
          total: sortedList.length,
          message: `搜索完成，找到 ${sortedList.length} 个匹配项`,
        });
      });
    });
  }
}
