import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import auth from 'basic-auth';
import { NextFunction, Request, Response } from 'express';

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
      // name: 'Authorization',
      // bearerFormat: 'bearer',
      scheme: 'bearer',
      type: 'http',
    })
    // .addServer(`http://127.0.0.1:3000`, 'Base URL')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  document.security = [{ bearer: [] }]; //  给api请求添加token
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      docExpansion: 'list', // 展开所有操作，但折叠模型
      defaultModelsExpandDepth: 3, // 模型展开深度
      defaultModelExpandDepth: 3, // 模型属性展开深度
      displayRequestDuration: true, // 显示请求持续时间
      filter: true, // 启用过滤器
      // defaultModelRendering: 'model',
      // deepLinking: true,
      showExtensions: true, // 显示扩展
      showCommonExtensions: true, // 显示通用扩展
      // tryItOutEnabled: true, // 启用"Try it out"功能
      requestSnippetsEnabled: true, // 启用请求代码片段
      syntaxHighlight: {
        activate: true,
        theme: 'agate', // 代码高亮主题
      },
      persistAuthorization: true, // 持久化授权信息
    },
  });
}
