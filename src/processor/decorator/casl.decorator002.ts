// // common/decorators/casl.decorator.ts
// import { SetMetadata } from '@nestjs/common';
// import { Action, AppAbility } from '@/casl/ability.factory';
// import { Subjects } from '@casl/prisma';
// export const CHECK_POLICIES_KEY = 'check_policy';

// export interface PolicyMeta {
//   action: Action;
//   subject: Subjects<any>;
//   conditions?: Record<string, any>;
// }
// export type PolicyHandler = (ability: AppAbility, subject?: any) => boolean;

// export type PolicyParam = PolicyMeta | PolicyHandler;

// export const CheckPolicies = (...meta: PolicyParam[]) => SetMetadata(CHECK_POLICIES_KEY, meta);
