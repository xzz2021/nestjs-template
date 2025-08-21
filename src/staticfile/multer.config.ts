import { diskStorage } from 'multer';
import path, { join } from 'path';
import * as fs from 'fs';
import { STATIC_FILE_ROOT_PATH } from 'src/core/server.static';

// 修复文件名
function fixFileName(originalname: string): string {
  return Buffer.from(originalname, 'latin1').toString('utf-8');
}

export const multerConfig = {
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      // 如果你不想保存文件，可以提供一个空的目录
      const uploadPath = join(STATIC_FILE_ROOT_PATH, 'file/test');
      // 检查目录是否存在，如果不存在就创建
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
      // 文件名使用时间戳和原始文件扩展名
      const filename = fixFileName(file.originalname);
      if (fs.existsSync(join(STATIC_FILE_ROOT_PATH, 'file/test', filename))) {
        cb(null, Date.now() + '-' + filename);
      } else {
        cb(null, filename);
      }
    },
  }),
};

const img_type = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];

export const generateMulterConfigOfImg = (directory: string, isImg: boolean = true) => {
  return {
    fileFilter: (_req: any, file: any, cb: any) => {
      // { fieldname: 'file', originalname: 'logo.jpg', encoding: '7bit', mimetype: 'image/jpeg'}
      console.log('🚀 ~ file:', file);
      if (!img_type.includes(file?.mimetype as string) && isImg) {
        cb(new Error('只允许上传图片文件'));
      }
      cb(null, true);
    },
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        // 如果你不想保存文件，可以提供一个空的目录
        const uploadPath = path.resolve(directory);
        // 检查目录是否存在，如果不存在就创建
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (_req, file, cb) => {
        // 文件名使用时间戳和原始文件扩展名
        const filename = fixFileName(file.originalname);
        cb(null, filename);
      },
    }),
  };
};

export const multerConfigForAvatar = {
  storage: diskStorage({
    destination: (req: any, file, cb) => {
      // console.log('✨ 🍰 ✨ xzz2021: file', file);
      // 获取前端传的完整 filename，例如：'avatar/2025/03/user123.jpg'

      // 根目录（打包后的 static 目录）
      const staticRoot = join(__dirname, '..', 'static/avatar');
      // 拼接完整目录路径
      if (req?.user && 'phone' in req.user) {
        const targetDir = join(staticRoot, req.user.phone as string);

        // 确保目录存在
        fs.mkdirSync(targetDir, { recursive: true });

        cb(null, targetDir);
      } else {
        cb(null, staticRoot);
      }
    },

    filename: (req, file, cb) => {
      const originalName = fixFileName(file.originalname);

      cb(null, originalName);
    },
  }),

  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
};
