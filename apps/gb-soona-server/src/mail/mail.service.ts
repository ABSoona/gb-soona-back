// mail/mail.service.ts
import { Injectable } from '@nestjs/common';
const mjml2html = require('mjml');
import * as fs from 'fs';
import * as path from 'path';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false, // TLS (STARTTLS)
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          ciphers: 'SSLv3',
        },
      });
  }

  private renderTemplate(templateName: string, variables: Record<string, string>): string {
    const basePath = path.resolve(__dirname, 'templates');
    const header = fs.readFileSync(path.join(basePath, 'partials', 'header.mjml'), 'utf8');
    const footer = fs.readFileSync(path.join(basePath, 'partials', 'footer.mjml'), 'utf8');
    const body = fs.readFileSync(path.join(basePath, `${templateName}.mjml`), 'utf8');
  
    let fullTemplate = `
      <mjml>
        <mj-body>
          ${header}
          ${body}
          ${footer}
        </mj-body>
      </mjml>
    `;
  

    // Remplacement simple des variables {{variable}}
    for (const [key, value] of Object.entries(variables)) {
        fullTemplate = fullTemplate.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }
      const { html } = mjml2html(fullTemplate);
      return html;
  }

  async sendUserMail(template: string ,to: string,  variables: Record<string, string>,subject:string) {
    const html = this.renderTemplate(template, variables);

    await this.transporter.sendMail({
      from: `"GBSoona" <${process.env.SMTP_USER}>`,
      to,
      subject:subject,
      html,
      attachments: [
        {
          filename: 'log.png',
          path: path.resolve(__dirname, 'assets', 'logo.png'),
          cid: 'logo', // 👈 correspond à `cid:logo` dans le MJML
        },
      ],
    });
  }

 
}
