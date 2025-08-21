// import { Injectable } from '@nestjs/common';
// import { AbilityBuilder, PureAbility } from '@casl/ability';
// //  未验证 @casl/prisma 2.0.0-alpha.3 版本 可以使用PrismaAbility  进行条件匹配
// import { Subjects } from '@casl/prisma';
// import { createPrismaAbility, PrismaQuery } from '@/prisma/pg.casl.prisma';
// import { User } from '@/prisma/client/postgresql';
// import { WhereInput } from '@/prisma/pg.casl.adapter'; // 手写导入方案一
// // import { PrismaClient } from '@/prisma/client/postgresql';  // 自动推导 方案二
// export interface IUser extends User {
//   roles: { code: string; id: number }[];
// }
// export type Action = 'manage' | 'create' | 'read' | 'update' | 'delete';

// // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
// export type AppAbility = PureAbility<[string, 'all' | Subjects<WhereInput<any>>], PrismaQuery>; // 手写导入方案一

// // 作为全局使用的ability  此处可以尽可能多的定义  能力

// /*
// // 自动推导 方案二
// type PrismaModels = typeof PrismaClient;

// type StringModelKeys = Extract<keyof PrismaModels, string>;

// type CleanModelInstances = {
//   [K in StringModelKeys as K extends `$` | `on` | `use` ? never : K]: PrismaModels[K] extends {
//     findMany(args: { where: infer W }): any;
//   }
//     ? W
//     : never;
// };

// export type AppAbility = PureAbility<[string, 'all' | Subjects<CleanModelInstances>], PrismaQuery>;

// */
// @Injectable()
// export class CaslAbilityFactory {
//   createForUser(user: IUser): AppAbility {
//     const { can, cannot, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
//     if (user.roles.some((role: { code: string }) => role.code === 'ADMIN')) {
//       // can('manage', 'all');
//       can('manage', 'Department');
//       can('manage', 'OrderInfo');
//     } else {
//       // 帖子规则
//       can('read', 'OrderInfo', { isDeleted: true });

//       // 部门规则
//       can('read', 'Department');
//       // 普通用户只能更新 status 为 true 的部门
//       can('update', 'Department');
//       cannot('update', 'Department', { status: false }).because('普通用户无法更新 status 为 false 的部门');
//     }

//     /*
//     定义action别名  将 resolveAction 传入build 中即可
//     const resolveAction = createAliasResolver({
//   modify: ['update', 'delete'],
//   access: ['read', 'modify'] // 别名的别名
// });

//     */
//     return build({
//       //   可以用于获得普通类的构造函数  检测转换为  subject types
//       // detectSubjectType: object => object.constructor as ExtractSubjectType<Subjects>
//     });
//   }
// }

// /*
//       能力定义示范
//       // can(['update', 'delete'], 'OrderInfo', { userId: user.id });
//       // cannot('delete', 'OrderInfo', { isDeleted: true });
//       can(['read', 'update'], ['Post', 'Comment']);

// 允许只读取 createdAt 在过去的文章
// const today = new Date().setHours(0, 0, 0, 0);
// can('read', 'Article', { createdAt: { $lte: today } })

// 允许只读取 status 为 review 或 published 的文章
// can('read', 'Article', { status: { $in: ['review', 'published'] } })

// The list of operators:
// $eq 和 $ne  等于 和  不等于
// $lt 和 $lte  小于 和  小于等于
// $gt 和 $gte  大于 和  大于等于
// $in 和 $nin  包含 和  不包含
// $all  所有
// $size  大小
// $regex  正则
// $exists  存在

// 数组判断:  文章分类属于'javascript'和'acl'   故返回true
// import { defineAbility } from '@casl/ability';

// const ability = defineAbility((can) => {
//   can('read', 'Article', { categories: 'javascript' });
// });

// class Article {
//   constructor(title, categories) {
//     this.title = title;
//     this.categories = categories;
//   }
// }

// const article = new Article('CASL', ['javascript', 'acl']);
// console.log(ability.can('read', article)); // true

// 匹配嵌套属性值

// import { defineAbility } from '@casl/ability';

// const ability = defineAbility((can) => {
//   can('read', 'Address', { 'country.isoCode': 'UA' });
// });

// class Address {
//   constructor(isoCode, name) {
//     this.country = {
//       isoCode: isoCode,
//       name: name,
//     }
//   }
// }

// const address = new Address('UA', 'Ukraine');
// console.log(ability.can('read', address)); // true

// 匹配嵌套  数组数组数组  属性的多个属性:
// import { defineAbility } from '@casl/ability';

// const user = { id: 1 };
// const ability = defineAbility((can) => {
//   can('update', 'WishlistItem', {
//     sharedWith: {
//       $elemMatch: { permission: 'update', userId: user.id }
//     }
//   });
// });

// class WishlistItem {
//   constructor(title, sharedWith) {
//     this.title = title;
//     this.sharedWith = sharedWith;
//   }
// }

// const wishlistItem = new WishlistItem('CASL in Action', [
//   { permission: 'read', userId: 2 },
//   { permission: 'update', userId: 1 },
// ]);
// ability.can('update', wishlistItem); // true

// 权限提取

//       */
