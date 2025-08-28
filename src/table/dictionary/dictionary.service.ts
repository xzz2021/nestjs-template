import { Injectable } from '@nestjs/common';
import { PgService } from '@/prisma/pg.service';
@Injectable()
export class DictionaryService {
  constructor(private readonly pgService: PgService) {}
  async create(createdictionaryDto: any) {
    const createStatement = {
      data: createdictionaryDto,
      select: { id: true },
    };
    try {
      const res = await this.pgService.dictionary.create(createStatement);
      if (res?.id) return { code: 200, id: res.id, message: '新增字典成功' };
    } catch (error) {
      console.log('🚀 ~ xzz: dictionaryService -> create -> error', error);
      return { code: 400, error: error.message };
    }
  }

  async update(updatedictionaryDto: any) {
    const { id, ...updateData } = updatedictionaryDto;
    const updateStatement = {
      where: { id },
      data: updateData,
    };
    try {
      const res = await this.pgService.dictionary.update(updateStatement);
      if (res?.id) return { code: 200, id: res.id, message: '更新字典成功' };
    } catch (error) {
      console.log('🚀 ~ xzz:=======================e -> create -> error', error.message);
      return { code: 400, error: error.message };
    }
  }

  findBy(searchParam: any) {
    const newSearchParam = {
      include: {
        entries: true,
      },
      ...searchParam,
    };
    return [];
  }

  async batchRemove(idList: number[]) {
    try {
      const res = await this.pgService.dictionary.deleteMany({
        where: { id: { in: idList } },
      });
      if (res?.count) return { code: 200, count: res.count, message: '删除字典成功' };
    } catch (error) {
      console.log('🚀 ~ xzz: dictionaryService -> batchRemove -> error', error);
      return { code: 400, error: error.message };
    }
  }

  async getMap() {
    //  此处需要返回所有字典映射
    try {
      const queryBuilder = {
        select: {
          id: true,
          name: true,
          code: true,
          description: true,
          include: {
            entries: {
              // omit: {   // 排除指定字段
              //   isDeleted: true,
              // },
              select: {
                id: true,
                key: true,
                value: true,
                sort: true,
              },
            },
          },
        },
      };
      const dictionary = await this.pgService.dictionary.findMany(queryBuilder);
      return { code: 200, list: dictionary, message: '获取字典类别列表成功' };
    } catch (error) {
      console.log('🚀 ~ xzz: dictionaryService -> getMap -> error', error);
      return { code: 400, error: error.message };
    }
  }

  async upsertDictionary(createdictionaryDto: any) {
    const { id, ...rest } = createdictionaryDto;
    try {
      let result;
      if (id) {
        result = await this.pgService.dictionary.update({
          where: { id },
          data: rest,
          select: { id: true },
        });
      } else {
        result = await this.pgService.dictionary.create({
          data: rest,
          select: { id: true },
        });
      }
      if (result?.id) return { code: 200, id: result.id, message: (id ? '更新' : '新增') + '字典成功' };
    } catch (error) {
      console.log('🚀 ~ xzz: dictionaryService -> upsertDictionary -> error', error);
      return { code: 400, error: error.message };
    }
  }
  //  字典项管理
  async upsertEntry(createdictionaryDto: any) {
    const { id, dictionaryId, ...rest } = createdictionaryDto;
    console.log('🚀 ~ DictionaryService ~ upsertEntry ~ rest:', rest);
    if (!dictionaryId) {
      return { code: 400, message: '父级字典项不能为空' };
    }

    let result;
    if (id && id > 0) {
      result = await this.pgService.dictionaryEntry.update({
        where: { id },
        data: { ...rest },
        select: { id: true },
      });
    } else {
      result = await this.pgService.dictionaryEntry.create({
        data: { ...rest, dictionary: { connect: { id: dictionaryId } } },
        select: { id: true },
      });
    }
    if (result?.id) return { code: 200, id: result.id, message: (id ? '更新' : '新增') + '字典项成功' };
  }

  async batchRemoveEntry(idList: number[]) {
    try {
      const res = await this.pgService.dictionaryEntry.deleteMany({
        where: { id: { in: idList } },
      });
      if (res?.count) return { code: 200, count: res.count, message: '删除字典项成功' };
    } catch (error) {
      console.log('🚀 ~ xzz: dictionaryService -> batchRemoveEntry -> error', error);
      return { code: 400, error: error.message };
    }
  }

  findEntryBy(searchParam: any) {
    const { dictionaryId, ...rest } = searchParam;
    // 自包含字典项 查询时 自动生成children数据

    const newSearchParam = {
      where: {
        dictionaryId: Number(dictionaryId),
      },
      ...rest,
    };
    return [];
  }

  async findAll() {
    try {
      const res = await this.pgService.dictionary.findMany({
        include: {
          entries: {
            orderBy: {
              sort: 'asc',
            },
          },
        },
      });
      return { code: 200, list: res, message: '获取所有字典列表成功' };
    } catch (error) {
      console.log('🚀 ~ xzz: dictionaryService -> getAll -> error', error);
      return { code: 400, error: error.message };
    }
  }
}
