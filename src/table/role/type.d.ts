interface RoleDTO {
  name: string;
  code: string;
  remark?: string;
  status?: boolean;
  menuIds: number[];
  permissionIds: number[];
}

type UpdateRoleDTO = RoleDTO & { id: number };
