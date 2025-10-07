// common/decorators/casl.decorator.ts
import { SetMetadata } from '@nestjs/common';
// import { Action } from '@/casl/ability.factory';
import { Subjects } from '@casl/prisma';
export const CHECK_POLICIES_KEY = 'check_policy';

export interface PolicyMeta {
  // action: Action;
  action: any;

  subject: Subjects<any>;
  conditions?: Record<string, any>;
}
export const CheckPolicies = (meta: PolicyMeta) => SetMetadata(CHECK_POLICIES_KEY, meta);
