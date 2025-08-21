import { UseInterceptors, applyDecorators } from '@nestjs/common';
import { ExcludeFieldsInterceptor } from '../interceptor/exclude-fields.interceptor';

export function ExcludeFields(fields: string[] = ['createdAt', 'updatedAt']) {
  return applyDecorators(UseInterceptors(new ExcludeFieldsInterceptor([...new Set([...fields, 'createdAt', 'updatedAt'])])));
}
