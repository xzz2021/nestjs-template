import { Injectable } from '@nestjs/common';
import { CreateDepartmentDto, UpdateDepartmentDto, UpsertDepartmentDto } from './dto/department.dto';
import { PgService } from '@/prisma/pg.service';
import { Prisma } from '@/prisma/client/postgresql';

@Injectable()
export class DepartmentService {
  constructor(private pgService: PgService) {}
  async add(createDepartmentDto: CreateDepartmentDto) {
    /*
    const res = await this.pgService.department.create({ data: createDepartmentDto as any });
    return { data: { id: res.id }, message: '添加部门成功' };
    */
    //  'name', 'status', 'remark', 'parentId
    const res = await this.pgService.$transaction(async tx => {
      // 1) 先建记录拿自增 id（暂存 path）
      const tag = await tx.department.create({
        data: { ...createDepartmentDto, path: '' },
      });

      // 2) 生成 path
      let path = `/${tag.id}`;
      if (createDepartmentDto.parentId) {
        const parent = await tx.department.findUnique({
          where: { id: createDepartmentDto.parentId },
          select: { path: true },
        });
        if (!parent) throw new Error('Parent not found');
        path = `${parent.path}/${tag.id}`;
      }

      // 3) 回填 path
      return tx.department.update({ where: { id: tag.id }, data: { path }, select: { id: true } });
    });
    return { data: { id: res.id }, message: '添加部门成功' };
  }

  async findAll() {
    const list = await this.pgService.department.findMany({
      where: {
        parentId: null,
      },
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true,
              },
            },
          },
        },
      },
    });
    const total = await this.pgService.department.count();
    return { list, total, message: '获取部门列表成功' };
  }

  async update(updateDepartmentDto: UpdateDepartmentDto) {
    /*
    const { id, ...rest } = updateDepartmentDto;
    const updateStatement = {
      where: { id },
      data: rest,
    };
    const res = await this.pgService.department.update(updateStatement);
    return { data: { id: res.id }, message: '更新部门成功' };

    */

    const { id, parentId, ...rest } = updateDepartmentDto;
    let path = `/${id}`;
    if (parentId) {
      const parent = await this.pgService.department.findUnique({
        where: { id: parentId },
        select: { path: true },
      });
      if (!parent) throw new Error('Parent not found');
      path = `${parent.path}/${id}`;
    }
    const res = await this.pgService.department.update({ where: { id }, data: { ...rest, parentId, path }, select: { id: true } });
    return { data: { id: res.id }, message: '更新部门成功' };
  }

  async delete(id: number) {
    /*
    // 捕获id为{}的错误
    const res = await this.pgService.department.delete({ where: { id } });
    return { data: { id: res.id }, message: '删除部门成功' };
    */
    const me = await this.pgService.department.findUnique({ where: { id }, select: { path: true } });
    if (!me) return;
    const child = await this.pgService.department.findFirst({
      where: { parentId: id },
      select: { id: true },
    });
    if (child) throw new Error('当前项有子部门无法删除');
    await this.pgService.userDepartment.deleteMany({ where: { departmentId: id } });
    await this.pgService.department.delete({ where: { id } });
    return { message: '删除部门成功' };
  }

  // async batchUpsert(data: UpsertDepartmentDto[]) {
  //   console.log('🚀 ~ xzz: DepartmentService -> batchUpsert ~ data:', data);

  //   await this.pgService.$transaction(async (tx: Prisma.TransactionClient) => {
  //     for (const dept of data) {
  //       await this.upsertNode(tx, dept, null);
  //     }
  //   });
  //   return { message: '批量插入/更新部门成功' };
  // }
  /**
   * 递归插入/更新单个节点
   */
  // async upsertNode(tx: Prisma.TransactionClient, node: UpsertDepartmentDto, parentId: number | null) {
  //   let path = `/${node.id}`;
  //   if (parentId) {
  //     const parent = await tx.department.findUnique({
  //       where: { id: parentId },
  //       select: { path: true },
  //     });
  //     if (!parent) throw new Error('Parent not found');
  //     path = `${parent.path}/${node.id}`;
  //   }
  //   const baseData = {
  //     name: node.name,
  //     status: node.status ?? true,
  //     remark: node.remark ?? null,
  //     path,
  //     parentId,
  //   };

  //   const where: any = !parentId ? { name: node.name } : { parentId_name: { parentId, name: node.name } };

  //   const department = await tx.department.upsert({
  //     where,
  //     create: baseData,
  //     update: {
  //       status: baseData.status,
  //       remark: baseData.remark,
  //     },
  //   });

  //   // 递归处理子节点
  //   for (const child of node.children ?? []) {
  //     await this.upsertNode(tx, child, department.id);
  //   }
  // }
}
