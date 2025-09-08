import { IsDateWithTransform } from '@/processor/pipe/validater';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class DeleteFileDto {
  @ApiProperty({ type: Number, isArray: true, description: '文件ID数组', example: [1, 2, 3] })
  @Transform(({ value }) => (Array.isArray(value) ? [...new Set(value)].map(Number) : value))
  @IsArray()
  @IsNotEmpty()
  ids: number[];
}

export class UploadFileDto {
  @ApiProperty({ type: String, description: '文件名称', example: '文件名称' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: String, description: '文件MIME类型', example: 'application/pdf' })
  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @ApiProperty({ type: String, description: '文件路径', example: '文件路径' })
  @IsString()
  @IsNotEmpty()
  path: string;

  @ApiProperty({ type: Number, description: '文件大小', example: 1000 })
  @IsNumber()
  @IsNotEmpty()
  size: number;

  @ApiProperty({ type: String, description: '文件URL', example: '文件URL' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ type: String, description: '文件扩展名', example: 'pdf' })
  @IsString()
  @IsNotEmpty()
  extension: string;
}

export class FileListResDto extends UploadFileDto {
  @ApiProperty({ type: Date, description: '创建时间', example: new Date() })
  @IsDate()
  @IsNotEmpty()
  @IsDateWithTransform()
  createdAt: Date;
}
