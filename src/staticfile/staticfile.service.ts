import { Injectable } from '@nestjs/common';
@Injectable()
export class StaticfileService {
  constructor() {}

  uploadMaterialImg(filename: string) {
    const img_url = `/static/material/img/${filename}`;

    return { code: 200, message: '上传材料图片成功', url: img_url };
  }
}
