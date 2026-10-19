import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const SETTINGS_ID = 1;

export const DEFAULT_ORGANIZATION_SETTINGS = {
  nom: "AB SOO'NA",
  adresse: "Rue des osiers 78990 Élancourt",
  rna: "W784003736",
  email: "contact@soona.fr",
  telephone: "+33 7 70 79 52 56",
};

@Injectable()
export class OrganizationSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  // Renvoie les coordonnees enregistrees, ou a defaut les coordonnees
  // d'usine (non persistees tant qu'elles n'ont pas ete explicitement
  // enregistrees une fois) - meme pattern que EmailTemplateService.getByCode.
  async get() {
    const existing = await this.prisma.organizationSettings.findUnique({ where: { id: SETTINGS_ID } });
    if (existing) return existing;
    return { id: SETTINGS_ID, ...DEFAULT_ORGANIZATION_SETTINGS, createdAt: null, updatedAt: null };
  }

  async update(data: Partial<typeof DEFAULT_ORGANIZATION_SETTINGS>) {
    return this.prisma.organizationSettings.upsert({
      where: { id: SETTINGS_ID },
      update: data,
      create: { id: SETTINGS_ID, ...DEFAULT_ORGANIZATION_SETTINGS, ...data },
    });
  }
}
