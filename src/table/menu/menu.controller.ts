import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { MenuService } from './menu.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('菜单')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post('add')
  @ApiOperation({ summary: '创建菜单' })
  create(@Body() createMenuDto: any) {
    return this.menuService.create(createMenuDto);
  }

  @Get()
  @ApiOperation({ summary: '获取菜单列表' })
  findAll() {
    return this.menuService.findAll();
  }

  @Post('update')
  @ApiOperation({ summary: '更新菜单' })
  update(@Body() createMenuDto: any) {
    return this.menuService.update(createMenuDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除菜单' })
  remove(@Param('id') id: string) {
    return this.menuService.remove(+id);
  }

  @Get('getMenuList')
  @ApiOperation({ summary: '获取菜单列表' })
  getMenuList() {
    return this.menuService.findMenuList();
  }
  @Post('sort')
  @ApiOperation({ summary: '排序菜单' })
  sort(@Body() sortMenu: { id: number; sort: number }[]) {
    return this.menuService.sortMenu(sortMenu);
  }
}
