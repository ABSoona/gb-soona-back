import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { docRequestDefaultTemplate } from "./defaultTemplates";

const DEFAULT_TEMPLATES: Record<string, { objet: string; corps: string }> = {
  DEMANDE_JUSTIFICATIFS: docRequestDefaultTemplate,
};

@Injectable()
export class EmailTemplateService {
  constructor(private readonly prisma: PrismaService) {}

  // Renvoie le modele enregistre en base, ou a defaut le modele d'usine
  // (non persiste tant qu'il n'a pas ete explicitement enregistre une fois).
  async getByCode(code: string) {
    const existing = await this.prisma.emailTemplate.findUnique({ where: { code } });
    if (existing) return existing;

    const fallback = DEFAULT_TEMPLATES[code];
    if (!fallback) {
      throw new NotFoundException(`Modele de mail inconnu: ${code}`);
    }
    return { id: null, code, ...fallback, createdAt: null, updatedAt: null };
  }

  async upsert(code: string, objet: string, corps: string) {
    if (!DEFAULT_TEMPLATES[code]) {
      throw new NotFoundException(`Modele de mail inconnu: ${code}`);
    }
    return this.prisma.emailTemplate.upsert({
      where: { code },
      update: { objet, corps },
      create: { code, objet, corps },
    });
  }
}
