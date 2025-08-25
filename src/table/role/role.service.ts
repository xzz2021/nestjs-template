import { MenuItemsType } from '@/processor/utils/mergeMenusAndPermission';
import { mergeMenusByRoles } from '@/processor/utils/mergeMenusAndPermission';
import { executePagedQuery, IQueryParams } from '@/processor/utils/queryBuilder';
import { Injectable } from '@nestjs/common';
import { PgService } from '@/prisma/pg.service';

@Injectable()
export class RoleService {
  constructor(private readonly pgService: PgService) {}

  async createRoleWithMenusAndPermissions(data: RoleDTO) {
    const { menuIds, permissionIds, ...rest } = data;
    try {
      const res = await this.pgService.$transaction(async tx => {
        // 1. 创建角色
        const newRole = await tx.role.create({
          data: rest,
        });
        // 2. 分配菜单
        if (menuIds.length > 0) {
          await tx.role.update({
            where: { id: newRole.id },
            data: {
              menus: {
                connect: menuIds.map(id => ({ id })),
              },
            },
          });
        }
        // 3. 分配权限
        if (permissionIds.length > 0) {
          await tx.role.update({
            where: { id: newRole.id },
            data: {
              permissions: {
                connect: permissionIds.map(id => ({ id })),
              },
            },
          });
        }
        return newRole;
      });
      return { code: 200, list: res, message: '创建角色成功' };
    } catch (error) {
      return { code: 400, message: error.message };
    }
  }

  async createRoleWithMenusAndPermissions2(data: RoleDTO) {
    const { menuIds, permissionIds, code, ...rest } = data;
    try {
      // 1. 创建角色
      const newRole = await this.pgService.role.create({
        data: {
          ...rest,
          code: code.toUpperCase(),
          menus: {
            connect: menuIds.map(id => ({ id })),
          },
          permissions: {
            connect: permissionIds.map(id => ({ id })),
          },
        },
      });

      return { code: 200, list: newRole, message: '创建角色成功' };
    } catch (error) {
      return { code: 400, message: error.message };
    }
  }

  async getRoleList(searchParam: IQueryParams) {
    return executePagedQuery(this.pgService.role, searchParam, '角色');
  }

  getMenuByRoleId(roleId: number) {
    // 既包含包含菜单也包含权限列表和meta内真实权限
    // const res = await this.getRoleMenuWithPermission(roleId);
    return { code: 200, list: [], message: '获取菜单及对应权限成功' };
  }

  //  登录瞬间获取菜单表和对应的权限值字符串数组
  async findRoleMenu(userid: number): Promise<{ code: number; menuList?: any[]; list?: any[]; message: string }> {
    // 1. 获取角色菜单 首先判断用户id, 管理员返回所有菜单
    // 2. 其他用户 获取用户角色id数组
    try {
      if (+userid === 1) {
        const res = await this.getRoleMenuWithPermissionOfAdmin();
        return { code: 200, menuList: res, message: '获取管理员菜单成功' };
      }
      //  其他用户 先查询角色信息
      const user = await this.pgService.user.findUnique({
        where: { id: userid },
        select: {
          roles: { select: { id: true } },
        },
      });

      const roleIds = user?.roles as Array<{ id: number }>;
      console.log('🚀 ~ RoleService ~ findRoleMenu ~ roleIds:', roleIds);
      if (!roleIds) {
        return { code: 200, menuList: [], message: '请联系管理员分配角色' };
      }
      // const rolesMenus = await Promise.all(roleIds.map(item => this.getRoleMenuWithPermission(+item.id)));
      const rolesMenus = [];
      const menuWithPermission = mergeMenusByRoles(rolesMenus.flat() as MenuItemsType[]);
      if (menuWithPermission?.length === 0) {
        return { code: 200, menuList: [], message: '请联系管理员分配角色菜单' };
      }

      // 还需要判断   遍历整个数组  如果某个菜单项的父级不存在则删除当前项
      // 1. 收集所有 id
      const ids = new Set(menuWithPermission.map(m => m.id));

      // 2. 过滤：只保留 parentId === null 或者 parentId 在 ids 里
      const filtered = menuWithPermission.filter((m: any) => m.parentId === null || ids.has(m.parentId as number));
      return { code: 200, menuList: filtered, message: '菜单成功' };
    } catch (error) {
      return { code: 400, message: error.message };
    }
  }

  async getRoleMenuWithPermissionOfAdmin() {
    try {
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
      if (!roleWithMenusAndPermissions) {
        return [];
      }
      if (roleWithMenusAndPermissions.length === 0) {
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
    } catch {
      return [];
    }
  }

  // async getRoleMenuWithPermission(id: number) {
  //   //  获取单个角色菜单及对应的权限
  //   try {
  //     // 1. role  --> menus  --> permissions
  //     const roleData = await this.pgService.role.findUnique({
  //       where: { id },
  //       select: {
  //         menus: {
  //           select: {
  //             id: true,
  //             name: true,
  //             path: true,
  //             component: true,
  //             redirect: true,
  //             type: true,
  //             status: true,
  //             sort: true,
  //             meta: true,
  //             parentId: true,
  //             permissionList: {
  //               where: { roles: { some: { id } } },
  //               select: {
  //                 code: true,
  //               },
  //             },
  //           },
  //         },
  //       },
  //     });

  //     const newData = roleData?.menus.map(menu => {
  //       const { meta, permissionList, ...rest } = menu;
  //       if (!permissionList) return menu;
  //       return {
  //         ...rest,
  //         meta: {
  //           ...((meta as object) || {}),
  //           permissions: permissionList.map(p => p.code),
  //         },
  //       };
  //     });
  //     return newData;
  //   } catch {
  //     return [];
  //   }
  // }

  // async getRoleMenuWithPermission2(id: number) {
  //   //  获取单个角色菜单及对应的权限
  //   const start = Date.now();
  //   try {
  //     // 1. role  --> menus  --> permissions
  //     const roleData = await this.pgService.role.findUnique({
  //       where: { id },
  //       select: {
  //         menus: {
  //           select: {
  //             id: true,
  //             meta: true,
  //             permissionList: {
  //               where: { roles: { some: { id } } },
  //               select: {
  //                 value: true,
  //               },
  //             },
  //           },
  //         },
  //       },
  //     });

  //     const newData = roleData?.menus.map(menu => {
  //       const { meta, permissionList, ...rest } = menu;
  //       if (!permissionList) return menu;
  //       return {
  //         ...rest,
  //         meta: {
  //           ...(meta || {}),
  //           permissions: permissionList.map(p => p.value),
  //         },
  //       };
  //     });
  //     const end = Date.now();
  //     console.log('🚀 ~ RoleService ~ getRoleMenuWithPermission ~ end:', end - start);
  //     return newData;
  //   } catch {
  //     return [];
  //   }
  // }

  // async getRoleMenuWithPermission2display(id: number) {
  //   const start = Date.now();
  //   try {
  //     const roleWithMenusAndPermissions = await this.pgService.role.findUnique({
  //       where: { id },
  //       select: {
  //         id: true,
  //         name: true,
  //         status: true,
  //         remark: true,
  //         menus: {
  //           select: {
  //             id: true,
  //             name: true,
  //             path: true,
  //             component: true,
  //             redirect: true,
  //             type: true,
  //             status: true,
  //             sort: true,
  //             meta: true,
  //             parentId: true,
  //             permissionList: {
  //               select: {
  //                 name: true,
  //                 code: true,
  //                 roles: {
  //                   where: { id },
  //                   select: { id: true },
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //     });
  //     if (!roleWithMenusAndPermissions) return [];
  //     // 整理权限名数组到每个菜单的 meta.permission 中
  //     const result = roleWithMenusAndPermissions.menus.map(menu => {
  //       const permissionNames = menu.permissionList.filter(p => p.roles.length > 0).map(p => p.code);

  //       return {
  //         ...menu,
  //         meta: {
  //           ...((menu?.meta as object) || {}),
  //           permission: permissionNames,
  //         },
  //       };
  //     });
  //     const end = Date.now();
  //     console.log('🚀 ~ RoleService ~ getRoleMenuWithPermission2display ~ end:', end - start);
  //     return result;
  //   } catch {
  //     return [];
  //   }
  // }

  async update(updateRoleDto: RoleDTO & { id: number }) {
    const { id, menuIds, permissionIds, ...rest } = updateRoleDto;
    try {
      const res = await this.pgService.$transaction(async tx => {
        // 1. 清空原有菜单和权限
        // await tx.role.update({
        //   where: { id },
        //   data: {
        //     menus: { set: [] },
        //     permissions: { set: [] },
        //   },
        // });
        // 2. 绑定新菜单
        await tx.role.update({
          where: { id },
          data: {
            ...rest,
            menus: {
              // 清理所有关联的菜单
              set: [],
              connect: menuIds.map(id => ({ id })),
            },
            permissions: {
              // 清理所有关联的权限
              set: [],
              connect: permissionIds.map(id => ({ id })),
            },
          },
        });
        return true;
      });
      if (res) {
        return { code: 200, list: res, message: '更新角色成功' };
      }
      return { code: 400, message: '更新角色失败' };
    } catch (error) {
      console.log('🚀 ~ xzz:=======================e -> create -> error', error.message);
      return { code: 400, error: error.message, message: '角色信息更新失败' };
    }
  }

  async remove(id: number) {
    try {
      // 删除角色 同时删除角色关联的菜单和权限
      const res = await this.pgService.$transaction([
        // 清空菜单和权限的关联
        this.pgService.role.update({
          where: { id },
          data: {
            menus: { set: [] },
            permissions: { set: [] },
          },
        }),
        // 删除角色
        this.pgService.role.delete({
          where: { id },
        }),
      ]);
      if (res) {
        return { code: 200, message: '删除角色成功' };
      }
      return { code: 400, message: '删除角色失败' };
    } catch (error) {
      console.log('xzz2021: remove -> error', error.message);
      return { code: 400, message: error.message };
    }
  }
}
