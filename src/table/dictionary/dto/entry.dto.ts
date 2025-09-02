import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsArray } from 'class-validator';

export class DictionaryEntryDto {
  @ApiProperty({ type: Number, description: '字典项ID, 更新时必传', example: 1 })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  id?: number;

  @ApiProperty({ type: String, description: '字典项名称', example: '字典项名称' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: String, description: '字典项编码', example: '字典项编码' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ type: Number, description: '字典项排序', example: 1 })
  @IsNumber()
  @IsOptional()
  sort?: number;

  @ApiProperty({ type: Boolean, description: '字典项状态', example: true })
  @IsBoolean()
  @IsOptional()
  status?: boolean = true;

  @ApiPropertyOptional({ type: String, description: '字典项描述', example: '字典项描述' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpsertEntryDto extends DictionaryEntryDto {
  @ApiProperty({ type: Number, description: '字典ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  dictionaryId: number;
}

export class DeleteEntryDto {
  @ApiProperty({ type: [Number], description: '字典项ID数组', example: [1, 2, 3] })
  @IsArray()
  @IsNotEmpty()
  @Transform(({ value }) => value.map(Number))
  ids: number[];
}
