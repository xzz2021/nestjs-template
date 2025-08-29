import { Injectable } from '@nestjs/common';
import { PgService } from '@/prisma/pg.service';
import { DictionarySeedArrayDto, DictionarySeedDto, UpsertDictionaryDto } from './dto/dictionary.dto';
import { UpsertEntryDto } from './dto/entry.dto';
@Injectable()
export class DictionaryService {
  constructor(private readonly pgService: PgService) {}

  async batchRemove(ids: number[]) {
    // const ids = data.ids.map(Number);
    const res = await this.pgService.dictionary.deleteMany({ where: { id: { in: ids } } });
    const count = res?.count || 0;
    if (count > 0 && count === ids.length) return { count, message: '删除字典成功' };
    return { count, message: '删除字典部分失败' };
  }

  async getMap() {
    //  此处需要返回所有字典映射

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
    return { list: dictionary, message: '获取字典类别列表成功' };
  }

  async upsertDictionary(upsertDictionaryDto: UpsertDictionaryDto) {
    const { id, ...rest } = upsertDictionaryDto;

    const result = await this.pgService.dictionary.upsert({
      where: { id: id || 0 },
      update: { ...rest },
      create: { ...rest },
      select: { id: true },
    });

    return { id: result.id, message: (id ? '更新' : '新增') + '字典成功' };
  }
  //  字典项管理
  async upsertEntry(createdictionaryDto: UpsertEntryDto) {
    const { id, dictionaryId, ...rest } = createdictionaryDto;
    if (!dictionaryId) {
      return { code: 400, message: '父级字典项不能为空' };
    }

    const result = await this.pgService.dictionaryEntry.upsert({
      where: { id: id || 0 },
      update: { ...rest },
      create: {
        ...rest,
        dictionary: { connect: { id: dictionaryId } },
      },
      select: { id: true },
    });

    const action = id ? '更新' : '新增';
    return {
      id: result.id,
      message: `${action}字典项成功`,
    };
  }

  async batchRemoveEntry(ids: number[]) {
    const res = await this.pgService.dictionaryEntry.deleteMany({
      where: { id: { in: ids } },
    });
    const count = res?.count || 0;
    if (count > 0 && count === ids.length) return { count, message: '删除字典项成功' };
    return { count, message: '删除字典项部分失败' };
  }

  async findAll() {
    try {
      const res = await this.pgService.dictionary.findMany({
        select: {
          id: true,
          name: true,
          code: true,
          sort: true,
          status: true,
          description: true,
          entries: {
            orderBy: {
              sort: 'asc',
            },
          },
        },
        orderBy: {
          sort: 'asc',
        },
      });
      return { list: res, message: '获取所有字典列表成功' };
    } catch (error) {
      console.log('🚀 ~ xzz: dictionaryService -> getAll -> error', error);
      return { code: 400, error: error.message };
    }
  }

  async generateDictionarySeed(data: DictionarySeedArrayDto) {
    await this.pgService.$transaction(async tx => {
      for (const dict of data.data) {
        const { code, entries, ...rest } = dict;
        const dictionary = await tx.dictionary.upsert({
          where: { code: dict.code },
          create: {
            code: dict.code,
            ...rest,
          },
          update: {
            ...rest,
          },
        });
        for (const e of dict.entries ?? []) {
          await tx.dictionaryEntry.upsert({
            where: { code_dictionaryId: { code: e.code, dictionaryId: dictionary.id } },
            create: {
              ...e,
              dictionary: { connect: { id: dictionary.id } },
            },
            update: {
              ...e,
              dictionary: { connect: { id: dictionary.id } },
            },
          });
        }
      }
    });

    return { message: '新增字典成功', success: true };
  }
}
