import { Injectable } from '@nestjs/common';
import { PgService } from '@/prisma/pg.service';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';
// import { Prisma } from '@/prisma/client/postgresql';

@Injectable()
export class MenuService {
  constructor(private readonly pgService: PgService) {}

  async create(createMenuDto: CreateMenuDto) {
    const { parentId, meta, ...rest } = createMenuDto;
    const createStatement = {
      data: {
        ...rest,
        parent: {
          connect: parentId ? { id: parentId } : undefined,
        },
        meta: {
          create: {
            ...meta,
          },
        },
      },
      select: { id: true },
    };

    const res = await this.pgService.menu.create(createStatement);

    return { id: res.id, message: '创建菜单成功' };
  }

  async update(updateMenuDto: UpdateMenuDto) {
    // 相当于合并新增与更新
    const { id, parentId = null, meta, ...rest } = updateMenuDto;

    const updateStatement = {
      where: { id },
      data: {
        ...(parentId === null
          ? {
              parent: {
                disconnect: true,
              },
            }
          : {
              parent: {
                // 使用 parent 而不是 parentId
                connect: {
                  id: parentId,
                },
              },
            }),
        meta: {
          update: {
            ...meta,
          },
        },
        ...rest,
      },
      select: { id: true },
    };
    const res = await this.pgService.menu.update(updateStatement);

    return { id: res?.id, message: '更新菜单成功' };
  }

  async remove(id: number) {
    try {
      const res = await this.pgService.menu.delete({
        where: { id },
        select: { id: true },
      });
      if (res?.id) {
        return { code: 200, id: res.id, message: '删除菜单成功' };
      }
    } catch (error) {
      // console.log('🚀 ~ xzz: MenuService -> create -> error', error);
      return { code: 400, message: error.message };
    }
  }

  async findMenuList() {
    const findModule = {
      where: {
        parentId: null,
      },
      orderBy: { sort: 'asc' },
      include: {
        children: {
          orderBy: { sort: 'asc' },
          include: {
            children: {
              orderBy: { sort: 'asc' },
              include: {
                children: {
                  orderBy: { sort: 'asc' },
                  include: {
                    children: {
                      orderBy: { sort: 'asc' },
                      include: {
                        permissionList: true,
                        meta: true,
                      },
                    },
                    permissionList: true,
                    meta: true,
                  },
                },
                meta: true,
                permissionList: true,
              },
            },
            meta: true,
            permissionList: true,
          },
          meta: true,
          permissionList: true,
        },
        meta: true,
        permissionList: true,
      },
    };
    try {
      const res = await this.pgService.menu.findMany({
        where: {
          parentId: null,
        },
        orderBy: [{ sort: 'asc' }],
        include: {
          children: {
            orderBy: [{ sort: 'asc' }],
            include: {
              children: {
                orderBy: [{ sort: 'asc' }],
                include: {
                  children: {
                    orderBy: [{ sort: 'asc' }],
                    include: {
                      children: {
                        orderBy: [{ sort: 'asc' }],
                        include: {
                          permissionList: true,
                          meta: true,
                        },
                      },
                      permissionList: true,
                      meta: true,
                    },
                  },
                  meta: true,
                  permissionList: true,
                },
              },
              meta: true,
              permissionList: true,
            },
          },
          meta: true,
          permissionList: true,
        },
      });
      return { code: 200, list: res, message: '获取菜单成功' };
    } catch (error) {
      return { code: 500, message: '获取菜单失败' + error };
    }
  }

  async sortMenu(sortMenu: { id: number; sort: number }[]) {
    try {
      const res = await this.pgService.$transaction(async tx => {
        for (const item of sortMenu) {
          await tx.menu.update({
            where: { id: item.id },
            data: { sort: item.sort },
          });
        }
        return { code: 200, message: '排序成功' };
      });
      return res;
    } catch (error) {
      return { code: 500, message: '排序失败' + error };
    }
  }
}
