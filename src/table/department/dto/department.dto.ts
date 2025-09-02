// import { User } from '@/prisma/dto/user';
import { IsDateWithTransform, IsIdNotEqualToParentIdConstraint } from '@/processor/pipe/validater';
import { ApiProperty, ApiPropertyOptional, IntersectionType, OmitType, PartialType, PickType } from '@nestjs/swagger';
import { plainToClass, Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Validate, ValidateNested } from 'class-validator';

export class DepartmentDto {
  @ApiProperty({ type: Number, description: '部门ID', example: 0 })
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  id: number;

  @ApiProperty({ type: String, description: '部门名称', example: '设计部' })
  @IsString()
  @IsNotEmpty({ message: '部门名称不能为空' })
  @MaxLength(50, { message: '部门名称不能超过50个字符' })
  name: string;

  @ApiProperty({ type: Boolean, description: '部门状态', default: true, example: true })
  @IsOptional()
  @IsBoolean()
  status: boolean = true;

  @ApiPropertyOptional({ type: String, description: '部门备注', example: '部门备注' })
  @IsOptional()
  @MaxLength(200, { message: '部门备注不能超过200个字符' })
  @IsString()
  remark?: string;

  @ApiPropertyOptional({ type: Number, description: '父部门ID', example: null })
  @IsOptional()
  @IsNumber()
  parentId?: number;

  // @ApiProperty({ type: Date })
  // createdAt: Date;

  // @ApiProperty({ type: Date })
  // updatedAt: Date;

  // @ApiPropertyOptional({ type: Date })
  // deletedAt?: Date;

  // @ApiPropertyOptional({ type: () => DepartmentDto, description: '父部门ID' })
  // @IsOptional()
  // parent?: DepartmentDto;

  // @ApiProperty({ isArray: true, type: () => DepartmentDto })
  // children: DepartmentDto[];
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
export class CreateDepartmentDto extends PickType(DepartmentDto, ['name', 'status', 'remark', 'parentId'] as const) {}

export class UpdateDepartmentDto extends PickType(DepartmentDto, ['id', 'name', 'status', 'remark', 'parentId'] as const) {
  // 限制id 不能等于 parentId
  @Validate(IsIdNotEqualToParentIdConstraint)
  checkIdsNotEqual: boolean; // 这个字段是为了触发自定义验证器，可以省略其值
}

// 选择指定键
export class FindDepartmentDto extends PickType(DepartmentDto, ['id'] as const) {}

export class DeleteDepartmentDto extends PickType(DepartmentDto, ['id'] as const) {}

// 合并
export class UpdateDepartment2Dto extends IntersectionType(CreateDepartmentDto, UpdateDepartmentDto) {}

// 移除指定键, 并部分更新
export class UpdateDepartment3Dto extends PartialType(OmitType(CreateDepartmentDto, ['name'] as const)) {}

// 只用于swagger展示返回数据格式  不做校验  所以只要有ApiProperty就可以
export class DepartmentListDto extends DepartmentDto {
  @ApiProperty({ type: String, description: '部门路径', example: '1,2,3' })
  path: string;

  @ApiProperty({ type: DepartmentListDto, isArray: true, description: '子部门' })
  children?: DepartmentListDto[];

  @ApiProperty({ type: Date, description: '创建时间', example: '2021-01-01 12:00:00' })
  createdAt: Date;

  @ApiProperty({ type: Date, description: '更新时间', example: '2021-01-01 12:00:00' })
  updatedAt: Date;
}

export class UpsertDepartmentDto {
  @ApiProperty({
    isArray: true,
    type: () => UpsertDepartmentDto,
    description: '子部门',
    example: [{ name: '设计部', status: true, remark: '部门备注', parentId: 1 }],
  })
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
  @IsDateWithTransform()
  // @Transform(({ value }) => value.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }).split('T').join(' ').replaceAll('/', '-'))
  createdAt: Date;

  // @Exclude()
  @IsDateWithTransform()
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

export class DepartmentSeedDto extends OmitType(DepartmentDto, ['id', 'parentId'] as const) {
  @ApiProperty({ isArray: true, type: () => DepartmentSeedDto })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DepartmentDto)
  @IsOptional()
  children: DepartmentSeedDto[];
}

export class DepartmentSeedArrayDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DepartmentSeedDto)
  @ApiProperty({ type: DepartmentSeedDto, isArray: true })
  data: DepartmentSeedDto[];
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



  @ValidateNested({ each: false })




验证关联数据存在性
  @IsMenuExists({ message: '父级菜单不存在' })
  @ValidateNested({ each: false })
  parentId?: number;


  


*/
