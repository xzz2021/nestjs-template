import { ConflictException, Injectable } from '@nestjs/common';
import { PgService } from '@/prisma/pg.service';
import { CreateRoleDto, QueryRoleParams, RoleSeedDto, UpdateRoleDto } from './dto/role.dto';

@Injectable()
export class RoleService {
  constructor(private readonly pgService: PgService) {}

  async createRoleWithMenusAndPermissions(data: CreateRoleDto) {
    const { menuIds, permissionIds, code, ...rest } = data;

    // 幂等/查重
    const exists = await this.pgService.role.findUnique({ where: { code } });
    if (exists) throw new ConflictException(`角色编码已存在：${code}`);

    // 去重，避免 @@unique 冲突 + 降低 createMany 的冲突可能
    // const menuIds2 = Array.from(new Set(menuIds));
    // const permissionIds2 = Array.from(new Set(permissionIds ?? []));

    let validMenuIds: number[] = [];
    const menus = await this.pgService.menu.findMany({
      where: { id: { in: menuIds } },
      select: { id: true },
    });
    validMenuIds = Array.from(new Set(menus.map(m => m.id)));
    // 2) 如果有 permissionIds，则校验它们都属于这些菜单
    let validPermIds: number[] = [];
    if (permissionIds?.length) {
      const perms = await this.pgService.permission.findMany({
        where: {
          id: { in: permissionIds },
          menuId: { in: menuIds }, // 关键校验：权限必须挂在已选菜单下
        },
        select: { id: true },
      });
      validPermIds = Array.from(new Set(perms.map(p => p.id)));
    }

    const res = await this.pgService.$transaction(async tx => {
      // 3) 创建角色
      const role = await tx.role.create({
        data: { code, ...rest },
        select: { id: true },
      });

      // 4) 角色-菜单 关联
      await tx.roleMenu.createMany({
        data: validMenuIds.map(menuId => ({ roleId: role.id, menuId })),
        skipDuplicates: true, // 防止重复
      });

      // 5) 角色-权限 关联（只插入勾选的“部分权限”）
      if (validPermIds.length) {
        await tx.rolePermission.createMany({
          data: validPermIds.map(permissionId => ({ roleId: role.id, permissionId })),
          skipDuplicates: true,
        });
      }
      return role;
    });
    /* 
    上面transaction可以替换为 一次写入操作
    const role = await tx.role.create({
  data: {
    name,
    code,
    status,
    remark,

    // 4) 角色-菜单：嵌套写入到显式多对多中间表 RoleMenu
    menus: {
      create: menuIds.map((menuId) => ({
        menu: { connect: { id: menuId } }, // 连接到菜单
      })),
    },

    // 5) 角色-权限：嵌套写入到显式多对多中间表 RolePermission
    permissions: validPermIds.length
      ? {
          create: validPermIds.map((permissionId) => ({
            permission: { connect: { id: permissionId } }, // 连接到权限
          })),
        }
      : undefined,
  },
  select: { id: true, name: true, code: true, status: true, remark: true },
});

*/
    return { message: '创建角色成功', id: res.id };
  }

  async getRoleList(searchParam: QueryRoleParams) {
    const { pageIndex, pageSize, status, ...rest } = searchParam;
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

    const roles = await this.pgService.role.findMany({
      // where,
      // skip,
      // take,
      select: {
        id: true,
        name: true,
        code: true,
        status: true,
        remark: true,
        // 角色 -> 菜单（显式多对多：RoleMenu）
        menus: {
          select: {
            menu: {
              select: {
                id: true,
                name: true,
                path: true,
                sort: true,
                parentId: true,
              },
            },
          },
          orderBy: { menuId: 'asc' },
        },
        // 角色 -> 权限（显式多对多：RolePermission），把权限带出 menuId
        permissions: {
          select: {
            permission: {
              select: {
                id: true,
                name: true,
                code: true,
                value: true,
                menuId: true, // 关键：用于归并到对应菜单
              },
            },
          },
        },
      },
    });
    const list = roles.map(role => {
      // 建一个 Map<menuId, Permission[]>
      const permsByMenu = new Map<number, any[]>();
      for (const rp of role.permissions) {
        const p = rp.permission;
        if (!permsByMenu.has(p.menuId)) permsByMenu.set(p.menuId, []);
        permsByMenu.get(p.menuId)!.push({
          id: p.id,
          name: p.name,
          code: p.code,
          value: p.value,
        });
      }

      const menus = role.menus.map(rm => {
        const m = rm.menu;
        return {
          ...m,
          // 只挂该角色在该菜单下的权限
          permissions: permsByMenu.get(m.id) ?? [],
        };
      });

      return {
        id: role.id,
        name: role.name,
        code: role.code,
        status: role.status,
        menus,
      };
    });
    const total = await this.pgService.role.count();
    return { list, total, message: '获取角色列表成功' };
  }

  getMenuByRoleId(roleId: number) {
    // 既包含包含菜单也包含权限列表和meta内真实权限
    // const res = await this.getRoleMenuWithPermission(roleId);
    return { code: 200, list: [], message: '获取菜单及对应权限成功' };
  }

  //  登录瞬间获取菜单表和对应的权限值字符串数组
  async findRoleMenu(userid: number) {
    // 1. 获取角色菜单 首先判断用户id, 管理员返回所有菜单
    // 2. 其他用户 获取用户角色id数组

    if (userid === 1) {
      const list = await this.getRoleMenuWithPermissionOfAdmin();
      return { list, message: '获取管理员菜单成功' };
    }
    //  其他用户 先查询角色信息
    const user = await this.pgService.user.findUnique({
      where: { id: userid },
      select: {
        roles: { select: { id: true } },
      },
    });

    const list = await this.getUserMenusWithMetaAndPermCodes(userid);
    if (list.length === 0) {
      return { list, message: '请联系管理员分配角色菜单' };
    }

    return { list, message: '获取用户菜单成功' };
  }

  async getRoleMenuWithPermissionOfAdmin() {
    const roleWithMenusAndPermissions = await this.pgService.menu.findMany({
      where: { status: true },
      select: {
        id: true,
        name: true,
        meta: true,
        path: true,
        component: true,
        redirect: true,
        type: true,
        status: true,
        sort: true,
        parentId: true,
        permissionList: {
          select: {
            code: true,
          },
        },
      },
    });
    if (!roleWithMenusAndPermissions || roleWithMenusAndPermissions.length === 0) {
      return [];
    }
    // 整理权限名数组到每个菜单的 meta.permission 中
    const result = roleWithMenusAndPermissions.map(menu => {
      const { meta, permissionList, ...rest } = menu;
      const permissionNames = permissionList.map(p => p.code);

      return {
        ...rest,
        meta: {
          ...((meta as object) || {}),
          permissions: permissionNames,
        },
      };
    });
    return result;
  }

  async getUserMenusWithMetaAndPermCodes(userId: number) {
    // 1) 用户所属角色
    const userRoles = await this.pgService.userRole.findMany({
      where: { userId },
      select: { roleId: true },
    });
    const roleIds = userRoles.map(r => r.roleId);
    if (roleIds.length === 0) return [];

    // 2) 这些角色拥有的所有权限 ID
    const rolePerms = await this.pgService.rolePermission.findMany({
      where: { roleId: { in: roleIds } },
      select: { permissionId: true },
    });
    const ownedPermissionIds = rolePerms.map(rp => rp.permissionId);
    // 如果没有任何权限，也仍然要把菜单查出来（有些系统菜单可见但无动作）
    // 可按需早退：if (ownedPermissionIds.length === 0) …

    // 3) 这些角色拥有的菜单（用 Menu.roles 反查，天然“去重”）
    const menus = await this.pgService.menu.findMany({
      where: {
        roles: { some: { roleId: { in: roleIds } } },
        status: true, // 只取启用的菜单（按需）
        // isDeleted: false, // 如果你有软删字段，可加在这
      },
      include: {
        meta: true,
        // 只取“该用户通过其角色实际拥有的”且“属于此菜单”的权限
        permissionList: {
          where: ownedPermissionIds.length ? { id: { in: ownedPermissionIds } } : undefined,
          select: { id: true, code: true, menuId: true },
        },
        // 如需树形可一起拿：children: true, parent: true
      },
      orderBy: { sort: 'asc' }, // 按你的排序字段
    });

    // 4) 把 permission.code 注入到对应菜单的 meta 里
    const shaped = menus.map(m => {
      const codes = m.permissionList.map(p => p.code);
      const meta = m.meta ? { ...m.meta, permissions: codes } : ({ permissions: codes } as any); // 没有 meta 时给个最小壳；你也可以选择保持 null

      // 若前端不需要原始 permissionList，可移除以减小 payload
      const { permissionList, ...rest } = m;
      return { ...rest, meta };
    });

    return shaped;
  }

  async update(updateRoleDto: UpdateRoleDto) {
    const { id, menuIds, permissionIds, ...rest } = updateRoleDto;
    const res = await this.pgService.$transaction(async tx => {
      // 1. 清空原有菜单和权限  2. 绑定新菜单和权限
      const res = await tx.role.update({
        where: { id },
        data: {
          ...rest,
          /*
            隐式多对多时使用
            menus: {
              // 清理所有关联的菜单
              set: [],
              connect: menuIds.map(id => ({ id })),
            },
          */

          //  显式多对多 使用set 清空 然后create 创建
          menus: {
            deleteMany: {}, // 清空所有旧关联
            create: menuIds.map(menuId => ({
              menu: { connect: { id: menuId } },
            })),
          },
          permissions: {
            deleteMany: {}, // 清空所有旧关联
            create: permissionIds.map(permissionId => ({
              permission: { connect: { id: permissionId } },
            })),
          },
        },
        select: { id: true },
      });
      return res;
    });
    return { id: res.id, message: '更新角色成功' };
  }

  async remove(id: number) {
    const res = await this.pgService.role.delete({
      where: { id },
      select: { id: true },
    });
    return { id: res.id, message: '删除角色成功' };
  }

  async generateRoleSeed(data: RoleSeedDto[]) {
    // 创建或更新  如果当前项已存在相同的name 和code  则只更新当前项

    const res = await this.pgService.$transaction(async tx => {
      for (const role of data) {
        await tx.role.upsert({
          where: { code: role.code },
          update: { ...role, id: undefined },
          create: { ...role, id: undefined },
        });
      }
    });
    return { message: '生成角色种子数据成功', success: true };
  }
}
