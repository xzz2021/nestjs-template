const list = [
  {
    label: '新增',
    code: 'add',
  },
  {
    label: '编辑',
    code: 'update',
  },
  {
    label: '删除',
    code: 'delete',
  },
  {
    label: '查看',
    code: 'view',
  },
];

export const batchCreatePermissionList = (menuId: number, path: string) => {
  const permissionList = list.map(item => ({
    ...item,
    menuId,
    name: (path + '_' + item.code).toUpperCase(),
  }));
  return permissionList;
};
