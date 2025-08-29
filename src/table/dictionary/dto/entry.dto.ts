import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsArray } from 'class-validator';

export class DictionaryEntryDto {
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

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  @IsOptional()
  status?: boolean = true;

  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpsertEntryDto extends DictionaryEntryDto {
  @ApiProperty({ type: Number })
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty({ type: Number })
  @IsNumber()
  @IsNotEmpty()
  dictionaryId: number;
}

export class DeleteEntryDto {
  @ApiProperty({ type: [Number] })
  @IsArray()
  @IsNotEmpty()
  @Transform(({ value }) => value.map(Number))
  ids: number[];
}
