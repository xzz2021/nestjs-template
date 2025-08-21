/**
 * 通用查询参数接口，用于处理API请求中的查询参数
 */

/**
 * 处理查询参数并返回适用于Prisma的查询对象
 *
 * @param queryParams - 来自API请求的查询参数
 * @returns [查询参数对象, 计数查询参数对象]
 */
type sortOrder = 'asc' | 'desc';

export interface IQueryParams {
  where?: Record<string, any>;
  pageIndex: number | string;
  pageSize: number | string;
  dateRange?: Date[] | string;
  include?: Record<string, any>;
  orderBy?: { [key: string]: sortOrder };
  distinct?: string[];
  by?: string[];
  having?: Record<string, any>;
  select?: Record<string, any>;
  [key: string]: any;
}

export const joinQueryWithPage = (queryParams: IQueryParams): { queryParams: Record<string, any>; totalQueryParams: Record<string, any> } => {
  if (!queryParams) return { queryParams: {}, totalQueryParams: {} };

  const { pageSize, pageIndex, dateRange, orderBy = { createdAt: 'desc' }, include, distinct, where = {}, select, by, having, ...rest } = queryParams;

  // ✅ 处理 where 条件，包括模糊匹配
  const whereCondition: Record<string, any> = where;
  for (const [key, value] of Object.entries(rest)) {
    if (key === 'id' && (value == null || value < 1)) continue;
    whereCondition[key] = {
      contains: value,
      mode: 'insensitive',
    };
  }

  // ✅ 处理日期范围过滤
  if (dateRange) {
    let range: Date[] = [];

    if (typeof dateRange === 'string') {
      try {
        range = JSON.parse(dateRange);
      } catch (e) {
        console.warn('Invalid dateRange string. Using default 30-day range.', e);
      }
    } else if (Array.isArray(dateRange)) {
      range = dateRange;
    }

    if (!range || range.length !== 2) {
      range = [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()];
    }

    whereCondition.createdAt = {
      gte: new Date(range[0]),
      lte: new Date(range[1]),
    };
  }

  // ✅ 构建 Prisma 查询参数
  const prismaQuery: Record<string, any> = {
    ...(pageSize && pageIndex ? { skip: (Number(pageIndex) - 1) * Number(pageSize), take: Number(pageSize) } : {}),
    orderBy,
    ...(include && { include }),
    ...(distinct && { distinct }),
    ...(by && { by }),
    ...(having && { having }),
    ...(select && { select }),
  };

  if (Object.keys(whereCondition).length > 0) {
    prismaQuery.where = whereCondition;
  }

  const totalQueryParams = {
    where: prismaQuery.where,
  };

  return {
    queryParams: prismaQuery,
    totalQueryParams,
  };
};

/**
 * 辅助函数：处理查询并返回分页结果
 *
 * @param model - Prisma模型
 * @param queryParams - 查询参数
 * @param successMessage - 成功消息
 * @param errorMessage - 错误消息
 * @returns 包含列表、总数和状态的结果对象
 */

/**
 * Prisma查询结果
 */
export interface IPrismaQueryResult<T = any> {
  code: number;
  list: T[];
  total: number;
  message: string;
  error?: string;
}
export const executePagedQuery = async <T>(
  model: { findMany: (params: any) => Promise<T[]>; count: (params: any) => Promise<number> },
  queryParams: IQueryParams | null,
  keyMessage = '列表',
): Promise<IPrismaQueryResult<T>> => {
  const start = Date.now();
  try {
    let list: T[] = [];
    let total = 0;

    const { queryParams: prismaParams = {}, totalQueryParams = {} } = queryParams ? joinQueryWithPage(queryParams) : { queryParams: {}, totalQueryParams: {} };

    // 使用 Promise.all 并发查询列表与总数
    [list, total] = await Promise.all([model.findMany(prismaParams), model.count(totalQueryParams)]);

    const end = Date.now();
    console.log(`查询数据库耗时: ${end - start}ms`);
    return {
      code: 200,
      list,
      total,
      message: `获取${keyMessage}列表成功`,
    };
  } catch (error: any) {
    return {
      code: 400,
      list: [],
      total: 0,
      message: `获取${keyMessage}列表失败`,
      error: error?.message || String(error),
    };
  }
};

// 获取嵌套 结果 [{aa:{}}, {aa:{}}]   变成 [aa, aa]
export const executePagedQuery2 = async <T>(model: any, queryParams: IQueryParams, keyMessage = '列表', keyName: string): Promise<IPrismaQueryResult<T>> => {
  const { queryParams: joinQueryParams, totalQueryParams } = joinQueryWithPage(queryParams);
  try {
    const [list, total] = await Promise.all([model.findMany(joinQueryParams), model.count(totalQueryParams)]);

    return {
      code: 200,
      list: list.map((item: any) => item[keyName]),
      total,
      message: '获取' + keyMessage + '列表成功',
    };
  } catch (error) {
    console.error('Failed to execute paged query:', error);
    return {
      code: 400,
      list: [],
      total: 0,
      message: `获取${keyMessage}列表失败`,
      error: error.message,
    };
  }
};
