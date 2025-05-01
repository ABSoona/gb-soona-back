import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { DemandeService } from '../demande/demande.service';

@Injectable()
export class AidStatusCronService {
  private readonly logger = new Logger(AidStatusCronService.name);

  constructor(private prisma: PrismaService, private demandeService: DemandeService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleAidExpiration() {
    this.logger.log("Mise a jour des status de taches");
    const now = new Date();

// 1. Chercher toutes les aides concernées
const aides = await this.prisma.aide.findMany({
   where: {
    status: 'EnCours',
    //reetudier: true,
    dateExpiration: { lt: now },
   /*  frequence: {
      not: 'Unefois', // ✅ nouvelle condition
    }, */
  },
  include: {
    demande: true,
  },
});

for (const aide of aides) {
  // 2. Mise à jour de l'aide
  
  await this.prisma.aide.update({
    where: { id: aide.id },
    data: { status: 'Expir' },
  });

  // 3. Mise à jour de la demande associée
  if (aide.demandeId) {
    await this.prisma.demandeActivity.create({
      data: {
        demandeId: aide.demandeId,
        aideId: aide.id,
        titre: 'Aide expirée',
        typeField: 'expiration',
        message: `L'aide n°${aide.id} a expiré automatiquement.`,
        createdAt: now,
      },
    });
    
    const newDemandeStatus = aide.reetudier? 'en_commision':'clôturée'
    await this.demandeService.updateDemande({
      where: { id: aide.demandeId },
      data: { status: newDemandeStatus },
    });

    // 4. Ajout d'une activité dans demandeActivity
    
  }

  this.logger.log(`✅ Aide ${aide.id} expirée, demande ${aide.demandeId} → en_commision`);
} 

  }
}
