/*
种子服务需要  菜单  初始数据

*/

import { PrismaClient } from './client/postgresql';
const prisma = new PrismaClient();
import { menu as _menu } from './menu';
export interface AdminListType {
  path: string;
  component: string;
  redirect?: string;
  name: string;
  meta?: any;
  children?: AdminListType[];
}

async function _createMenu(data: any, parentId: number | null = null, sort = 0) {
  const { children, meta, ...rest } = data;
  const created = await prisma.menu.create({
    data: {
      ...rest,
      meta: {
        create: {
          ...meta,
        },
      },
      parentId,
    },
  });
  // 递归插入 children（如果有）
  if (children && children.length > 0) {
    for (const child of children) {
      await _createMenu(child, created.id);
    }
  }
}

async function createMenuFromData(MenuArray) {
  for (const menu of MenuArray) {
    await _createMenu(menu);
  }
  console.log('菜单导入成功');
}

async function main() {
  console.log('🌱 Seeding menu data...');

  await createMenuFromData(_menu);
  console.log('🌱 Seeding dict data...');
  console.log('✅ Seeding finished.');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
