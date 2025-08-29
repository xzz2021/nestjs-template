const list = [
  {
    name: '新增',
    code: 'add',
  },
  {
    name: '编辑',
    code: 'update',
  },
  {
    name: '删除',
    code: 'delete',
  },
  {
    name: '查看',
    code: 'view',
  },
];

export const batchCreatePermissionList = (menuId: number, resource: string) => {
  const permissionList = list.map(item => ({
    ...item,
    resource,
    menuId,
  }));
  return permissionList;
};
