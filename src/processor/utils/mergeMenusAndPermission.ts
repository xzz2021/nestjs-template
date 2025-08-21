export interface MenuItemsType {
  id: number;
  name: string;
  meta: {
    [key: string]: any;
    permissions: string[];
  };
  [key: string]: any;
}

export function mergeMenusByRoles(roleMenus: MenuItemsType[] | undefined) {
  if (!roleMenus) return [];
  const menuMap = new Map();

  roleMenus.forEach((menu: MenuItemsType) => {
    const key = menu.id;
    if (!menuMap.has(key)) {
      menuMap.set(key, {
        ...menu,
        meta: {
          ...(menu.meta || {}),
          permissions: new Set(menu?.meta?.permissions || []),
        },
      });
    } else {
      const existing = menuMap.get(key);
      menu?.meta?.permissions?.forEach((p: any) => {
        if (existing?.meta?.permissions) {
          existing.meta.permissions.add(p);
        }
      });
    }
  });

  // 将 Set 转换回 Array
  return Array.from(menuMap.values()).map((menu: MenuItemsType) => ({
    ...menu,
    meta: {
      ...(menu?.meta || {}),
      permissions: Array.from(menu?.meta?.permissions || []),
    },
  }));
}
