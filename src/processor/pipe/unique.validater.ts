import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

// 检测重复值  抛出错误
export function IsUniqueArray(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isUniqueArray',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any[]) {
          if (!Array.isArray(value)) return false;
          return new Set(value).size === value.length;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} 数组中有重复值`;
        },
      },
    });
  };
}
