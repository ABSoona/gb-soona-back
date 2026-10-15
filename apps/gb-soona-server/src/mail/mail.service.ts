import { QueueDispatcherService } from './../bullmq/queue-dispatcher.service';
// mail/mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
const mjml2html = require('mjml');
import * as fs from 'fs';
import * as path from 'path';
import { Queues } from 'src/bullmq/queues';

interface GraphAttachment {
  '@odata.type': string;
  name: string;
  contentType: string;
  contentBytes: string;
  contentId?: string;
  isInline?: boolean;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  // Cache en memoire du jeton Azure AD (client credentials) : un nouveau
  // jeton est redemande seulement lorsque le precedent approche de son
  // expiration, pour eviter un aller-retour OAuth2 a chaque envoi.
  private cachedToken: { value: string; expiresAt: number } | null = null;

  constructor(protected readonly queueDispatcherService: QueueDispatcherService) {}

  private async getAccessToken(): Promise<string> {
    if (this.cachedToken && this.cachedToken.expiresAt > Date.now() + 60_000) {
      return this.cachedToken.value;
    }

    const tenantId = process.env.AZURE_TENANT_ID;
    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;
    if (!tenantId || !clientId || !clientSecret) {
      throw new Error(
        "Configuration Azure AD manquante (AZURE_TENANT_ID/AZURE_CLIENT_ID/AZURE_CLIENT_SECRET)."
      );
    }

    const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Echec d'authentification Azure AD (${response.status}) : ${errorBody}`);
    }

    const data = (await response.json()) as { access_token: string; expires_in: number };
    this.cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
    return data.access_token;
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

  // Envoie via Microsoft Graph (/users/{boite}/sendMail), authentifie en
  // app-only (client credentials) - aucune session utilisateur/mot de passe
  // de boite requis, donc pas concerne par la depreciation de l'auth SMTP
  // basique chez Microsoft.
  private async sendViaGraph(
    html: string,
    subject: string,
    to: string,
    fromName: string | undefined,
    attachments: GraphAttachment[] = []
  ) {
    const mailbox = process.env.SMTP_USER;
    if (!mailbox) {
      throw new Error("Configuration manquante : SMTP_USER (adresse de la boite d'envoi).");
    }

    const accessToken = await this.getAccessToken();

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(mailbox)}/sendMail`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            subject,
            body: { contentType: 'HTML', content: html },
            toRecipients: [{ emailAddress: { address: to } }],
            from: { emailAddress: { address: mailbox, name: fromName } },
            replyTo: process.env.SMTP_REPLY_TO
              ? [{ emailAddress: { address: process.env.SMTP_REPLY_TO } }]
              : undefined,
            attachments: attachments.length > 0 ? attachments : undefined,
          },
          saveToSentItems: 'true',
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      this.logger.error(`Echec envoi mail vers ${to} : ${response.status} ${errorBody}`);
      throw new Error(`Echec de l'envoi du mail (${response.status})`);
    }
  }

  async sendUserMail(
    template: string,
    to: string,
    variables: Record<string, string>,
    subject: string,
    from_name: string | undefined = process.env.SMTP_FROM_NAME_INTERNAL
  ) {
    const html = this.renderTemplate(template, variables);
    const logoBase64 = fs.readFileSync(path.resolve(__dirname, 'assets', 'logo.png')).toString('base64');

    await this.sendViaGraph(html, subject, to, from_name, [
      {
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: 'logo.png',
        contentType: 'image/png',
        contentBytes: logoBase64,
        contentId: 'logo',
        isInline: true,
      },
    ]);
  }

  async sendHtmlMail(
    html: string,
    subject: string,
    to: string,
    from_name: string | undefined = process.env.SMTP_FROM_NAME_INTERNAL
  ) {
    await this.sendViaGraph(html, subject, to, from_name);
  }
}
