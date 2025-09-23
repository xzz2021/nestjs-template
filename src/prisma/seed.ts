/*
种子服务需要  菜单  初始数据

*/

import { PrismaClient } from '../../prisma/client/postgresql';
const prisma = new PrismaClient();
import { menu as _menu } from './menu';

async function create_menus_batch(menu_data: any[], tx: any, parentId?: number) {
  for (const menu_item of menu_data) {
    const { children, meta, permissionList, ...menu_fields } = menu_item;

    // 创建主菜单
    const created_menu = await tx.menu.create({
      data: {
        ...menu_fields,
        parent: parentId ? { connect: { id: parentId } } : undefined,
        meta: {
          create: meta,
        },
        permissionList: {
          create: permissionList,
        },
      },
    });

    // 创建子菜单
    if (children && children.length > 0) {
      const child_promises = children.map(async child => {
        const { meta: child_meta, permissionList, children, ...child_fields } = child;

        const created_child_menu = await tx.menu.create({
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
            permissionList: {
              create: permissionList,
            },
          },
        });

        if (children && children.length > 0) {
          await create_menus_batch(children as any[], tx, created_child_menu.id as number);
        }
      });

      await Promise.all(child_promises);
    }
  }
}

async function main() {
  console.log('🌱 Seeding menu data...');

  await prisma.$transaction(async tx => {
    await create_menus_batch(_menu, tx);
  });

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
