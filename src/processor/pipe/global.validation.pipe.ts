import { ValidationPipe, BadRequestException, ValidationError, UnprocessableEntityException } from '@nestjs/common';

// 错误消息映射表
const ERROR_MAP = new Map([
  // 基础类型验证
  ['must be a string', '必须是字符串'],
  ['must be a number', '必须是数字'],
  ['must be an array', '必须是数组'],
  ['must be an object', '必须是对象'],
  ['must be a boolean value', '必须是布尔值'],
  ['must be an integer', '必须是整数'],

  // 空值验证
  ['should not be empty', '不能为空'],
  ['must not be empty', '不能为空'],

  // 格式验证
  ['is not a valid email', '邮箱格式不正确'],
  ['is not a valid URL', 'URL格式不正确'],
  ['is not a valid UUID', 'UUID格式不正确'],
  ['is not a valid IP address', 'IP地址格式不正确'],
  ['is not a valid MAC address', 'MAC地址格式不正确'],
  ['is not a valid date', '日期格式不正确'],
  ['is not a valid time', '时间格式不正确'],
  ['is not a valid datetime', '日期时间格式不正确'],

  // 数值范围验证
  ['must be greater than', '必须大于'],
  ['must be less than', '必须小于'],
  ['must be greater than or equal to', '必须大于等于'],
  ['must be less than or equal to', '必须小于等于'],

  // 长度验证
  ['must be longer than', '长度必须大于'],
  ['must be shorter than', '长度必须小于'],
  ['must be exactly', '长度必须等于'],

  // 正则验证
  ['must match', '格式不正确'],

  // 枚举验证
  ['must be one of the following values', '必须是以下值之一'],

  // 嵌套对象验证
  ['nested property', '嵌套属性'],

  // 数组验证
  ['each value in', '数组中的每个值'],
  ['array must contain at least', '数组至少包含'],
  ['array must contain no more than', '数组最多包含'],
  ['conforming to the specified constraints', '才符合指定约束'],
]);

//  全局类转换校验
export const GLOBAL_VALIDATION_PIPE = new ValidationPipe({
  transform: true, // 自动 将原始数据   转换为 dto 定义的数据 类型  (路径参数和查询参数默认都以 string 通过网络传输; 例如params中的数字都是字符串, 省去手动转换的麻烦)
  whitelist: true, // 过滤掉未知属性
  // forbidNonWhitelisted: true, // 拒绝传入不在 DTO 中的字段
  // 加上这两个才能看到详细错误
  enableDebugMessages: true,
  exceptionFactory: (errors: ValidationError[]) => {
    // console.log('errors', JSON.stringify(errors));

    // const err = errors[errors.length - 1].constraints || {};
    // console.log('err: ', JSON.stringify(err));

    // const errMsg = Object.values(err)[0] || 'DTO校验失败: 数据类型不合法';

    // 使用 Map 进行错误消息转换
    const cnErrMsg = errors.map(e => {
      const rule = Object.keys(e.constraints!)[0];
      const msg = e.constraints![rule];
      return msg || 'DTO校验失败: 数据类型不合法';
    })[0];
    // for (const [key, value] of ERROR_MAP) {
    //   if (cnErrMsg.includes(key)) {
    //     cnErrMsg = cnErrMsg.replace(key, value);
    //   }
    // }

    // return new BadRequestException(cnErrMsg);
    return new UnprocessableEntityException(cnErrMsg);
  },
});
