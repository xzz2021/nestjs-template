import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@/processor/decorator/public.decorator';
import { DeleteEntryDto, UpsertEntryDto } from './dto/entry.dto';
import { DeleteDictionaryDto, DictionaryListDto, DictionarySeedArrayDto, UpsertDictionaryDto } from './dto/dictionary.dto';

// 此模块可以作为范本
@ApiTags('字典')
@Controller('dictionary')
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @Get('list')
  @Public()
  @ApiOperation({ summary: '获取字典列表' })
  @ApiResponse({ type: DictionaryListDto, isArray: true })
  findAll() {
    return this.dictionaryService.findAll();
  }

  @Post('upsert')
  @ApiOperation({ summary: '创建或更新字典' })
  upsertDictionary(@Body() upsertDictionaryDto: UpsertDictionaryDto) {
    return this.dictionaryService.upsertDictionary(upsertDictionaryDto);
  }

  @Delete('delete')
  @ApiOperation({ summary: '批量删除字典' })
  delete(@Body() obj: DeleteDictionaryDto) {
    return this.dictionaryService.batchRemove(obj.ids);
  }

  @Post('entry/upsert')
  @ApiOperation({ summary: '创建字典项' })
  createEntry(@Body() upsertEntryData: UpsertEntryDto) {
    return this.dictionaryService.upsertEntry(upsertEntryData);
  }

  @Delete('entry/delete')
  @ApiOperation({ summary: '批量删除字典项' })
  deleteEntry(@Body() deleteEntryData: DeleteEntryDto) {
    return this.dictionaryService.batchRemoveEntry(deleteEntryData.ids);
  }

  @Post('generateDictionarySeed')
  @ApiOperation({ summary: '生成字典种子数据' })
  /*  如果是数组  一定要用一个类包裹  否则不会进行校验过滤
                 也可以手动转换   未实测
  const dto = plainToInstance(DictionarySeedDto, data, {
  });
  */
  generateDictionarySeed(@Body() data: DictionarySeedArrayDto) {
    return this.dictionaryService.generateDictionarySeed(data);
  }
}
