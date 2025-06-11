import { Module } from '@nestjs/common';
import { AidStatusCronService } from './aid-status-cron.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { DemandeModule } from 'src/demande/demande.module';
import { AbandonDemandeCronService } from './abandon-demande-cron.service';
import { VersementAutoUpdateCronService } from './VersementAutoUpdateCronService';
import { VersementModule } from 'src/versement/versement.module';
@Module({
  imports: [DemandeModule,VersementModule],
  providers: [AidStatusCronService,AbandonDemandeCronService, PrismaService,VersementAutoUpdateCronService],
})
export class TasksModule {}
