// dto/create-role.dto.ts
import { IsOptional, IsString, IsInt, IsNotEmpty, IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class LogDto {
  @ApiProperty({ type: Number, description: '日志ID' })
  id: number;

  @ApiProperty({ type: String, description: 'IP' })
  ip: string;

  @ApiProperty({ type: String, description: '用户代理' })
  userAgent: string;

  @ApiProperty({ type: String, description: '方法' })
  method: string;

  @ApiProperty({ type: String, description: '请求URL' })
  requestUrl: string;

  @ApiProperty({ type: String, description: '状态' })
  status: string;

  @ApiProperty({ type: String, description: '响应消息' })
  responseMsg: string;

  @ApiProperty({ type: Object, description: '详情信息' })
  detailInfo: object;

  @ApiProperty({ type: Number, description: '持续时间' })
  duration: number;
}

export class QueryLogParams {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({ type: Number, description: '页码', default: 1 })
  pageIndex: number = 1;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({ type: Number, description: '每页条数', default: 10 })
  pageSize: number = 10;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ type: String, description: '状态' })
  status?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ type: String, description: '目标' })
  target?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ type: String, description: '方法' })
  method?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ type: String, description: '请求URL' })
  requestUrl?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ type: String, description: '日期范围' })
  dateRange?: string;
}

export class DeleteLogDto {
  @ApiProperty({ type: Number, isArray: true, description: '日志ID数组', example: [1, 2, 3] })
  @IsArray()
  @IsNotEmpty()
  @Transform(({ value }) => (Array.isArray(value) ? [...new Set(value)].map(Number) : value))
  ids: number[];
}

export class LogListResDto extends LogDto {
  @ApiProperty({ type: String, description: '创建时间' })
  @Transform(({ value }) => value.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }).split('T').join(' ').replaceAll('/', '-'))
  createdAt: string;
}
