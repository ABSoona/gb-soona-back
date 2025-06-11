import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { VersementService } from 'src/versement/versement.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VersementAutoUpdateCronService {
  private readonly logger = new Logger(VersementAutoUpdateCronService.name);

  constructor(
    private readonly versementService: VersementService,
    private readonly prisma: PrismaService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async mettreAJourVersements() {
    const now = new Date();
    this.logger.log(`🔍 Vérification des versements à mettre à jour au statut "Verse"`);

    const versements = await this.prisma.versement.findMany({
      where: {
        status: 'AVerser',
        dataVersement: { lte: now },
        document: { isNot: null }, // 🔒 Preuve de virement obligatoire
      },
    });

    let count = 0;

    for (const versement of versements) {
      await this.versementService.updateVersement({
        where: { id: versement.id },
        data: { status: 'Verse' },
      });
      this.logger.log(`💸 Versement ${versement.id} mis à jour (preuve OK, date atteinte)`);
      count++;
    }

    this.logger.log(`✅ ${count} versement(s) mis à jour automatiquement`);
  }
}
