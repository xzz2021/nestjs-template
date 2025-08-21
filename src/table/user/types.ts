export interface RegisterInfo {
  username: string;
  password: string;
  phone: string;
}

export interface UpdatePwdType {
  id: number;
  password: string;
  newPassword: string;
}

export interface UpdateUserPwdType {
  password: string;
  code: string;
}
