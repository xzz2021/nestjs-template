import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '@/processor/decorator/public.decorator';
@ApiTags('字典')
@Controller('dictionary')
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @Post('delete')
  @ApiOperation({ summary: '删除字典' })
  delete(@Body() obj: { ids: string[] }) {
    const { ids } = obj;
    if (!Array.isArray(ids)) return { code: 400, message: '参数不合法' };
    const idList = ids.map(item => Number(item));
    return this.dictionaryService.batchRemove(idList);
  }

  @Get('list')
  @ApiOperation({ summary: '获取字典列表' })
  findBy(@Query() joinQueryParams: any) {
    return [];
  }

  @Post('upsert')
  @ApiOperation({ summary: '创建或更新字典' })
  upsertDictionary(@Body() createDepartmentDto: any) {
    return this.dictionaryService.upsertDictionary(createDepartmentDto);
  }

  @Post('entry/upsert')
  @ApiOperation({ summary: '创建字典项' })
  createEntry(@Body() createDepartmentDto: any) {
    return this.dictionaryService.upsertEntry(createDepartmentDto);
  }

  @Post('entry/delete')
  @ApiOperation({ summary: '删除字典项' })
  deleteEntry(@Body() obj: { ids: string[] }) {
    const { ids } = obj;
    if (!Array.isArray(ids)) return { code: 400, message: '参数不合法' };
    const idList = ids.map(item => Number(item));
    return this.dictionaryService.batchRemoveEntry(idList);
  }

  @Get('entry/list')
  @ApiOperation({ summary: '获取字典项列表' })
  findEntryBy(@Query() params: any) {
    return this.dictionaryService.findEntryBy(params);
  }

  @Get('all')
  @Public()
  @ApiOperation({ summary: '获取字典列表' })
  findAll() {
    return this.dictionaryService.findAll();
  }
}
