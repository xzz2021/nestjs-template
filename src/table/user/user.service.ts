import { BadRequestException, Injectable } from '@nestjs/common';
import { PgService } from '@/prisma/pg.service';
import { QueryUserParams, UpdateUserDto, UpdatePersonalInfo, UpdatePwdDto, AdminUpdatePwdDto, CreateUserDto } from './dto/user.dto';
import { buildPrismaWhere, BuildPrismaWhereParams, hashPayPassword, verifyPayPassword } from '@/processor/utils';
import { ONLINE_USER_PREFIX } from '@/utils/sse/sse.service';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { MinioClientService } from '@/utils/minio/minio.service';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

@Injectable()
export class UserService {
  private readonly redis: Redis;
  constructor(
    private readonly pgService: PgService,
    private readonly redisService: RedisService,
    private readonly minioClientService: MinioClientService,
    private readonly configService: ConfigService,
  ) {
    this.redis = this.redisService.getOrThrow();
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

  async findByDepartmentId(searchParam: QueryUserParams) {
    // 此处查询 只批量返回一般数据   查询效率会更好    详细数据应当通过单个ip去查询处理

    const { id, pageIndex, pageSize, status, ...rest } = searchParam;
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
    if (id && id > 0) {
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
        createdAt: true,
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

    const rawlist = await this.pgService.user.findMany({
      ...newQueryParams,
      distinct: ['id'],
    });

    const list = rawlist.map(u => ({
      ...u,
      createdAt: u.createdAt.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }).split('T').join(' ').replaceAll('/', '-'),
      departments: u.departments.map(d => d.department.id),
      roles: u.roles.map(r => r.role.id), // 把 { role: {...} } 提取成 {...}
    }));

    const total = await this.pgService.user.count({ where });

    return { list, total, message: '部门用户列表查询成功' };
  }

  async addUser(addUserinfoDto: CreateUserDto) {
    const { departments, roles, phone, username } = addUserinfoDto;
    // 1. 查询手机号 是否存在,  存在抛出异常提示
    const isExit = await this.pgService.user.findFirst({ where: { phone } });
    if (isExit?.id && phone) {
      // return { code: 400, message: '手机号已存在,无法添加!' };
      throw new BadRequestException('手机号已存在,无法添加!');
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
            create: departments?.map(id => ({ department: { connect: { id } } })),
          },
          roles: {
            create: roles?.map(id => ({ role: { connect: { id } } })),
          },
        },
      });

      return { code: 200, message: '新增用户成功', id: userSave.id };
    });
  }

  async update(updateUserinfoDto: UpdateUserDto) {
    const { id, departments, roles, ...rest } = updateUserinfoDto;
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

  async batchDeleteUser(ids: number[]) {
    //  使用事务 删除用户 同时删除用户角色及部门关联数据
    const res = await this.pgService.$transaction(tx => {
      return Promise.all([
        ...ids.map(id => tx.userRole.deleteMany({ where: { userId: id } })),
        ...ids.map(id => tx.user.delete({ where: { id } })),
        ...ids.map(id => tx.userDepartment.deleteMany({ where: { userId: id } })),
      ]);
    });
    return { message: '删除用户成功', count: res.length };
  }

  async getUserInfo(userId: number) {
    const userInfo = await this.pgService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        avatar: true,
        username: true,
        phone: true,
        email: true,
        createdAt: true,
        departments: { select: { id: true, department: { select: { id: true, name: true } } } },
        roles: { select: { id: true, role: { select: { id: true, name: true } } } },
      },
    });
    const shaped = {
      ...userInfo,
      roles: userInfo?.roles.map(r => r.role),
      departments: userInfo?.departments.map(d => d.department),
      createdAt: userInfo?.createdAt.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }).split('T').join(' ').replaceAll('/', '-'),
    };
    return { userinfo: shaped, message: '获取个人信息成功' };
  }
  async updateInfo(updateUserinfoDto: UpdatePersonalInfo) {
    // 用户更新自己的 一般信息
    const { id, ...updateData } = updateUserinfoDto;
    const res = await this.pgService.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
      },
    });
    return { message: '更新个人信息成功', id: res.id };
  }

  async updatePassword(updatePasswordDto: UpdatePwdDto) {
    // 用户更新自己的密码
    try {
      const { id, password, newPassword } = updatePasswordDto;
      //  校验旧密码是否正确
      const user = await this.pgService.user.findUnique({ where: { id } });
      const isMatch = await verifyPayPassword(user?.password || '', password);
      if (!isMatch) {
        throw new BadRequestException('修改失败, 旧密码不正确');
      }
      const hashPassword = await hashPayPassword(newPassword);
      const res = await this.pgService.user.update({ where: { id }, data: { password: hashPassword } });
      return { code: 200, message: '更新个人密码成功', id: res.id };
    } catch (error) {
      // console.log(' ~ xzz: UserinfoService -> updatePassword -> error', error.message);
      return { code: 400, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async resetPassword({ id, password, operateId }: AdminUpdatePwdDto & { operateId: number }) {
    // console.log('xzz2021: UserService -> resetPassword -> operateId', operateId);
    // 此处需要自定义 校验操作人是否 有执行权限
    // const isAdmin = await this.pgService.user.findUnique({ where: { id: operateId } });
    // if (!isAdmin) return { code: 400, message: '没有权限' };

    const hashPassword = await hashPayPassword(password);
    const res = await this.pgService.user.update({ where: { id }, data: { password: hashPassword } });
    return { message: '重置用户密码成功', id: res.id };
  }

  //  校验短信 或邮箱 验证码
  async checkSmsCode(smskey: string, code: string, type: 'sms' | 'email' = 'sms') {
    try {
      const cacheCode = await this.redis.get(type + '_' + smskey);
      if (!cacheCode) {
        return { status: false, code: 400, message: '验证码已过期, 请重新获取!' };
      }
      if (cacheCode != code) {
        return { status: false, code: 400, message: '验证码错误, 请重新输入!' };
      }
      await this.redis.del(type + '_' + smskey);
      return { status: true, code: 200, message: '验证码正确' };
    } catch (error) {
      console.log('🚀 ~ AuthService ~ checkSmsCode ~ error:', error);
      return { status: false, code: 400, message: '验证码校验错误, 请稍候重试!' };
    }
  }

  async findAll(searchParam: QueryUserParams) {
    // 此处查询 只批量返回一般数据   查询效率会更好    详细数据应当通过单个ip去查询处理
    const { where, skip, take } = buildPrismaWhere(searchParam as BuildPrismaWhereParams);
    // console.log('xzz2021: LogService -> getUserOperationLogList -> where:', where);
    const newSearchParam = {
      where,
      skip,
      take,
      orderBy: { id: 'desc' as const },
    };
    const list = await this.pgService.user.findMany({
      ...newSearchParam,
    });
    const total = await this.pgService.user.count({
      where,
    });
    return { list, total, message: '获取日志列表成功' };
  }

  async listOnlineUser() {
    const keys = await this.redis.keys(ONLINE_USER_PREFIX + '*');
    // console.log('xzz2021: UserService -> listOnlineUser -> keys:', keys);
    const list = await Promise.all(keys.map(async key => JSON.parse((await this.redis.get(key)) ?? '{}')));
    // console.log('xzz2021: UserService -> listOnlineUser -> list:', list);
    return { list, total: list.length, message: '获取在线用户列表成功' };
  }

  async kickUser(userId: number) {}

  async uploadAvatar(file: Express.Multer.File, userId: number) {
    const { objectName } = await this.minioClientService.uploadFile(file, 'user/avatar/' + userId + '/' + randomUUID() + '/');
    const url = this.configService.get('minio.url') + '/' + 'public' + '/' + objectName;
    await this.pgService.user.update({ where: { id: userId }, data: { avatar: url } });
    return { url, message: '上传头像成功' };
  }
}
