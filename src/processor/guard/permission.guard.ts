import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
// import { PrismaService as pgService } from 'src/prisma/prisma.service';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '@/processor/decorator/permission';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

/*

此guard 通过rbac定义 控制了 所有 路由 调用 和 按钮操作 的权限

还需要casl 控制 更 细颗粒度 的 表格 及 字段 操作 的权限

*/
@Injectable()
export class PermissionGuard implements CanActivate {
  private readonly redis: Redis;
  constructor(
    // private readonly pgService: pgService,
    private readonly redisService: RedisService,
    private reflector: Reflector,
  ) {
    this.redis = this.redisService.getOrThrow();
  }

  getPermission(userId: number): string[] {
    if (!userId) {
      return [];
    }
    if (userId == 1) {
      return [];
    }
    // if (userId == 1) {
    //   //  返回所有权限列表
    //   const permissions = await this.pgService.permission.findMany();
    //   return permissions
    //     .map(permission => permission.name)
    //     .filter((permission): permission is string => permission !== null);
    // }
    try {
      //   const userWithPermissions = await this.pgService.user.findUnique({
      //     where: { id: userId },
      //     select: {
      //       roles: {
      //         select: {
      //           permissions: {
      //             select: {
      //               name: true,
      //             },
      //           },
      //         },
      //       },
      //     },
      //   });
      //   return [
      //     ...new Set(
      //       userWithPermissions?.roles
      //         .flatMap(role => role.permissions.map(permission => permission.name))
      //         .filter((permission): permission is string => permission !== null) as string[],
      //     ),
      //   ];
      return ['sss', 'aaa']; // 模拟数据
    } catch (error) {
      console.error('Permission retrieval error:', error);
      return [];
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    // console.log('🚀 ~ PermissionGuard ~ canActivate ~ user:', user);
    // if (!user) {
    //   return false;
    // }
    // if (user?.id == process.env.ROLE_WHITE_LIST_ID) {
    //   return true;
    // }
    // ============== 方法一   获取 当前 class 所有permission装饰器==============
    // 获取类上的权限
    // const classPermission = this.reflector.get<string>(PERMISSION_KEY, context.getClass());
    // 获取方法上的权限
    const requiredPermission = this.reflector.get<string>(PERMISSION_KEY, context.getHandler());
    // ==========================
    // ============== 方法二   获取 当前 路由 路径==============
    /*
    const path = request.path;
    if (!path) {
      throw new Error('路径不存在');
    }
    const hasPermission = permissionList.includes(path.split('/').slice(1).join('_').toUpperCase());*/
    // ==========================
    if (!requiredPermission) {
      // 不需要权限 放行
      return true;
    }
    // 从缓存获取权限 没有则从数据库查询
    let permissionList: string[] = [];
    permissionList = JSON.parse((await this.redis.get(`permission_${user.id}`)) || '[]');

    if (!permissionList.length) {
      console.log('🚀 ~ PermissionGuard ~ canActivate ~ permissionList.length:', permissionList.length);
      permissionList = this.getPermission(user.id as number);
      await this.redis.set(`permission_${user.id}`, JSON.stringify(permissionList), 'EX', 60 * 60 * 24);
    }

    const hasPermission = permissionList.includes(requiredPermission);
    return hasPermission;
  }
}
