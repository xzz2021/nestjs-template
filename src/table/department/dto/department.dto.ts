// import { User } from '@/prisma/dto/user';
import { ApiProperty, ApiPropertyOptional, IntersectionType, OmitType, PartialType, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
// import { PickType } from '@nestjs/mapped-types';
// import { Department } from '@/prisma/dto/department';
export class DepartmentDto {
  @ApiProperty({ type: Number })
  id: number;

  /**
   * 用户名
   */
  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: Boolean })
  status: boolean = true;

  @ApiPropertyOptional({ type: String })
  remark?: string;

  @ApiProperty({ type: Boolean })
  isDeleted: boolean;

  @ApiPropertyOptional({ type: Number })
  parentId?: number;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiPropertyOptional({ type: Date })
  deletedAt?: Date;

  // @ApiProperty({ isArray: true, type: () => User })
  // users: User[];

  @ApiPropertyOptional({ type: () => DepartmentDto })
  parent?: DepartmentDto;

  @ApiProperty({ isArray: true, type: () => DepartmentDto })
  children: DepartmentDto[];
}

export class UpdateDepartmentDto {
  @ApiProperty({ type: Number })
  @IsNotEmpty()
  id: number;

  /* 

  //  两者选其一  必有一项

  @ApiProperty({ type: Number })
  @ValidateIf((object) => !object.name)   //    要么有name  要么有id
  @ValidateIf((object, value) => value !== null)
  id: number;

  @ApiProperty({ type: String })
  @ValidateIf((object) => !object.id)
  name: string;


  @IsString()
  @IsIn(['can', 'cannot'])  // 限定 值的  范围
  test: 'can' | 'cannot';
*/
  @ApiProperty({ type: Number })
  @IsOptional()
  parentId?: number;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @MaxLength(10, { message: '部门名称不能超过10个字符' })
  name: string;

  @ApiProperty({ type: Boolean })
  @IsOptional()
  status: boolean;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  remark: string | null;

  // @Validate(IsIdNotEqualToParentIdConstraint)
  // checkIdsNotEqual: boolean; // 这个字段是为了触发自定义验证器，可以省略其值
}
//  移除指定键
export class CreateDepartmentDto extends OmitType(DepartmentDto, ['id', 'createdAt', 'updatedAt', 'deletedAt']) {}

// 部分更新
export class UpdateDepartmentDto2 extends PartialType(DepartmentDto) {}

// 选择指定键
export class FindDepartmentDto extends PickType(DepartmentDto, ['id'] as const) {}

// 合并
export class UpdateDepartment2Dto extends IntersectionType(CreateDepartmentDto, UpdateDepartmentDto) {}

// 移除指定键, 并部分更新
export class UpdateDepartment3Dto extends PartialType(OmitType(CreateDepartmentDto, ['name'] as const)) {}

/*

如何验证数组
x-------------
@Post()
createBulk(@Body() createUserDtos: CreateUserDto[]) {
  return 'This action adds new users';
}

√------------------
@Post()
createBulk(
  @Body(new ParseArrayPipe({ items: CreateUserDto }))
  createUserDtos: CreateUserDto[],
) {
  return 'This action adds new users';
}

*/
