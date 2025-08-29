import { batchCreatePermissionList } from '@/table/dictionary/utils';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PgService } from '@/prisma/pg.service';
import { CreatePermissionDto, UpdatePermissionDto, BatchPermissionDto } from './dto/permission.dto';

@Injectable()
export class PermissionService {
  constructor(private readonly pgService: PgService) {}

  async create(createPermissionListDto: CreatePermissionDto) {
    const { menuId, ...rest } = createPermissionListDto;
    const createStatement = {
      data: {
        ...rest,
        menu: { connect: { id: menuId } }, // 连接menu表
      },
      select: { id: true },
    };
    const res = await this.pgService.permission.create(createStatement);
    return { id: res.id, message: '创建权限成功' };
  }

  async batchCreate(obj: BatchPermissionDto) {
    const { menuId, path } = obj;
    // 先判断菜单id是否存在
    const menu = await this.pgService.menu.findUnique({
      where: { id: Number(menuId) },
    });
    if (!menu) return { code: 400, error: '创建失败，菜单不存在' };
    const permissionList = batchCreatePermissionList(menuId, path);

    const res = await this.pgService.permission.createMany({
      data: permissionList,
      skipDuplicates: true, // 跳过重复的
    });
    if (res?.count > 0) {
      return { count: res.count, messgae: '快速生成权限模版成功' };
    }
    throw new BadRequestException('模版数据已存在, 无需重复生成');
  }

  async update(updatePermissionListDto: UpdatePermissionDto) {
    const { id, ...rest } = updatePermissionListDto;
    const updateStatement = {
      where: { id },
      data: rest,
      select: { id: true },
    };
    const res = await this.pgService.permission.update(updateStatement);
    return { id: res.id, message: '更新权限成功' };
  }

  async remove(id: number) {
    const res = await this.pgService.permission.delete({
      where: { id },
      select: { id: true },
    });

    return { id: res.id, message: '删除权限成功' };
  }
}
