import { QueueDispatcherService } from './../bullmq/queue-dispatcher.service';
// mail/mail.service.ts
import { Injectable } from '@nestjs/common';
const mjml2html = require('mjml');
import * as fs from 'fs';
import * as path from 'path';
import * as nodemailer from 'nodemailer';
import { Queues } from 'src/bullmq/queues';

@Injectable()
export class MailService {
  private teamTransporter: nodemailer.Transporter;
  private userTransporter: nodemailer.Transporter;

  constructor(protected readonly queueDispatcherService: QueueDispatcherService) {
    this.teamTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    this.userTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER_EXTERNAL,
        pass: process.env.SMTP_PASS_EXTERNAL,
      },
    });
  }

  private renderTemplate(templateName: string, variables: Record<string, string>): string {
    const basePath = path.resolve(__dirname, 'templates');
    const header = fs.readFileSync(path.join(basePath, 'partials', 'header.mjml'), 'utf8');
    const footer = fs.readFileSync(path.join(basePath, 'partials', 'footer.mjml'), 'utf8');
    const body = fs.readFileSync(path.join(basePath, `${templateName}.mjml`), 'utf8');

    let fullTemplate = `<mjml><mj-body>${header}${body}${footer}</mj-body></mjml>`;

    for (const [key, value] of Object.entries(variables)) {
      fullTemplate = fullTemplate.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    const { html } = mjml2html(fullTemplate, { validationLevel: 'strict' });
    return html;
  }

  sendMailAsync(template: string, to: string, variables: Record<string, string>, subject: string) {
    return this.queueDispatcherService.dispatch(Queues.MAIL, {
      template,
      to,
      variables,
      subject,
    });
  }

  async sendUserMail(
    template: string,
    to: string,
    variables: Record<string, string>,
    subject: string,
    isTeam: boolean = true // ✅ Par défaut à true
  ) {
    const html = this.renderTemplate(template, variables);
    const transporter = isTeam ? this.teamTransporter : this.userTransporter;
    const from = isTeam
      ? `"GBSoona Team" <${process.env.SMTP_USER}>`
      : `"Social Soona" <${process.env.SMTP_USER_EXTERNAL}>`;
  
    await transporter.sendMail({
      from,
      to,
      subject,
      html,
      attachments: [
        {
          filename: 'logo.png',
          path: path.resolve(__dirname, 'assets', 'logo.png'),
          cid: 'logo',
        },
      ],
    });
  }
  
  async sendHtmlMail(
    html: string,
    subject: string,
    to: string,
    isTeam: boolean = true // ✅ Par défaut à true
  ) {
    const transporter = isTeam ? this.teamTransporter : this.userTransporter;
    const from = isTeam
      ? `"GBSoona Team" <${process.env.SMTP_USER}>`
      : `"GBSoona" <${process.env.SMTP_USER}>`;
  
    await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
  }
}

