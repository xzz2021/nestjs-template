import { Inject, Injectable } from '@nestjs/common';
import { PgService } from '@/prisma/pg.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UpdatePwdType, UpdateUserPwdType } from './types';
import { hashPayPassword, verifyPayPassword } from '@/processor/utils/encryption';
import { IQueryParams, UpdateUserDto } from './dto/user.dto';
@Injectable()
export class UserService {
  constructor(
    private readonly pgService: PgService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  findAll() {
    return this.pgService.user.findMany();
  }

  findOne(phone: string) {
    return this.pgService.user.findUnique({
      where: {
        phone,
      },
    });
  }

  async getUsersOfDeptAndChildren(deptId: number) {
    const depts = await this.pgService.department.findMany({ select: { id: true, parentId: true } });
    const children = new Set<number>([deptId]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const d of depts) {
        if (d.parentId && children.has(d.parentId) && !children.has(d.id)) {
          children.add(d.id);
          grew = true;
        }
      }
    }
    const deptIds = Array.from(children);
    return deptIds;

    // return this.pgService.user.findMany({
    //   where: { departments: { some: { departmentId: { in: deptIds } } }, isDeleted: false, status: true },
    //   distinct: ['id'],
    // });
  }

  async findByDepartmentId(searchParam: IQueryParams) {
    // 此处查询 只批量返回一般数据   查询效率会更好    详细数据应当通过单个ip去查询处理

    const { id, pageIndex, pageSize, status, ...rest } = searchParam;
    console.log('xzz2021: UserService -> findByDepartmentId -> searchParam', status);
    const skip = (pageIndex - 1) * pageSize;
    const take = pageSize;
    // const newParams =
    // 遍历rest 构造 contains 对象
    const where = Object.entries(rest).reduce(
      (acc, [key, value]) => {
        if (value) {
          acc[key] = { contains: value };
        }
        return acc;
      },
      {} as Record<string, any>,
    );
    where.status = status;
    let ids: number[] = [];
    if (id > 0) {
      ids = await this.getUsersOfDeptAndChildren(+id);
      where.departments = { some: { departmentId: { in: ids } } };
    }
    //  同时查询 部门 角色 数据
    const newQueryParams = {
      where,
      select: {
        id: true,
        username: true,
        phone: true,
        avatar: true,
        status: true,
        departments: {
          select: {
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        roles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      // orderBy: { createdAt: 'asc' },
      skip: Number(skip),
      take: Number(take),
    };
    console.log('xzz2021: UserService -> findByDepartmentId -> newQueryParams', newQueryParams);

    const rawlist = await this.pgService.user.findMany({
      ...newQueryParams,
      distinct: ['id'],
    });

    const list = rawlist.map(u => ({
      ...u,
      departments: u.departments.map(d => d.department.id),
      roles: u.roles.map(r => r.role.id), // 把 { role: {...} } 提取成 {...}
    }));

    return { list, total: 0, message: '部门用户列表查询成功' };
  }

  async addUser(addUserinfoDto: any) {
    const { departmentId, phone, username } = addUserinfoDto;
    try {
      // 1. 查询手机号 是否存在,  存在抛出异常提示
      const isExit = await this.pgService.user.findFirst({ where: { phone } });
      if (isExit?.id && phone) {
        // return { code: 400, message: '手机号已存在,无法添加!' };
        throw new Error('手机号已存在,无法添加!');
      }
      //  2.新增用户  默认密码123456
      const password = await hashPayPassword('123456');
      return await this.pgService.$transaction(async tx => {
        const userSave = await tx.user.create({
          data: {
            username,
            password,
            phone,
            departments: {
              connect: {
                id: departmentId,
              },
            },
          },
          include: {
            roles: true,
          },
        });

        return { code: 200, message: '新增用户成功', id: userSave.id };
      });
    } catch (error) {
      console.log(' ~ xzz: UserinfoService -> addUser -> error', error);
      return { code: 400, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async update(updateUserinfoDto: UpdateUserDto) {
    const { id, departments, roles, ...rest } = updateUserinfoDto;
    // 需要先检查 roles 里的所有 id 项  是否存在 于role表 不存在的剔除  ??????????
    // const roleList = await this.pgService.role.findMany({ where: { id: { in: roles } } });
    // const validRoles = roles.filter((id: number) => roleList.some(role => role.id === id));

    const res = await this.pgService.user.update({
      where: { id },
      data: {
        ...rest,
        departments: {
          deleteMany: {}, // 清空所有旧关联
          //  如此操作 必须确保id数组是去重的  已在dto里进行处理
          // 当更新用户信息时部门或角色id数组不变时 依然会删除表数据后新建  后期优化方案 是 做差异对比
          create: departments?.map(id => ({ department: { connect: { id } } })),
        },
        roles: {
          deleteMany: {}, // 清空所有旧关联
          create: roles?.map(id => ({ role: { connect: { id } } })),
        },
      },
    });
    return { message: '更新用户信息成功', id: res.id };
  }

  async delete(ids: number[]) {
    try {
      //  使用事务 删除用户 同时删除用户角色
      const res = await this.pgService.$transaction([
        ...ids.map(id => this.pgService.user.update({ where: { id }, data: { roles: { set: [] } } })),
        ...ids.map(id => this.pgService.user.delete({ where: { id } })),
      ]);
      return { code: 200, message: '删除用户成功', count: res.length };
    } catch (error) {
      console.log(' ~ xzz: UserinfoService -> delete -> error', error);
      return { code: 400, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  async getUserInfo(queryParams: any) {
    try {
      const userInfo = await this.pgService.user.findUnique({
        where: { id: +queryParams?.id },
        select: {
          id: true,
          avatar: true,
          username: true,
          phone: true,
          status: true,
          departments: { select: { id: true, department: { select: { id: true, name: true } } } },
          roles: true,
          createdAt: true,
        },
      });
      const result = {
        ...userInfo,
        roleList: userInfo?.roles,
      };
      delete result.roles;
      // await this.cacheManager.set(cacheKey, result);
      return { code: 200, userInfo: result, message: '获取个人信息成功' };
    } catch (error) {
      console.log(' ~ xzz: UserinfoService -> getUserInfo -> error', error);
      return {
        code: 400,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: '获取个人信息失败',
      };
    }
  }
  async updateInfo(updateUserinfoDto: any) {
    // 用户更新自己的 一般信息
    try {
      const { id, ...updateData } = updateUserinfoDto;
      const res = await this.pgService.user.update({
        where: { id },
        data: updateData,
        select: {
          birthday: true,
          gender: true,
          email: true,
          id: true,
          username: true,
        },
      });
      return { message: '更新个人信息成功', data: res };
    } catch (error) {
      console.log(' ~ xzz: UserinfoService -> updateInfo -> error', error);
      return { code: 400, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updatePassword(updatePasswordDto: UpdatePwdType) {
    // 用户更新自己的密码
    try {
      const { id, password, newPassword } = updatePasswordDto;
      //  校验旧密码是否正确
      const user = await this.pgService.user.findUnique({ where: { id } });
      const isMatch = await verifyPayPassword(user?.password || '', password);
      if (!isMatch) {
        throw new Error('修改失败, 旧密码不正确');
      }
      const hashPassword = await hashPayPassword(newPassword);
      const res = await this.pgService.user.update({ where: { id }, data: { password: hashPassword } });
      return { code: 200, message: '更新个人密码成功', id: res.id };
    } catch (error) {
      // console.log(' ~ xzz: UserinfoService -> updatePassword -> error', error.message);
      return { code: 400, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getAll() {
    const list = await this.pgService.user.findMany({
      select: {
        id: true,
        username: true,
        phone: true,
      },
    });
    return { code: 200, list, message: '获取所有用户成功' };
  }

  async resetPassword({ id, password, operateId }: { id: number; password: string; operateId: number }) {
    console.log('xzz2021: UserService -> resetPassword -> operateId', operateId);
    // 此处需要自定义 校验操作人是否 有执行权限
    // const isAdmin = await this.pgService.user.findUnique({ where: { id: operateId } });
    // if (!isAdmin) return { code: 400, message: '没有权限' };
    try {
      const hashPassword = await hashPayPassword(password);
      const res = await this.pgService.user.update({ where: { id }, data: { password: hashPassword } });
      return { code: 200, message: '重置用户密码成功', id: res.id };
    } catch (error: any) {
      console.log(' ~ xzz: UserinfoService -> resetPassword -> error', error);
      return { code: 400, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  //  校验短信 或邮箱 验证码
  async checkSmsCode(smskey: string, code: string, type: 'sms' | 'email' = 'sms') {
    try {
      const cacheCode = await this.cacheManager.get(type + '_' + smskey);
      if (!cacheCode) {
        return { status: false, code: 400, message: '验证码已过期, 请重新获取!' };
      }
      if (cacheCode != code) {
        return { status: false, code: 400, message: '验证码错误, 请重新输入!' };
      }
      await this.cacheManager.del(type + '_' + smskey);
      return { status: true, code: 200, message: '验证码正确' };
    } catch (error) {
      console.log('🚀 ~ AuthService ~ checkSmsCode ~ error:', error);
      return { status: false, code: 400, message: '验证码校验错误, 请稍候重试!' };
    }
  }

  async updateUserPassword(updatePasswordDto: UpdateUserPwdType, phone: string) {
    // 用户更新自己的密码
    const { password, code } = updatePasswordDto;
    const smskey = 'loginPassword_' + phone;
    const isValidate = await this.checkSmsCode(smskey, code);
    if (!isValidate.status) {
      return isValidate;
    }
    const hashPassword = await hashPayPassword(password);
    const res = await this.pgService.user.update({ where: { phone }, data: { password: hashPassword } });
    return { code: 200, message: '更新密码成功', id: res.id };
  }
}
