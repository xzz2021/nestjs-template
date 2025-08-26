import { Menu } from '@/prisma/dto/menu';
import { RolePermission } from '@/prisma/dto/role_permission';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PermissionDto {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String })
  code: string;

  @ApiPropertyOptional({ type: String })
  value?: string;

  @ApiProperty({ type: String })
  resource: string;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiProperty({ type: Number })
  menuId: number;

  @ApiProperty({ type: () => Menu })
  menu: Menu;

  @ApiProperty({ isArray: true, type: () => RolePermission })
  roles: RolePermission[];
}
