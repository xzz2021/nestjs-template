// src/shared/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { CodeTemplate } from './template';
import { ConfigService } from '@nestjs/config';

export interface MailInfo {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  sender: string;
  auth: {
    user: string;
    pass: string;
  };
}

@Injectable()
export class MailService {
  private readonly transporter: Transporter;

  private readonly mailConfig: MailConfig;

  constructor(private readonly configService: ConfigService) {
    this.mailConfig = {
      host: this.configService.get<string>('MAIL_HOST', 'smtp.exmail.qq.com'),
      port: this.configService.get<number>('MAIL_PORT', 465),
      secure: true,
      sender: this.configService.get<string>('MAIL_SENDER', 'admin@yun3d.com'),
      auth: {
        user: this.configService.get<string>('MAIL_USER', ''),
        pass: this.configService.get<string>('MAIL_PASS', ''),
      },
    };
    this.transporter = nodemailer.createTransport(this.mailConfig);
  }

  async sendCode(mailInfo: MailInfo) {
    const htmlContent = mailInfo.html ?? CodeTemplate.replace('AAAAAA', mailInfo.text ?? '');

    const result = await this.transporter.sendMail({
      // from: this.mailConfig.auth.user,
      from: this.mailConfig.sender,
      to: mailInfo.to,
      subject: mailInfo.subject,
      html: htmlContent,
    });

    // this.cacheManager.set(to, code, { ttl: 60 * 5 });

    return { message: '发送成功', data: result };
  }

  // async checkCode(to, code) {}
}
