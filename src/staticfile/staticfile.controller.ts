import { Controller, Post, Body, UploadedFile, UseInterceptors, Get, StreamableFile, Header } from '@nestjs/common';
import { StaticfileService } from './staticfile.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { generateMulterConfigOfImg } from './multer.config';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AttachmentStoragePath } from './type';
import { createReadStream } from 'fs';
import { join } from 'path';

@ApiTags('静态文件')
@Controller('file')
export class StaticfileController {
  constructor(private readonly staticfileService: StaticfileService) {}

  //  流文件

  @Get('steamfile')
  //  形式为 直接下载
  getFile2(): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'package.json'));
    // 设置文件名
    return new StreamableFile(file, {
      disposition: 'attachment; filename="package.json"',
      type: 'application/json',
    });
  }

  @Get('steamfile2')
  @Header('Content-Type', 'application/json')
  @Header('Content-Disposition', 'attachment; filename="package.json"')
  getFile3(): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'package.json'));
    // 设置文件名
    return new StreamableFile(file);
  }
}
