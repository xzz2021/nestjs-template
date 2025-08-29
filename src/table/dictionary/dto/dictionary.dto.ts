import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsArray, ValidateNested } from 'class-validator';

export class DictionaryDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  code: string;

  // @ApiProperty({ type: Number })
  // @IsNumber()
  // @IsOptional()
  // sort?: number;

  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  @IsOptional()
  status?: boolean = true;
}

export class UpsertDictionaryDto extends DictionaryDto {
  @ApiProperty({ type: Number })
  @IsNumber()
  @IsOptional()
  id?: number;
}

export class DeleteDictionaryDto {
  @ApiProperty({ type: [Number] })
  @IsArray()
  @IsNotEmpty()
  @Transform(({ value }) => value.map(Number))
  ids: number[];
}

export class DictionarySeedDto extends DictionaryDto {
  @ApiProperty({ type: [DictionaryDto] })
  @IsArray()
  @IsOptional()
  // 检查entries内部的每一项 过滤多余字段
  @ValidateNested({ each: true })
  @Type(() => DictionaryDto)
  entries?: DictionaryDto[];
}

//  ValidationPipe 的 transform/whitelist 只会对 DTO 类实例起作用
//  如果是数组  一定要用一个类包裹  否则不会进行校验过滤
export class DictionarySeedArrayDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DictionarySeedDto)
  data: DictionarySeedDto[];
}
