// src/shared/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { CodeTemplate } from './mail.template';

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
    this.mailConfig = this.configService.get<MailConfig>('mail') || {
      host: 'smtp.exmail.qq.com',
      port: 465,
      secure: true,
      sender: 'aaa@aaa.com',
      auth: {
        user: '',
        pass: '',
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

    // this.redis.set(to, code, { ttl: 60 * 5 });

    return { message: '发送成功', data: result };
  }

  // async checkCode(to, code) {}
}
