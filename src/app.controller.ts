import { Controller, Get, Ip } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from './processor/decorator/public.decorator';
import { AppService } from './app.service';
// import { MailService } from './utils/mail/mail.service';

/* 
当 Nest IoC 容器实例化 CatsController 时，它首先会查找所有依赖项*。
当它找到 AppService 依赖项时，它会根据注册步骤（上述 #3）对 AppService 令牌执行查找，并返回 AppService 类。
假设是 SINGLETON 作用域（默认行为），Nest 会创建一个 AppService 实例，缓存并返回；或者，如果已经缓存了 AppService 实例，则返回现有实例。

*/
@Public()
@ApiTags('App入口')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    // @Inject(INQUIRER) private readonly parentClass: object,
    // private readonly mail: MailService,
  ) {}

  @Get()
  // @Version('1')
  getHello() {
    return this.appService.getHello();
  }
  @Get('ip')
  // @Version('1')
  getIp(@Ip() ip: string) {
    return this.appService.getIp(ip);
  }

  @Get()
  // @Version('2')
  getHello2(): string {
    return '2';
  }

  // @Get('test/:id')
  // findOne(@Param('id', ParseIntPipe) id: number) {
  //   //  如果需要对参数进行转换 可以使用内置的 pipe 管道
  //   // 使用ParseIntPipe 管道 对id进行转换 如果转换失败 会抛出异常 并返回400状态码
  //   return { number: id };
  // }

  // @Get('mail')
  // sendMail() {
  //   console.log('====mail======');
  //   return this.mail.sendCode({
  //     to: '18465690@qq.com',
  //     subject: '登录验证码',
  //     text: '11224563',
  //   });
  // }

  @Get('http')
  getHttp() {
    console.log('============getHttp============');
    return this.appService.getApi();
  }
}
