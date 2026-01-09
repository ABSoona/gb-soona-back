import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { DemandeService } from '../demande/demande.service';

@Injectable()
export class AbandonDemandeCronService {
  private readonly logger = new Logger(AbandonDemandeCronService.name);

  constructor(
    private prisma: PrismaService,
    private demandeService: DemandeService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async abandonnerDemandesInactives() {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    this.logger.log(`Vérification des demandes inactives depuis le ${oneMonthAgo.toISOString()}`);
    const demandes = await this.prisma.demande.findMany({
      where: {
        status: 'EnAttente',
        updatedAt: { lt: oneMonthAgo }, 
        /*demandeActivities: {
          some: { createdAt: { lt: oneMonthAgo } },
           none: { typeField: 'priseContactReussie' }, 
        },*/
      },
      include: {
        demandeActivities: true,
      },
    });

    const candidates = demandes
    
    for (const demande of candidates) {
      await this.demandeService.updateDemande({
        where: { id: demande.id },
        data: { status: 'Abandonnée' },
      });

      await this.prisma.demandeActivity.create({
        data: {
          demandeId: demande.id,
          titre: 'Demande abandonnée automatiquement',
          typeField: 'autoStatusUpdate',
          message: `❌ La demande a été abandonnée après plusieurs échecs de contact (> 3) et aucune prise de contact réussie.`,
        },
      });

      this.logger.log(`🗑 Demande ${demande.id} abandonnée automatiquement`);
    }

    this.logger.log(`✅ ${candidates.length} demande(s) mises à jour`);
  }
}
