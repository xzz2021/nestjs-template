import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsArray } from 'class-validator';

export class DictionaryDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @IsOptional()
  sort?: number;

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
