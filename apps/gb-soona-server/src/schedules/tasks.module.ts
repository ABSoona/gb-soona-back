import { Module } from '@nestjs/common';
import { AidStatusCronService } from './aid-status-cron.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { DemandeModule } from 'src/demande/demande.module';
import { AbandonDemandeCronService } from './abandon-demande-cron.service';
@Module({
  imports: [DemandeModule],
  providers: [AidStatusCronService,AbandonDemandeCronService, PrismaService],
})
export class TasksModule {}
