import { Controller, Get, Post, Body, Query, Delete } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';
import { Serialize } from '@/processor/decorator/serialize';
import { CheckPolicies } from '@/processor/decorator/casl.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DepartmentListResDto } from './dto/department.dto';
@ApiTags('部门')
@Controller('department')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post('add')
  @ApiOperation({ summary: '添加部门' })
  add(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentService.add(createDepartmentDto);
  }

  // @CheckPolicies({ action: 'read', subject: 'Department' })
  //  如果 Department 只是一个 JSON 对象而不是类实例，CASL 默认无法识别类型！  推荐使用subject函数包裹
  // @CheckPolicies({ action: 'update', subject: subject('Department', DepartmentInstance)})
  @Get('list')
  @Serialize(DepartmentListResDto)
  findAll() {
    return this.departmentService.findAll();
  }

  @Post('update')
  @CheckPolicies({ action: 'update', subject: 'Department' })
  update(@Body() updateDepartmentDto: UpdateDepartmentDto) {
    return this.departmentService.update(updateDepartmentDto);
  }

  @Delete('delete')
  @ApiOperation({ summary: '删除部门', description: '删除部门详细说明' })
  delete(@Body() body: { id: number }) {
    return this.departmentService.delete(body.id);
  }

  // @Post('admin/batchUpsert')
  // @ApiOperation({ summary: '批量插入/更新部门' })
  // batchUpsert(@Body() data: UpsertDepartmentDto[]) {
  //   return this.departmentService.batchUpsert(data);
  // }
}
