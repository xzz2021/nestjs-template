import { Body, Controller, Get, Post, Query, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdatePwdType, UpdateUserPwdType } from './types';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { QueryUserParams, UpdateUserDto, UpdatePersonalInfo } from './dto/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfigForAvatar } from '@/staticfile/multer.config';
import { ConfigService } from '@nestjs/config';
@ApiTags('用户')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  @Get('listByDepartmentId')
  @ApiOperation({ summary: '获取指定部门用户' })
  findBy(@Query() params: QueryUserParams) {
    return this.userService.findByDepartmentId(params);
  }

  @Get('detailInfo')
  @ApiOperation({ summary: '获取用户详情' })
  detailInfo(@Req() req: any) {
    const userId = req.user.id;
    return this.userService.getUserInfo(+userId);
  }

  @Post('updatePersonalInfo')
  @ApiOperation({ summary: '用户更新自己的个人信息' })
  updatePersonalInfo(@Body() updateUserinfo: UpdatePersonalInfo, @Req() req: any) {
    // 用户更新自己的信息  校验req.user
    if (req.user.id !== +updateUserinfo.id) {
      return { code: 400, message: '无权限更新他人信息' };
    }
    return this.userService.updateInfo(updateUserinfo);
  }

  @Post('updatePassword')
  @ApiOperation({ summary: '更新用户密码' })
  updatePassword(@Body() updatePasswordDto: UpdatePwdType, @Req() req: any) {
    // 用户更新自己的密码  校验req.user
    if (req.user.id !== +updatePasswordDto.id) {
      return { code: 400, message: '无权限更新他人密码' };
    }
    return this.userService.updatePassword(updatePasswordDto);
  }

  // 管理员重置用户密码
  @Post('resetPassword')
  @ApiOperation({ summary: '管理员重置用户密码' })
  resetPassword(@Body() updatePasswordDto: { id: number; password: string }, @Req() req: any) {
    const operateId = req?.user?.id;
    if (!operateId) return { code: 400, message: '身份识别异常,没有权限' };
    const { id, password } = updatePasswordDto;
    if (!id || !password) return { code: 400, message: '参数异常' };
    return this.userService.resetPassword({ id, password, operateId });
  }

  @Post('add')
  @ApiOperation({ summary: '创建用户' })
  addUser(@Body() addUserinfoDto: any) {
    return this.userService.addUser(addUserinfoDto);
  }

  @Post('update')
  @ApiOperation({ summary: '更新用户' })
  update(@Body() updateData: UpdateUserDto) {
    return this.userService.update(updateData);
  }

  @Post('delete')
  @ApiOperation({ summary: '删除用户' })
  delete(@Body() data: { ids: string[] }) {
    const { ids } = data;
    if (!Array.isArray(ids)) return { code: 400, message: '参数不合法' };
    const idList = ids.map(item => Number(item));
    return this.userService.delete(idList);
  }

  @Get('all')
  @ApiOperation({ summary: '获取所有用户' })
  getAll() {
    return this.userService.getAll();
  }

  @Post('upload/avatar')
  @ApiOperation({ summary: '上传用户头像' })
  @UseInterceptors(FileInterceptor('file', multerConfigForAvatar))
  uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    const userId = (req.user.id as number) || 0;
    const staticUrl = this.configService.get('STATIC_URL');
    const avatarPath = staticUrl + '/static/avatar/' + req.user.phone + '/' + file.filename;
    return this.userService.updateAvatar(avatarPath, userId);
  }

  @Post('updatePwd')
  @ApiOperation({ summary: 'pc用户更新自己的密码' })
  updateUserPassword(@Body() updatePasswordDto: UpdateUserPwdType, @Req() req: any) {
    // 用户更新自己的密码  校验req.user
    const userPhone = req?.user?.phone as string;
    if (!userPhone) {
      return { code: 400, message: '用户未登录或登录已过期' };
    }
    return this.userService.updateUserPassword(updatePasswordDto, userPhone);
  }
}
