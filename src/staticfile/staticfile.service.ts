import { PgService } from '@/prisma/pg.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UploadFileDto } from './file.dto';
import * as fs from 'fs';
@Injectable()
export class StaticfileService {
  constructor(private readonly pgService: PgService) {}

  async getFileList() {
    const fileList = await this.pgService.file.findMany();
    const total = await this.pgService.file.count();
    return { message: '文件列表获取成功', list: fileList, total };
  }

  async uploadFile(file: UploadFileDto) {
    const fileData = await this.pgService.file.create({
      data: {
        ...file,
      },
    });
    return { message: '文件上传成功', fileData };
  }

  async deleteFile(ids: number[]) {
    const fileList = await this.pgService.file.findMany({ where: { id: { in: ids } } });
    if (fileList.length !== ids.length) {
      throw new BadRequestException('部分文件不存在');
    }
    // 删除文件
    fileList.forEach(file => {
      fs.unlinkSync(file.path);
    });
    await this.pgService.file.deleteMany({ where: { id: { in: ids } } });
    return { message: '文件删除成功' };
  }

  async updateAvatar(avatarPath: string, userPhone: string) {
    await this.pgService.user.update({ where: { phone: userPhone }, data: { avatar: avatarPath } });
    return { message: '更新头像成功', filePath: avatarPath };
  }
}
