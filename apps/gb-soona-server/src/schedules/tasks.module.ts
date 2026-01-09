import { Module } from '@nestjs/common';
import { AidStatusCronService } from './aid-status-cron.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { DemandeModule } from 'src/demande/demande.module';
import { AbandonDemandeCronService } from './abandon-demande-cron.service';
import { VersementAutoUpdateCronService } from './VersementAutoUpdateCronService';
import { VersementModule } from 'src/versement/versement.module';
import { MailModule } from 'src/mail/mail.module';
import { VersementReminderService } from './Versement-reminder';

@Module({
  imports: [DemandeModule,VersementModule,MailModule],
  providers: [AidStatusCronService,AbandonDemandeCronService, PrismaService,VersementAutoUpdateCronService,VersementReminderService

  ],
})
export class TasksModule {}
