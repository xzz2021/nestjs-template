import { PrismaClientKnownRequestError, PrismaClientUnknownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';

export const checkPrismaError = (exception: any) => {
  // 处理已知的 Prisma 错误
  if (exception instanceof PrismaClientKnownRequestError) {
    console.log('🚀 ~ checkPrismaError ~ 检测到 PrismaClientKnownRequestError');
    switch (exception.code) {
      case 'P2002':
        return { msg: '数据已存在或复合主键冲突', meta: exception.message };
      case 'P2025':
        return { msg: '当前id记录未找到', meta: exception.message };
      case 'P2003':
        return { msg: '外键约束失败', meta: exception.message };
      case 'P2014':
        return { msg: '关系约束失败', meta: exception.message };
      default:
        return { msg: `数据库操作失败: ${exception.code}`, meta: exception.message };
    }
  }

  // 处理未知的 Prisma 错误
  if (exception instanceof PrismaClientUnknownRequestError) {
    console.log('🚀 ~ checkPrismaError ~ 检测到 PrismaClientUnknownRequestError');
    return { msg: '未知的数据库错误', meta: exception.message };
  }

  // 处理 Prisma 验证错误
  if (exception instanceof PrismaClientValidationError) {
    console.log('🚀 ~ checkPrismaError ~ 检测到 PrismaClientValidationError');
    return { msg: '数据验证失败', meta: exception.message };
  }

  // 如果异常有 code 属性但类型检查失败，尝试手动处理
  if (exception?.code && typeof exception.code === 'string') {
    switch (exception.code) {
      case 'P2002':
        return { msg: '数据已存在或复合主键冲突', meta: exception.message || exception.toString() };
      case 'P2025':
        return { msg: '当前id记录未找到', meta: exception.message || exception.toString() };
      case 'P2003':
        return { msg: '外键约束失败', meta: exception.message || exception.toString() };
      case 'P2014':
        return { msg: '关系约束失败', meta: exception.message || exception.toString() };
      default:
        return { msg: `数据库操作失败: ${exception.code}`, meta: exception.message || exception.toString() };
    }
  }

  // console.log('🚀 ~ checkPrismaError ~ 未检测到 Prisma 错误');
  return null;
};
