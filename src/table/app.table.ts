import { DepartmentModule } from '@/table/department/department.module';
import { RoleModule } from '@/table/role/role.module';
import { MenuModule } from '@/table/menu/menu.module';
import { PermissionModule } from '@/table/permission/permission.module';
import { UserModule } from '@/table/user/user.module';
import { DictionaryModule } from '@/table/dictionary/dictionary.module';
import { AuthModule } from '@/table/auth/auth.module';
export const CORE_TABLE_MODULE = [DepartmentModule, RoleModule, MenuModule, PermissionModule, UserModule, DictionaryModule, AuthModule];
