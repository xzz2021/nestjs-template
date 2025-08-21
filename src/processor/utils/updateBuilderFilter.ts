//  此模块用于过滤掉更新时不需要的参数

export const updateBuilderFilter = (data: any, filterFields: string[]) => {
  const { id, updatedAt, createdAt, deleted, deleteAt, ...rest } = data;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const filteredData = Object.fromEntries(Object.entries(rest).filter(([key]) => !filterFields.includes(key)));
  return filteredData;
};
