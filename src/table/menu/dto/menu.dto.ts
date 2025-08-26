import { IsIdNotEqualToParentIdConstraint } from '@/processor/pipe/validater';
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, Validate, IsNumber, IsObject, ValidateNested, IsArray, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class MetaDto {
  @ApiPropertyOptional({ type: String })
  @IsNotEmpty({ message: '菜单标题不能为空' })
  title: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ type: Boolean, default: false })
  @IsOptional()
  affix?: boolean = false;

  @ApiPropertyOptional({ type: String, default: false })
  @IsOptional()
  activeMenu?: boolean = false;

  @ApiPropertyOptional({ type: Boolean, default: false })
  @IsOptional()
  alwaysShow?: boolean = false;

  @ApiPropertyOptional({ type: Boolean, default: true })
  @IsOptional()
  breadcrumb?: boolean = true;

  @ApiPropertyOptional({ type: Boolean, default: false })
  @IsOptional()
  canTo?: boolean = false;

  @ApiPropertyOptional({ type: Boolean, default: false })
  @IsOptional()
  hidden?: boolean = false;

  @ApiPropertyOptional({ type: Boolean, default: false })
  @IsOptional()
  noCache?: boolean = false;

  @ApiPropertyOptional({ type: Boolean, default: false })
  @IsOptional()
  noTagsView?: boolean = false;
}

export class MenuDto {
  @ApiProperty({ type: Number })
  @IsNotEmpty({ message: '菜单ID不能为空' })
  @IsNumber()
  id: number;

  @ApiProperty({ type: String })
  @IsNotEmpty({ message: '菜单名称不能为空' })
  name: string;

  @ApiProperty({ type: String })
  @IsNotEmpty({ message: '菜单路径不能为空' })
  path: string;

  @ApiProperty({ type: String })
  @IsNotEmpty({ message: '菜单组件不能为空' })
  component: string;

  // 嵌套对象验证 - 方式1：完整对象验证

  @ApiPropertyOptional({ type: () => MetaDto })
  @IsNotEmpty({ message: '菜单元数据不能为空' })
  @IsObject({ message: 'meta必须是对象' })
  //  @ValidateNested({ each: true }) 数组用 true  对象 用false
  @ValidateNested({ each: false })
  @Type(() => MetaDto)
  // @Type(() => MetaDto) 的作用：
  // 1. 将普通对象转换为 MetaDto 实例
  // 2. 确保 class-transformer 能正确处理嵌套对象
  // 3. 让 class-validator 能正确进行嵌套验证
  // 4. 保持类型安全和面向对象特性
  meta: MetaDto;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  redirect?: string;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  type?: number;

  @ApiProperty({ type: Number, default: 0 })
  @IsOptional()
  @IsNumber()
  sort?: number = 0;

  @ApiProperty({ type: Boolean, default: true })
  @IsOptional()
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

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  parentId?: number;

  //   @ApiPropertyOptional({ type: () => MenuDto })
  //   @IsOptional()
  //   parent?: MenuDto;

  //   @ApiProperty({ isArray: true, type: () => MenuDto })
  //   @IsOptional()
  //   children?: MenuDto[];
}

export class CreateMenuDto extends OmitType(MenuDto, ['id']) {}
export class UpdateMenuDto extends MenuDto {
  // 限制id 不能等于 parentId
  @Validate(IsIdNotEqualToParentIdConstraint)
  checkIdsNotEqual: boolean; // 这个字段是为了触发自定义验证器，可以省略其值
}
