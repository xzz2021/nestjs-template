import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class PermissionDto {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  value?: string;
}

export class CreatePermissionDto extends PermissionDto {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  resource: string;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  menuId: number;
}

export class UpdatePermissionDto extends PermissionDto {
  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  resource: string;
}

export class BatchPermissionDto {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  path: string;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  menuId: number;
}
