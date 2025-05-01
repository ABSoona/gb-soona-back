import { DemandeService } from './../demande/demande.service';
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AideServiceBase } from "./base/aide.service.base";
import { Prisma, Aide as PrismaAide } from "@prisma/client";
import { EnumAideTypeField } from "./base/EnumAideTypeField";
import { EnumAideFrequence } from './base/EnumAideFrequence';

@Injectable()
export class AideService extends AideServiceBase {
  constructor(protected readonly prisma: PrismaService,
    protected readonly demandeService: DemandeService
    ) {
    super(prisma);
  }

  async createAide(args: Prisma.AideCreateArgs): Promise<PrismaAide> {

    const aide = await super.createAide(args);

    if (aide.demandeId) {
      const titre = `Aide accordée`;
      const aidTypeLabel = aide.typeField === EnumAideTypeField.AssistanceAdministrative? "d'assitance administrative":"";
      const frequence = aide.typeField === EnumAideTypeField.FinanciRe && aideFrequenceLabels.find(e=>e.value===aide.frequence)?.label
      const montant = aide.typeField === EnumAideTypeField.FinanciRe && `d'un montant de ${aide.montant?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}`
      
      const message = `Une aide ${frequence} ${aidTypeLabel} ${montant} a été accordée au demandeur jusqu'au ${aide?.dateExpiration?.toLocaleString()}`;
      const demandeActivity = await this.prisma.demandeActivity.create({
        data: {
          demandeId: aide.demandeId,
          aideId: aide.id,
          titre: titre,
          typeField: 'aideAdd',
          message: message
        }
      });
      console.log('Nouvelle activité ajoutée:', demandeActivity)
      //mise a jour du status
       await this.demandeService.updateDemande({data:{status:'EnCours'},where:{id:aide.demandeId}})
    }

    return aide;
  }


}
export const aideTypeLabels = [
  { value: EnumAideTypeField.FinanciRe, label: 'Financière' },
  { value: EnumAideTypeField.AssistanceAdministrative, label: 'Administrative' }
]

export const aideFrequenceLabels = [
  { value: EnumAideFrequence.UneFois, label: 'en une fois' },
  { value: EnumAideFrequence.BiMensuelle, label: 'bi-mensuelle' },
  { value: EnumAideFrequence.Hebdomadaire, label: 'hebdomadaire' },
  { value: EnumAideFrequence.Mensuelle, label: 'mensuelle' },
  { value: EnumAideFrequence.Trimestrielle, label: 'trimestrielle' },

]