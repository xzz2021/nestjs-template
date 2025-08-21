import { Controller, Get, Post, Body } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';
import { Serialize } from '@/processor/decorator/serialize';
import { Department1Entity } from './entities/department.entity';
import { CheckPolicies } from '@/processor/decorator/casl.decorator';

@Controller('department')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentService.create(createDepartmentDto);
  }

  @Serialize(Department1Entity)
  @CheckPolicies({ action: 'read', subject: 'Department' })
  //  如果 Department 只是一个 JSON 对象而不是类实例，CASL 默认无法识别类型！  推荐使用subject函数包裹
  // @CheckPolicies({ action: 'update', subject: subject('Department', DepartmentInstance)})
  @Get('list')
  findAll() {
    return this.departmentService.findAll();
  }

  @Post('update')
  @CheckPolicies({ action: 'update', subject: 'Department' })
  update(@Body() updateDepartmentDto: UpdateDepartmentDto) {
    return this.departmentService.update(updateDepartmentDto);
  }
}
