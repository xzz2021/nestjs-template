import { batchCreatePermissionList } from '@/table/dictionary/utils';
import { Injectable } from '@nestjs/common';
import { PgService } from '@/prisma/pg.service';

@Injectable()
export class PermissionService {
  constructor(private readonly pgService: PgService) {}

  async create(createPermissionListDto: any) {
    const { menuId, permissionName, ...rest } = createPermissionListDto;
    const createStatement = {
      data: {
        ...rest,
        name: permissionName,
        menu: { connect: { id: menuId } }, // 连接menu表
      },
      select: { id: true },
    };
    const res = await this.pgService.permission.create(createStatement);
    if (res?.id) return { code: 200, id: res.id };
  }

  async batchCreate(menuId: number, path: string) {
    // 先判断菜单id是否存在
    const menu = await this.pgService.menu.findUnique({
      where: { id: Number(menuId) },
    });
    if (!menu) return { code: 400, error: '创建失败，菜单不存在' };
    const permissionList = batchCreatePermissionList(menuId, path);
    const createStatement = {
      data: permissionList.map(item => ({
        ...item,
        code: item.code.toUpperCase(),
      })),
      skipDuplicates: true, // 跳过重复的
    };
    try {
      const res = await this.pgService.permission.createMany(createStatement);
      console.log('✨ 🍰 ✨ xzz2021: PermissionService -> batchCreate -> res', res);
      if (res?.count > 0) {
        return { code: 200, count: res.count, messgae: '快速生成权限模版成功' };
      } else {
        return { code: 400, message: '模版数据已存在, 无需重复生成' };
      }
    } catch (error) {
      console.log('🚀 ~ xzz: MenuService -> create -> error', error);
      return { code: 400, message: '生成权限模版失败', error: error.message };
    }
  }

  async update(updatePermissionListDto: any) {
    const { id, ...rest } = updatePermissionListDto;
    const updateStatement = {
      where: { id },
      data: rest,
      select: { id: true },
    };
    try {
      const res = await this.pgService.permission.update(updateStatement);
      if (res?.id) return { code: 200, id: res.id };
    } catch (error) {
      if (error.message.includes('Unique constraint failed')) {
        return { code: 400, message: '权限值已存在', error: error.message };
      }
      return { code: 400, message: error.message };
    }
  }

  async remove(id: number) {
    try {
      const res = await this.pgService.permission.delete({
        where: { id },
        select: { id: true },
      });
      if (res?.id) {
        return { code: 200, id: res.id };
      }
    } catch (error) {
      console.log('🚀 ~ xzz: MenuService -> create -> error', error);
      return { code: 400, error: error.message };
    }
  }
}
