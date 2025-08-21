import { Global, Module } from '@nestjs/common';
import { PgService } from './pg.service';
@Global()
@Module({
  providers: [PgService],
  exports: [PgService],
})
export class PrismaModule {}

/*


详细查询api教程   https://www.prisma.io/docs/orm/prisma-client/queries
根据数字字段的当前值进行更新


const updatePosts = await prisma.post.updateMany({
  data: {
    views: {
      increment: 1,
    },
    likes: {
      increment: 1,
    },
  },
})


下面是该用户 posts 关系的数量
const relationCount = await prisma.user.findMany({
  include: {
    _count: {
      select: { posts: true },
    },
  },
})

---
[
  {
    id: 1,
    name: "Alice",
    _count: { posts: 3 }
  },
  {
    id: 2,
    name: "Bob",
    _count: { posts: 1 }
  }
]



断开所有相关记录  set: []

const result = await prisma.user.update({
  where: {
    id: 16,
  },
  data: {
    posts: {
      set: [],
    },
  },
  include: {
    posts: true,
  },
})


删除所有相关记  deleteMany

const result = await prisma.user.update({
  where: {
    id: 11,
  },
  data: {
    posts: {
      deleteMany: {},
    },
  },
  include: {
    posts: true,
  },
})

更新所有相关记录  updateMany

const result = await prisma.user.update({
  where: {
    id: 6,
  },
  data: {
    posts: {
      updateMany: {
        where: {
          published: true,
        },
        data: {
          published: false,
        },
      },
    },
  },
  include: {
    posts: true,
  },
})


更新特定的相关记录   update

const result = await prisma.user.update({
  where: {
    id: 6,
  },
  data: {
    posts: {
      update: {
        where: {
          id: 9,
        },
        data: {
          title: 'My updated title',
        },
      },
    },
  },
  include: {
    posts: true,
  },
})



some 、 every 和 none   

increment 、 decrement 、 multiply   divide  set  push


特殊查询--------
aggregate: _count   _avg    _sum   _min  _max

groupBy: 
特殊查询--------



isNot  is  in  notIn  contains  startsWith  endsWith  lt  lte  gt  gte  not  and  or


AND   OR  NOT   

 where: {  content: null }     where: {  content: { not: null  }    





Fluent API  只能返回单个记录的 关联  记录数据

返回特定 User 的所有 Post 记录：

const postsByUser: Post[] = await prisma.user
  .findUnique({ where: { email: 'alice@prisma.io' } })
  .posts()

---------等价于---------------

const postsByUser = await prisma.post.findMany({
  where: {
    author: {
      email: 'alice@prisma.io',
    },
  },
})



标量列表（例如， String[] ）有一组特殊的过滤条件 - 例如，以下查询返回 tags 数组包含 databases 所有帖子：
const posts = await client.post.findMany({
  where: {
    tags: {
      has: 'databases',
    },
  },
})


如果您希望具有 null 值的记录出现在返回数组的开头，请使用 first 
const users = await prisma.user.findMany({
  orderBy: {
    updatedAt: { sort: 'asc', nulls: 'first' },
  },
})


自定义扩展字段  虽然在dto层可以处理  但也可以临时场景 快捷使用

const prisma = new PrismaClient().$extends({
  result: {
    user: {
      fullName: {
        needs: { firstName: true, lastName: true },
        compute(user) {
          return `${user.firstName} ${user.lastName}`
        },
      },
    },
  },
})



json数据查询
{
  "petName": "Claudine",
  "petType": "House cat"
}
const getUsers = await prisma.user.findMany({
  where: {
    extendedPetsData: {
      path: ['petName'],   //   深层嵌套  ['petName', 'a', 'b'  ]  相当于 对象petName.a.b
      equals: 'Claudine',   //  返回 petName 的值为 "Claudine" 的所有用户
      string_contains: 'cat',   //  值包含 "cat" 的所有用户
      array_contains: ['Claudine'],   // 数组包含
      mode: 'insensitive'    //  不区分大小写
    },
  },
})


prisma.log.create({
  data: {
    meta: Prisma.JsonNull,  //  在 Json 字段中插入 null 值
    meta2: Prisma.DbNull,   //  将数据库 NULL 插入到 Json 字段中
  },
})



 @@id(name: "likeId", [postId, userId])  复合唯一id 或复合唯一约束   查询

 const like = await prisma.like.update({
  where: {
    likeId: {
      userId: 1,
      postId: 1,
    },
  },
  data: {
    postId: 2,
  },
})



错误类型  error types

PrismaClientKnownRequestError    已知有错误代码的错误 

P1000 凭据无效  
P1001 无法访问    
P1002  超时  
P1003  数据库不存在  
P1008 操作超时  
P1009 ?  
P1010  用户被拒绝访问 
P1011  TLS 连接时出错
P1012  缺少属性或字段

查询引擎  错误
P2000   值太长
P2001  where 条件记录不存在
P2002   唯一约束失败




PrismaClientUnknownRequestError  没有错误代码的错误

PrismaClientRustPanicError    底层引擎崩溃    必须重新启动  Prisma Client
 
PrismaClientInitializationError   数据库的连接问题

PrismaClientValidationError    数据字段验证错误








*/
