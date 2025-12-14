import { Injectable } from "@nestjs/common";
import { DemandeService } from "src/demande/demande.service";
import { TelegramService } from "src/telegram/telegram.service";
import { PublishCommitteePayload } from "src/telegram/telegram.types";

@Injectable()
export class CommitteeService {
  constructor(
    private readonly demandeService: DemandeService
  ) {}



  async closeDemande(
    demandeId: number,
    results: { accept: number; postpone: number; reject: number }
  ) {
    const decision = this.computeDecision(results);

    (decision == "REFUSEE") &&
    await this.demandeService.updateDemande({
        where: { id: demandeId },
        data: { status: "refusée" },
      });


    return decision;
  }

  private computeDecision(results: {
    accept: number;
    postpone: number;
    reject: number;
  }): "ACCEPTEE" | "AJOURNEE" | "REFUSEE" {
  
    const { accept, postpone, reject } = results;
    const max = Math.max(accept, postpone, reject);
  
    // Aucun vote
    if (max === 0) {
      return "AJOURNEE";
    }
  
    // Détection d’égalité
    const winners = [accept, postpone, reject].filter(v => v === max);
    if (winners.length > 1) {
      return "AJOURNEE";
    }
  
    // Décision claire
    if (max === accept) return "ACCEPTEE";
    if (max === postpone) return "AJOURNEE";
    return "REFUSEE";
  }
}
