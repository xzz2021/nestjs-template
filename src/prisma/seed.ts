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
  const { children, meta, permissionList, ...rest } = data;
  const created = await prisma.menu.create({
    data: {
      ...rest,
      meta: meta ? { create: meta } : undefined,
      parentId: parentId ? undefined : parentId,
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

async function create_menus_batch(menu_data: any[]) {
  return await prisma.$transaction(async tx => {
    const created_menus = [];

    for (const menu_item of menu_data) {
      const { children, meta, ...menu_fields } = menu_item;

      // 创建主菜单
      const created_menu = await tx.menu.create({
        data: {
          ...menu_fields,
          meta: {
            create: meta,
          },
        },
      });

      // 创建子菜单
      if (children && children.length > 0) {
        const child_promises = children.map(async child => {
          const { meta: child_meta, ...child_fields } = child;

          return await tx.menu.create({
            data: {
              ...child_fields,
              parent: {
                // 使用 parent 而不是 parentId
                connect: {
                  id: created_menu.id,
                },
              },
              meta: {
                create: child_meta,
              },
            },
          });
        });

        await Promise.all(child_promises);
      }
    }

    return created_menus;
  });
}

async function main() {
  console.log('🌱 Seeding menu data...');

  await create_menus_batch(_menu);
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
