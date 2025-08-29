import { Body, Controller, Get, Post } from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '@/processor/decorator/public.decorator';
import { DeleteEntryDto, UpsertEntryDto } from './dto/entry.dto';
import { DeleteDictionaryDto, DictionarySeedArrayDto, DictionarySeedDto, UpsertDictionaryDto } from './dto/dictionary.dto';

// 此模块可以作为范本
@ApiTags('字典')
@Controller('dictionary')
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @Get('list')
  @Public()
  @ApiOperation({ summary: '获取字典列表' })
  findAll() {
    return this.dictionaryService.findAll();
  }

  @Post('upsert')
  @ApiOperation({ summary: '创建或更新字典' })
  upsertDictionary(@Body() upsertDictionaryDto: UpsertDictionaryDto) {
    return this.dictionaryService.upsertDictionary(upsertDictionaryDto);
  }

  @Post('delete')
  @ApiOperation({ summary: '删除字典' })
  delete(@Body() obj: DeleteDictionaryDto) {
    return this.dictionaryService.batchRemove(obj.ids);
  }

  @Post('entry/upsert')
  @ApiOperation({ summary: '创建字典项' })
  createEntry(@Body() upsertEntryDto: UpsertEntryDto) {
    return this.dictionaryService.upsertEntry(upsertEntryDto);
  }

  @Post('entry/delete')
  @ApiOperation({ summary: '删除字典项' })
  deleteEntry(@Body() obj: DeleteEntryDto) {
    return this.dictionaryService.batchRemoveEntry(obj.ids);
  }

  @Post('generateDictionarySeed')
  @ApiOperation({ summary: '生成字典种子数据' })
  //  如果是数组  一定要用一个类包裹  否则不会进行校验过滤
  generateDictionarySeed(@Body() data: DictionarySeedArrayDto) {
    return this.dictionaryService.generateDictionarySeed(data);
  }
}
