import { Injectable, BadRequestException } from "@nestjs/common";
import { Response } from "express";
import { PrismaService } from "../prisma/prisma.service";
import { DemandeService } from "../demande/demande.service";
import { OrganizationSettingsService } from "../organizationSettings/organizationSettings.service";
import { CreateDecisionInput } from "./dto/create-decision.input";
import { EnumDecisionType } from "./models/enum-decision-type";
import { generateDecisionPdf } from "./decision-pdf.helper";

const DECISION_INCLUDE = { comite: true, acteur: true, aides: true, situationHistory: true };
const DECISION_INCLUDE_WITH_DEMANDE = {
  ...DECISION_INCLUDE,
  demande: { include: { contact: true } },
};

@Injectable()
export class DecisionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly demandeService: DemandeService,
    private readonly organizationSettingsService: OrganizationSettingsService,
  ) {}

  async createDecision(input: CreateDecisionInput) {
    // Construit minuit UTC pour la date calendaire LOCALE du jour (et non
    // minuit local converti en UTC), pour que la colonne `@db.Date` stocke
    // bien le jour attendu quel que soit le fuseau horaire du serveur.
    const now = new Date();
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const comite = await this.prisma.comite.upsert({
      where: { date: today },
      create: { date: today },
      update: {},
    });

    const decision = await this.prisma.decision.create({
      data: {
        type: input.type,
        motivation: input.motivation,
        comite: { connect: { id: comite.id } },
        demande: { connect: { id: input.demandeId } },
        ...(input.acteurId ? { acteur: { connect: { id: input.acteurId } } } : {}),
      },
      include: DECISION_INCLUDE,
    });

    // Reutilise DemandeService.updateDemande (et non prisma.demande.update)
    // pour garder l'historique de statut et les notifications existantes.
    switch (input.type) {
      case EnumDecisionType.Approbation:
        await this.demandeService.updateDemande({
          where: { id: input.demandeId },
          data: { status: "EnCours", decisionDate: new Date() },
        });
        await this.createSituationSnapshot(input.demandeId, decision.id, input.acteurId);
        break;
      case EnumDecisionType.Refus:
        await this.demandeService.updateDemande({
          where: { id: input.demandeId },
          data: { status: "refusée", decisionDate: new Date() },
        });
        break;
      case EnumDecisionType.Ajournement:
        await this.demandeService.updateDemande({
          where: { id: input.demandeId },
          data: { status: "en_pre_commision" },
        });
        break;
    }

    return this.prisma.decision.findUnique({ where: { id: decision.id }, include: DECISION_INCLUDE });
  }

  // Fige la situation financiere de la demande au moment de l'approbation,
  // pour que les documents/decisions restent exacts meme si la demande est
  // modifiee plus tard. Reutilise DemandeSituationHistory (deja utilise
  // pour historiser un "avant edition") plutot qu'un nouveau modele.
  private async createSituationSnapshot(demandeId: number, decisionId: number, acteurId?: string) {
    const demande = await this.prisma.demande.findUnique({ where: { id: demandeId } });
    if (!demande) return;

    await this.prisma.demandeSituationHistory.create({
      data: {
        demande: { connect: { id: demandeId } },
        decision: { connect: { id: decisionId } },
        ...(acteurId ? { creePar: { connect: { id: acteurId } } } : {}),
        nombreEnfants: demande.nombreEnfants,
        nombrePersonnes: demande.nombrePersonnes,
        agesEnfants: demande.agesEnfants,
        situationFamiliale: demande.situationFamiliale,
        situationProfessionnelle: demande.situationProfessionnelle,
        situationProConjoint: demande.situationProConjoint,
        revenus: demande.revenus,
        revenusConjoint: demande.revenusConjoint,
        loyer: demande.loyer,
        facturesEnergie: demande.facturesEnergie,
        dettes: demande.dettes,
        natureDettes: demande.natureDettes,
        autresAides: demande.autresAides,
        autresCharges: demande.autresCharges,
        apl: demande.apl,
        categorieDemandeur: demande.categorieDemandeur,
        remarques: demande.remarques,
      },
    });
  }

  async decisionsByDemande(demandeId: number) {
    return this.prisma.decision.findMany({
      where: { demandeId },
      orderBy: { createdAt: "desc" },
      include: DECISION_INCLUDE,
    });
  }

  async comites() {
    const comites = await this.prisma.comite.findMany({
      orderBy: { date: "desc" },
      include: { decisions: { select: { type: true } } },
    });

    return comites.map(({ decisions, ...comite }) => ({
      ...comite,
      nombreTraites: decisions.length,
      nombreApprouves: decisions.filter((d) => d.type === EnumDecisionType.Approbation).length,
      nombreRefuses: decisions.filter((d) => d.type === EnumDecisionType.Refus).length,
      nombreAjournes: decisions.filter((d) => d.type === EnumDecisionType.Ajournement).length,
    }));
  }

  async decisionsByComite(comiteId: number) {
    return this.prisma.decision.findMany({
      where: { comiteId },
      orderBy: { createdAt: "desc" },
      include: DECISION_INCLUDE_WITH_DEMANDE,
    });
  }

  async updateDecisionMotivation(decisionId: number, motivation: string) {
    return this.prisma.decision.update({
      where: { id: decisionId },
      data: { motivation },
      include: DECISION_INCLUDE,
    });
  }

  async attachAideToDecision(decisionId: number, aideId: number) {
    await this.prisma.aide.update({
      where: { id: aideId },
      data: { decision: { connect: { id: decisionId } } },
    });

    return this.prisma.decision.findUnique({
      where: { id: decisionId },
      include: DECISION_INCLUDE,
    });
  }

  async generateDecisionPdf(decisionId: number, res: Response): Promise<void> {
    const decision = await this.prisma.decision.findUnique({
      where: { id: decisionId },
      include: DECISION_INCLUDE_WITH_DEMANDE,
    });

    if (!decision) {
      throw new BadRequestException(`Decision ${decisionId} introuvable`);
    }
    if (decision.type !== EnumDecisionType.Approbation) {
      throw new BadRequestException("Seules les decisions d'approbation ont un PDF.");
    }
    if (!decision.situationHistory) {
      throw new BadRequestException("Cette decision ne dispose pas d'un instantane de situation (creee avant cette fonctionnalite).");
    }
    if (!decision.demande?.contact) {
      throw new BadRequestException("Beneficiaire introuvable pour cette decision.");
    }

    const organizationSettings = await this.organizationSettingsService.get();

    await generateDecisionPdf(decision as any, organizationSettings, res);
  }
}
