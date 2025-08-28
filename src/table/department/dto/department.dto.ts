// import { User } from '@/prisma/dto/user';
import { IsIdNotEqualToParentIdConstraint } from '@/processor/pipe/validater';
import { ApiProperty, ApiPropertyOptional, IntersectionType, OmitType, PartialType, PickType } from '@nestjs/swagger';
import { Exclude, Expose, plainToClass, Transform, Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, MaxLength, Validate, ValidateIf, ValidateNested } from 'class-validator';
// import { PickType } from '@nestjs/mapped-types';
// import { Department } from '@/prisma/dto/department';
export class DepartmentDto {
  @ApiProperty({ type: Number })
  @IsNotEmpty({ message: '部门ID不能为空' })
  id: number;

  @ApiProperty({ type: String, description: '部门名称' })
  @IsNotEmpty({ message: '部门名称不能为空' })
  @MaxLength(50, { message: '部门名称不能超过50个字符' })
  name: string;

  @ApiProperty({ type: Boolean, description: '部门状态', default: true })
  @IsOptional()
  status: boolean = true;

  @ApiPropertyOptional({ type: String, description: '部门备注' })
  @IsOptional()
  @MaxLength(200, { message: '部门备注不能超过200个字符' })
  remark?: string;

  @ApiProperty({ type: Boolean })
  isDeleted: boolean;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  parentId?: number;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiPropertyOptional({ type: Date })
  deletedAt?: Date;

  @ApiPropertyOptional({ type: () => DepartmentDto, description: '父部门ID' })
  @IsOptional()
  parent?: DepartmentDto;

  @ApiProperty({ isArray: true, type: () => DepartmentDto })
  children: DepartmentDto[];
}

// export class UpdateDepartmentDto {
//   @ApiProperty({ type: Number })
//   @IsNotEmpty()
//   id: number;

//   /*

//   //  两者选其一  必有一项

//   @ApiProperty({ type: Number })
//   @ValidateIf((object) => !object.name)   //    要么有name  要么有id
//   @ValidateIf((object, value) => value !== null)
//   id: number;

//   @ApiProperty({ type: String })
//   @ValidateIf((object) => !object.id)
//   name: string;

//   @IsString()
//   @IsIn(['can', 'cannot'])  // 限定 值的  范围
//   test: 'can' | 'cannot';
// */
//   @ApiProperty({ type: Number })
//   @IsOptional()
//   parentId?: number;

//   @ApiProperty({ type: String })
//   @IsNotEmpty()
//   @MaxLength(10, { message: '部门名称不能超过10个字符' })
//   name: string;

//   @ApiProperty({ type: Boolean })
//   @IsOptional()
//   status: boolean;

//   @ApiPropertyOptional({ type: String })
//   @IsOptional()
//   remark: string | null;

//   // @Validate(IsIdNotEqualToParentIdConstraint)
//   // checkIdsNotEqual: boolean; // 这个字段是为了触发自定义验证器，可以省略其值
// }
//  移除指定键
export class CreateDepartmentDto000 extends OmitType(DepartmentDto, ['id', 'createdAt', 'updatedAt', 'deletedAt']) {}

export class CreateDepartmentDto extends PickType(DepartmentDto, ['name', 'status', 'remark', 'parentId'] as const) {}

// 部分更新
export class UpdateDepartmentDto00 extends PartialType(DepartmentDto) {}
export class UpdateDepartmentDto extends PickType(DepartmentDto, ['id', 'name', 'status', 'remark', 'parentId'] as const) {
  // 限制id 不能等于 parentId
  @Validate(IsIdNotEqualToParentIdConstraint)
  checkIdsNotEqual: boolean; // 这个字段是为了触发自定义验证器，可以省略其值
}

// 选择指定键
export class FindDepartmentDto extends PickType(DepartmentDto, ['id'] as const) {}

// 合并
export class UpdateDepartment2Dto extends IntersectionType(CreateDepartmentDto, UpdateDepartmentDto) {}

// 移除指定键, 并部分更新
export class UpdateDepartment3Dto extends PartialType(OmitType(CreateDepartmentDto, ['name'] as const)) {}

export class UpsertDepartmentDto {
  @ApiProperty({ isArray: true, type: () => UpsertDepartmentDto })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertDepartmentDto)
  @IsOptional()
  children?: UpsertDepartmentDto[];

  @ApiProperty({ type: String })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: Boolean })
  @IsOptional()
  status?: boolean;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  remark?: string;
}

export class DepartmentListResDto {
  @Transform(({ value }) => value.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }).split('T').join(' ').replaceAll('/', '-'))
  createdAt: Date;

  // @Exclude()
  @Transform(({ value }) => value.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }).split('T').join(' ').replaceAll('/', '-'))
  updatedAt: Date;

  // 重要！！！ 包含多层children的tree数据  自动应用深层转换
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map((item: any) => {
        return plainToClass(DepartmentListResDto, item, { excludeExtraneousValues: false });
      });
    }
    return value;
  })
  children: DepartmentListResDto[];
}

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
