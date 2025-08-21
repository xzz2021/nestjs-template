import { Injectable } from '@nestjs/common';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';
import { PgService } from '@/prisma/pg.service';

@Injectable()
export class DepartmentService {
  constructor(private pgService: PgService) {}
  create(_createDepartmentDto: CreateDepartmentDto) {
    return 'This action adds a new department';
  }

  async findAll() {
    const list = await this.pgService.department.findMany();
    return { list, message: '获取部门列表成功' };
  }

  async update(updateDepartmentDto: UpdateDepartmentDto) {
    const updateStatement = {
      where: { id: updateDepartmentDto.id },
      data: updateDepartmentDto,
    };
    const res = await this.pgService.department.update(updateStatement);
    return { code: 200, id: res.id, message: '更新部门成功' };
  }

  async findOne(Id: number) {
    const data = await this.pgService.department.findUnique({
      where: { id: Id },
    });
    return { code: 200, data, message: '获取部门成功' };
  }
}
