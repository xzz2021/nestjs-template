import { Injectable, PipeTransform } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsBoolean, IsDate, IsNumber, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { formatDateToYMDHMS } from '../utils/date';

// 校验规则  需传入给 Validate装饰器  作为形参
@ValidatorConstraint({ name: 'IsIdNotEqualToParentId', async: false })
export class IsIdNotEqualToParentIdConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const object = args.object as any;
    if (!object.id) return true;
    return object.id !== object.parentId;
  }

  defaultMessage(_args: ValidationArguments) {
    return 'id 和 parentId 不能相同';
  }
}

// 转换remark为null {remark: null, aa: 6755}
@Injectable()
export class TransformKeyPipe implements PipeTransform {
  constructor(private readonly keyName: string) {}
  transform(value: any) {
    if (!value) return;
    if (this.keyName) {
      //  dynamicValue 直接拿到当前key 的  值   dynamicValue = value[this.keyName]
      const { [this.keyName]: dynamicValue = null, ...rest } = value;
      return { [this.keyName]: dynamicValue, ...rest };
    }
    return value;
  }
}

// 限定布尔值 如果可以就将字符串转换为布尔值  否则返回原始值
export const IsBooleanWithTransform = () => {
  return (target: object, propertyKey: string) => {
    Transform(item => (['true', 'false'].includes(item.value as string) ? item.value == 'true' : item.value))(target, propertyKey);
    IsBoolean()(target, propertyKey);
  };
};

export const IsNumberWithTransform = () => {
  return (target: object, propertyKey: string) => {
    Transform(item => Number(item.value))(target, propertyKey);
    IsNumber()(target, propertyKey);
  };
};

export const IsDateWithTransform = () => {
  return (target: object, propertyKey: string) => {
    Transform(({ value }: { value: string }) => formatDateToYMDHMS(value))(target, propertyKey);
    IsDate()(target, propertyKey);
  };
};
