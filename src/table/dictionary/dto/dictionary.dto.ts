import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { DictionaryEntryDto } from './entry.dto';

export class DictionaryDto {
  @ApiProperty({ type: String, description: '字典名称', example: '字典名称' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: String, description: '字典编码', example: '字典编码' })
  @IsString()
  @IsNotEmpty()
  code: string;

  // @ApiProperty({ type: Number })
  // @IsNumber()
  // @IsOptional()
  // sort?: number;

  @ApiPropertyOptional({ type: String, description: '字典描述', example: '字典描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: Boolean, description: '字典状态', example: true })
  @IsBoolean()
  @IsOptional()
  status?: boolean = true;
}

export class UpsertDictionaryDto extends DictionaryDto {
  @ApiProperty({ type: Number, description: '字典ID', example: 1 })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  id?: number;
}

export class DeleteDictionaryDto {
  @ApiProperty({ type: Number, isArray: true, description: '字典ID数组', example: [1, 2, 3] })
  @IsArray()
  @IsNotEmpty()
  @Transform(({ value }) => (Array.isArray(value) ? [...new Set(value)].map(Number) : value))
  ids: number[];
}

export class DictionaryListDto extends UpsertDictionaryDto {
  @ApiProperty({ type: DictionaryEntryDto, isArray: true, description: '字典项' })
  entries?: DictionaryEntryDto[];
}

export class DictionarySeedDto extends DictionaryDto {
  @ApiProperty({ type: DictionaryEntryDto, isArray: true, description: '字典项' })
  @IsArray()
  @IsOptional()
  // 检查entries内部的每一项 过滤多余字段
  @ValidateNested({ each: true })
  @Type(() => DictionaryEntryDto)
  entries?: DictionaryEntryDto[];
}

//  ValidationPipe 的 transform/whitelist 只会对 DTO 类实例起作用
//  如果是数组  一定要用一个类包裹  否则不会进行校验过滤
export class DictionarySeedArrayDto {
  @ApiProperty({ type: DictionarySeedDto, isArray: true, description: '字典种子数据' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DictionarySeedDto)
  data: DictionarySeedDto[];
}
