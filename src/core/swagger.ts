import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { Request, Response, NextFunction } from 'express';
import auth from 'basic-auth';

function swaggerAuth(username: string, password: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = auth(req);
    if (!user || user.name !== username || user.pass !== password) {
      res.set('WWW-Authenticate', 'Basic realm="Swagger"');
      return res.status(401).send('Authentication required.');
    }

    next();
  };
}

export function createSwagger(app: INestApplication) {
  console.log('=========已开启swagger=========');
  // Swagger 密码保护
  app.use('/docs', swaggerAuth('admin', '123456')); // 设定用户名密码
  const config = new DocumentBuilder()
    .setTitle('后台管理')
    .setDescription('design by xzz2021')
    .setVersion('1.0')
    // .addGlobalResponse({
    //   status: 200,
    //   description: '成功响应',
    // })
    .addGlobalResponse({
      status: 400,
      description: '错误响应',
    })
    .addGlobalResponse({
      status: 401,
      description: '未授权，缺失或无效的令牌',
    })
    .addGlobalResponse({
      status: 500,
      description: '服务器内部错误',
    })
    .addBearerAuth({
      description: 'Please enter token:',
      name: 'Authorization',
      bearerFormat: 'Bearer',
      scheme: 'Bearer',
      type: 'http',
      in: 'Header',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    // ✅ 开启自动模式（核心）  // 这样dto中定义的属性即使没加ApiProperty也会自动生成
    autoTagControllers: true,
  });
  SwaggerModule.setup('docs', app, document);
}
