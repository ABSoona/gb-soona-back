import { Injectable } from "@nestjs/common";
import { DemandeService } from "src/demande/demande.service";
import { recommandationType } from "src/telegram/telegram.types";




@Injectable()
export class CommitteeService {
  constructor(
    private readonly demandeService: DemandeService
  ) {}



  async closeDemande(
    demandeId: number,
    results: { accept: number; postpone: number;},
    recommandation : recommandationType
  ) {
    const decision = this.computeDecision(results);

    

      if (decision == "ACCEPTEE" && recommandation == "accept") {
        await this.demandeService.updateDemande({
          where: { id: demandeId },
          data: { telegramComiteeAction: true },
        });
      }
      if (decision == "ACCEPTEE" && recommandation == 'reject') {
        await this.demandeService.updateDemande({
          where: { id: demandeId },
          data: { status: "refusée" },
        });
      }

    return decision;
  }

  private computeDecision(results: {
    accept: number;
    postpone: number;

  }): "ACCEPTEE" | "AJOURNEE"  {
  
    const { accept, postpone } = results;
    const max = Math.max(accept, postpone);
  
    // Aucun vote
    if (max === 0) {
      return "AJOURNEE";
    }
  
    // Détection d’égalité
    const winners = [accept, postpone].filter(v => v === max);
    if (winners.length > 1) {
      return "AJOURNEE";
    }
  
    // Décision claire
    if (max === accept) return "ACCEPTEE";
    if (max === postpone) return "AJOURNEE";
    return "AJOURNEE";
  }
}
