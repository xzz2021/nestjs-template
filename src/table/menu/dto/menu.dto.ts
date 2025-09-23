import { IsIdNotEqualToParentIdConstraint } from '@/processor/pipe/validater';
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, Validate, IsNumber, IsObject, ValidateNested, IsArray, IsString, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class MetaDto {
  @ApiPropertyOptional({ type: String, description: '菜单标题', example: '菜单标题' })
  @IsString()
  @IsNotEmpty({ message: '菜单标题不能为空' })
  title: string;

  @ApiPropertyOptional({ type: String, description: '菜单图标', example: '菜单图标' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ type: Boolean, default: false, description: '固定', example: false })
  @IsOptional()
  @IsBoolean()
  affix?: boolean = false;

  @ApiPropertyOptional({ type: String, default: false, description: '活跃', example: false })
  @IsOptional()
  @IsBoolean()
  activeMenu?: boolean = false;

  @ApiPropertyOptional({ type: Boolean, default: false, description: '总是显示', example: false })
  @IsOptional()
  @IsBoolean()
  alwaysShow?: boolean = false;

  @ApiPropertyOptional({ type: Boolean, default: true })
  @IsOptional()
  @IsBoolean()
  breadcrumb?: boolean = true;

  @ApiPropertyOptional({ type: Boolean, default: false, description: '缓存', example: false })
  @IsOptional()
  @IsBoolean()
  canTo?: boolean = false;

  @ApiPropertyOptional({ type: Boolean, default: false, description: '隐藏', example: false })
  @IsOptional()
  @IsBoolean()
  hidden?: boolean = false;

  @ApiPropertyOptional({ type: Boolean, default: false, description: '缓存', example: false })
  @IsOptional()
  @IsBoolean()
  noCache?: boolean = false;

  @ApiPropertyOptional({ type: Boolean, default: false, description: '标签视图', example: false })
  @IsOptional()
  @IsBoolean()
  noTagsView?: boolean = false;
}

export class PermissionDto {
  @ApiProperty({ type: Number, description: '权限ID', example: 1 })
  // @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty({ message: '权限ID不能为空' })
  id: number;

  @ApiProperty({ type: String, description: '权限名称', example: '新增' })
  @IsString()
  @IsNotEmpty({ message: '权限名称不能为空' })
  name: string;

  @ApiProperty({ type: String, description: '权限代码', example: 'add' })
  @IsString()
  @IsNotEmpty({ message: '权限代码不能为空' })
  code: string;

  @ApiProperty({ type: String, description: '权限值', example: '12' })
  @IsOptional()
  @IsString()
  value?: string;

  @ApiProperty({ type: String, description: '权限资源', example: 'menu' })
  @IsString()
  @IsNotEmpty({ message: '权限资源不能为空' })
  resource: string;
}

export class PermissionNoIdDto extends OmitType(PermissionDto, ['id'] as const) {}

export class MenuDto {
  @ApiProperty({ type: Number, description: '菜单ID', example: 1 })
  // @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty({ message: '菜单ID不能为空' })
  id: number;

  @ApiProperty({ type: String, description: '菜单名称', example: '菜单管理' })
  @IsString()
  @IsNotEmpty({ message: '菜单名称不能为空' })
  name: string;

  @ApiProperty({ type: String, description: '菜单路径', example: 'menu' })
  @IsString()
  @IsNotEmpty({ message: '菜单路径不能为空' })
  path: string;

  @ApiProperty({ type: String, description: '菜单组件', example: '组件' })
  @IsString()
  @IsNotEmpty({ message: '菜单组件不能为空' })
  component: string;

  // 嵌套对象验证 - 方式1：完整对象验证

  @ApiPropertyOptional({ type: () => MetaDto, description: '元数据' })
  @IsObject({ message: 'meta必须是对象' })
  //  @ValidateNested({ each: true }) 数组用 true  对象 用false
  @ValidateNested({ each: false })
  @Type(() => MetaDto)
  @IsNotEmpty({ message: '菜单元数据不能为空' })
  // @Type(() => MetaDto) 的作用：
  // 1. 将普通对象转换为 MetaDto 实例
  // 2. 确保 class-transformer 能正确处理嵌套对象
  // 3. 让 class-validator 能正确进行嵌套验证
  // 4. 保持类型安全和面向对象特性
  meta: MetaDto;

  @ApiPropertyOptional({ type: String, description: '重定向', example: '重定向' })
  @IsOptional()
  @IsString()
  redirect?: string;

  @ApiPropertyOptional({ type: Number, description: '菜单类型', example: 1 })
  @IsOptional()
  @IsNumber()
  type?: number;

  @ApiProperty({ type: Number, default: 0, description: '菜单排序', example: 0 })
  @IsOptional()
  @IsNumber()
  sort?: number = 0;

  @ApiProperty({ type: Boolean, default: true, description: '菜单状态', example: true })
  @IsOptional()
  @IsBoolean()
  status?: boolean = true;

  //   @ApiProperty({ type: Date })
  //   updatedAt: Date;

  //   @ApiPropertyOptional({ type: Number })
  //   @IsOptional()
  //   metaId?: number;

  //   @ApiProperty({ isArray: true, type: () => Permission })
  //   permissionList: Permission[];

  //   @ApiProperty({ isArray: true, type: () => RoleMenu })
  //   roles: RoleMenu[];

  @ApiPropertyOptional({ type: Number, description: '父级菜单ID', example: null })
  @IsOptional()
  // @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  parentId?: number;

  //   @ApiPropertyOptional({ type: () => MenuDto })
  //   @IsOptional()
  //   parent?: MenuDto;

  //   @ApiProperty({ isArray: true, type: () => MenuDto })
  //   @IsOptional()
  //   children?: MenuDto[];
}

export class MenuSortDto {
  @ApiProperty({ type: Number, description: '菜单ID', example: 1 })
  // @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty({ message: '菜单ID不能为空' })
  id: number;

  @ApiProperty({ type: Number, description: '菜单排序', example: 1 })
  // @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty({ message: '菜单排序不能为空' })
  sort: number;
}

export class MenuSortArrayDto {
  @IsArray()
  @ApiProperty({
    type: MenuSortDto,
    isArray: true,
    description: '菜单排序列表',
    example: [
      { id: 1, sort: 1 },
      { id: 2, sort: 2 },
    ],
  })
  @ValidateNested({ each: true })
  @Type(() => MenuSortDto)
  data: MenuSortDto[];
}

export class CreateMenuDto extends OmitType(MenuDto, ['id']) {}
export class UpdateMenuDto extends MenuDto {
  // 限制id 不能等于 parentId
  @Validate(IsIdNotEqualToParentIdConstraint)
  checkIdsNotEqual: boolean; // 这个字段是为了触发自定义验证器，可以省略其值
}

export class MenuListDto extends MenuDto {
  @ApiProperty({ type: PermissionDto, isArray: true, description: '权限列表' })
  permissionList: PermissionDto[];

  @ApiProperty({ type: MenuListDto, isArray: true, description: '子菜单列表' })
  children: MenuListDto[];
}

export class SeedMenuDto extends OmitType(MenuDto, ['id', 'parentId']) {
  @ApiPropertyOptional({ type: () => SeedMenuDto })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SeedMenuDto)
  children?: SeedMenuDto[];

  @ApiPropertyOptional({ type: () => PermissionNoIdDto })
  @IsOptional()
  @ValidateNested({ each: false })
  @Type(() => PermissionNoIdDto)
  permissionList?: PermissionNoIdDto[];
}
export class MenuSeedArrayDto {
  @ApiProperty({
    type: SeedMenuDto,
    isArray: true,
    description: '菜单种子列表',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SeedMenuDto)
  data: SeedMenuDto[];
}
