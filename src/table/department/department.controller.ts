import { Controller, Get, Post, Body, Delete } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto, DepartmentSeedArrayDto, UpdateDepartmentDto } from './dto/department.dto';
import { Serialize, CheckPolicies } from '@/processor/decorator';
// import { CheckPolicies } from '@/processor/decorator/casl.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DepartmentListDto, DepartmentListResDto, DeleteDepartmentDto } from './dto/department.dto';

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
  @ApiOperation({ summary: '获取部门列表' })
  @Serialize(DepartmentListResDto)
  @ApiResponse({ type: DepartmentListDto, isArray: true }) //  swagger 显式响应返回数据
  findAll() {
    return this.departmentService.findAll();
  }

  @Post('update')
  @ApiOperation({ summary: '更新部门' })
  @CheckPolicies({ action: 'update', subject: 'Department' })
  update(@Body() updateDepartmentDto: UpdateDepartmentDto) {
    return this.departmentService.update(updateDepartmentDto);
  }

  @Delete('delete')
  @ApiOperation({ summary: '删除部门', description: '删除部门详细说明' })
  delete(@Body() body: DeleteDepartmentDto) {
    return this.departmentService.delete(body.id);
  }

  @Post('generateDepartmentSeed')
  @ApiOperation({ summary: '生成部门种子数据' })
  generateDepartmentSeed(@Body() data: DepartmentSeedArrayDto) {
    return this.departmentService.generateDepartmentSeed(data.data);
  }
}
