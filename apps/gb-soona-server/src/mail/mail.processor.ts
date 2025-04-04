// mail/mail.processor.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { MailService } from './mail.service';
import { Queues } from 'src/bullmq/queues';
import { redisConnection } from 'src/bullmq/queue-dispatcher.config';

@Injectable()
export class MailProcessor implements OnModuleInit {
  constructor(private readonly mailService: MailService) {}

  onModuleInit() {
    new Worker(
      Queues.MAIL,
      async (job: Job) => {
        console.log('📤 Email envoyé avec succès');
        const { template, to, subject, variables } = job.data;

        try {
          await this.mailService.sendUserMail(template, to, variables, subject);
          console.log('📤 Email envoyé avec succès');
        } catch (error) {
          console.error('❌ Erreur lors de l’envoi de l’email depuis MailProcessor :', error);
          throw error; // (optionnel) pour que BullMQ marque le job comme "failed"
        }
      },
      {
        connection: redisConnection
      },
    );
  }
}
