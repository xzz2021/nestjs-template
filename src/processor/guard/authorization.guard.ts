// import { Injectable, CanActivate, ExecutionContext, HttpStatus } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import * as SYS_MSG from '@shared/constants/SystemMessages';
// import { CustomHttpException } from '@shared/helpers/custom-http-filter';

// @Injectable()
// export class OwnershipGuard implements CanActivate {
//   constructor(private reflector: Reflector) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const userId = request.user.sub;
//     const organisationId = request.params.orgId || request.params.org_id || request.params.id;

//     const adminUserRole = await this.organisationMembersRole.find({ where: { userId }, relations: ['role'] });
//     if (adminUserRole.length) {
//       const roles = adminUserRole.map(instance => instance.role.name);
//       if (roles.includes('super-admin')) {
//         return true;
//       }
//     }

//     if (!organisationId) {
//       throw new CustomHttpException('Invalid Organisation', HttpStatus.BAD_REQUEST);
//     }
//     const organisation = await this.organisationRepository.findOne({
//       where: { id: organisationId },
//       relations: ['owner'],
//     });

//     if (!organisation) {
//       throw new CustomHttpException(SYS_MSG.ORG_NOT_FOUND, HttpStatus.NOT_FOUND);
//     }

//     if (organisation.owner.id === userId) {
//       return true;
//     }
//     throw new CustomHttpException(SYS_MSG.NOT_ORG_OWNER, HttpStatus.FORBIDDEN);
//   }
// }
