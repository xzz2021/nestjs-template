export interface BuildPrismaWhereParams {
  pageIndex: number;
  pageSize: number;
  status?: string;
  dateRange?: [string, string] | string;
  [key: string]: any;
}

export const buildPrismaWhere = (params: BuildPrismaWhereParams) => {
  const { pageIndex, pageSize, status, dateRange, orderBy, ...rest } = params;
  const skip = (Number(pageIndex) - 1) * Number(pageSize);
  const take = Number(pageSize);
  const where: any = { status: status ?? undefined };
  if (dateRange) {
    let newRange;
    if (typeof dateRange === 'string') {
      newRange = JSON.parse(dateRange);
    } else {
      newRange = dateRange;
    }
    const [start, end] = newRange as [string, string];
    where.createdAt = {
      gte: new Date(start),
      lte: new Date(end),
    };
  }
  if (Object.keys(rest).length === 0) {
    return { where, skip, take };
  }
  const newWhere = Object.entries(rest).reduce(
    (acc, [key, value]) => {
      if (value) {
        acc[key] = { contains: value };
      }
      return acc;
    },
    {} as Record<string, any>,
  );
  return { where: { ...where, ...newWhere }, skip, take, orderBy: orderBy ?? undefined };
};
