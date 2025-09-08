import { ApiProperty } from '@nestjs/swagger';

const RESPONSE_SUCCESS_CODE = 200;
const RESPONSE_SUCCESS_MSG = 'success';
export class ResOp<T = any> {
  @ApiProperty({ type: 'object', additionalProperties: true })
  data?: T;

  @ApiProperty({ type: 'number', default: RESPONSE_SUCCESS_CODE })
  code: number;

  @ApiProperty({ type: 'string', default: RESPONSE_SUCCESS_MSG })
  message: string;

  constructor(code: number, data: T, message = RESPONSE_SUCCESS_MSG) {
    this.code = code;
    this.data = data;
    this.message = message;
  }

  static success<T>(data?: T, message?: string) {
    return new ResOp(RESPONSE_SUCCESS_CODE, data, message);
  }

  static error(code: number, message: string) {
    return new ResOp(code, {}, message);
  }
}

export class TreeResult<T> {
  @ApiProperty()
  id: number;

  @ApiProperty()
  parentId: number;

  @ApiProperty()
  children?: TreeResult<T>[];
}
