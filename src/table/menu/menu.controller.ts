import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { MenuService } from './menu.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateMenuDto, MenuListDto, MenuSeedArrayDto, MenuSortArrayDto, UpdateMenuDto } from './dto/menu.dto';

@ApiTags('菜单')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post('add')
  @ApiOperation({ summary: '创建菜单' })
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menuService.create(createMenuDto);
  }

  @Post('update')
  @ApiOperation({ summary: '更新菜单' })
  update(@Body() createMenuDto: UpdateMenuDto) {
    return this.menuService.update(createMenuDto);
  }

  @Get('getMenuList')
  @ApiOperation({ summary: '获取所有菜单嵌套列表, 包含权限, 用于展示管理' })
  @ApiResponse({ type: MenuListDto, isArray: true })
  getMenuList() {
    return this.menuService.findMenuList();
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除菜单' })
  remove(@Param('id') id: string) {
    return this.menuService.remove(+id);
  }

  @Post('sort')
  @ApiOperation({ summary: '排序菜单' })
  sort(@Body() data: MenuSortArrayDto) {
    return this.menuService.sortMenu(data.data);
  }

  @Post('generateMenuSeed')
  @ApiOperation({ summary: '生成菜单种子数据' })
  generateMenuSeed(@Body() data: MenuSeedArrayDto) {
    return this.menuService.generateMenuSeed(data.data);
  }
}
