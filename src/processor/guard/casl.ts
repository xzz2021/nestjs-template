// import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { CHECK_POLICIES_KEY, PolicyMeta } from '@/processor/decorator/casl.decorator';
// import { CaslAbilityFactory, IUser } from '@/casl/ability.factory';
// import { IS_PUBLIC_KEY } from '../decorator/public.decorator';
// import { PgService } from '@/prisma/pg.service';
// import { subject } from '@casl/ability';

// @Injectable()
// export class PoliciesGuard implements CanActivate {
//   constructor(
//     private reflector: Reflector,
//     private caslFactory: CaslAbilityFactory,
//     private pgService: PgService,
//   ) {}

//   async canActivate(ctx: ExecutionContext): Promise<boolean> {
//     const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [ctx.getHandler(), ctx.getClass()]);
//     if (isPublic) return true;

//     const handler = this.reflector.get<PolicyMeta>(CHECK_POLICIES_KEY, ctx.getHandler());
//     if (!handler) return true;
//     const req = ctx.switchToHttp().getRequest<Request & { user: IUser }>();
//     const user: IUser = req.user;
//     if (!user) {
//       throw new ForbiddenException('请先登录');
//     }

//     if (user.roles.some(role => role.code === 'ADMIN')) {
//       return true; // 管理员直接放行
//     }
//     const ability = this.caslFactory.createForUser(user);
//     /*
//     更新拥有的能力
//     ability.update([]); // forbids everything
// ability.update([ // switch to readonly mode
//   { action: 'read', subject: 'all' }
// ]);

// const { can, rules } = new AbilityBuilder(createMongoAbility);
// can('read', 'all');

// ability.update(rules);

// */
//     const { action, subject: subjectName } = handler;

//     let newSubject = subjectName;
//     const operateId = this.extractOperateId(req);
//     if (operateId) {
//       const currentInstance = await this.pgService[subjectName.toLowerCase()].findFirst({
//         where: { id: operateId },
//       });
//       // if (!currentInstance) return false;
//       if (!currentInstance) {
//         throw new ForbiddenException('数据库资源不存在, 检查实体subject参数或id是否存在!');
//       }
//       newSubject = currentInstance;
//     }

//     //   subjectInstance  准确定义 是 subject types
//     const subjectInstance = typeof newSubject === 'string' ? newSubject : subject(subjectName, newSubject);

//     //  prisma返回的是一个普通的 JavaScript 对象（plain object），并不是一个“类实例”或“实体对象”——这是 Prisma 的默认行为
//     //  所以需要subject(subjectName, newSubject) 来转换成一个“类实例”或“实体对象”
//     const allowed = ability.can(action, subjectInstance);

//     if (!allowed) {
//       throw new ForbiddenException('没有权限操作此资源');
//     }
//     return true;
//   }

//   private extractOperateId(request: any): number | undefined {
//     // 优先级：params > body > query（如有需要）
//     return Number(request.params?.id) || Number(request.body?.id) || Number(request.query?.id) || undefined;
//   }
// }

// //   后期  可扩展为多个策略支持
