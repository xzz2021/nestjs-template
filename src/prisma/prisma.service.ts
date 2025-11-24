import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PrismaService {
  getSchemaModels(): { tablename: string; fields: string[] }[] {
    const schemaPath = path.resolve(__dirname, './pg.schema.prisma');
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

    const modelRegex = /model\s+(\w+)\s+{([^}]*)}/g;
    const fieldRegex = /^\s*(\w+)\s+[\w[\]]+/gm;

    const result: { tablename: string; fields: string[] }[] = [];

    let modelMatch;
    while ((modelMatch = modelRegex.exec(schemaContent)) !== null) {
      const [, modelName, modelBody] = modelMatch as unknown as [string, string, string];
      const fields: string[] = [];

      let fieldMatch;
      while ((fieldMatch = fieldRegex.exec(modelBody)) !== null) {
        const fieldName = fieldMatch[1];
        fields.push(fieldName);
      }

      result.push({ tablename: modelName, fields });
    }

    return result;
  }
}

/*

JSON动态规则
  0. 调用函数读取schema.prisma文件正则匹配所有表格模型及字段
  1. 前端展示,表单提交生成JSON规则

[
  {
    action: 'read',
    subject: 'Post'
  },
  {
    inverted: true,
    action: 'delete',
    subject: 'Post',
    conditions: { published: true }
  }
]

规则类型定义 简化版
interface RawRule {
  action: string | string[]
  subject?: string | string[]
  fields?: string[]
  conditions?: any
  inverted?: boolean
  reason?: string
}


*/
