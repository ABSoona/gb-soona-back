// src/aide/aide.logic.ts
import { Aide } from "@prisma/client";
import { EnumAideFrequence } from "./base/EnumAideFrequence";
import { EnumVersementStatus } from "src/versement/base/EnumVersementStatus";
import { addMonths } from "date-fns";
import { EnumAideTypeField } from "./base/EnumAideTypeField";



export function generateVersements(aide: Aide) {
  if (!aide?.frequence || !['Unefois', 'Mensuelle'].includes(aide.frequence)) {
    throw new Error("Only Mensuelle et Une fois are allowed");
  }

  if (!aide.dateAide || !aide.montant || !aide.nombreVersements) {
    throw new Error("Date, montant ou nombre de versements manquant");
  }

  const versements = [];

  for (let i = 0; i < aide.nombreVersements; i++) {
    const dateVersement = aide.frequence === 'Mensuelle' ? addMonths(aide.dateAide, i) : aide.dateAide;

    versements.push({
      aideId: aide.id,
      dataVersement: dateVersement,
      montant: aide.montant,
      status: EnumVersementStatus.AVerser,
    });

    if (aide.frequence === 'Unefois') break;
  }

  return versements;
}

export function generateAideActivityMessage(aide: Aide): string {
    const aidTypeLabel = aide.typeField === EnumAideTypeField.AssistanceAdministrative ? "d'assitance administrative" : "";
    const frequence = aide.typeField === EnumAideTypeField.FinanciRe && aideFrequenceLabels.find(e => e.value === aide.frequence)?.label;
    const montant = aide.typeField === EnumAideTypeField.FinanciRe && `d'un montant de ${aide.montant?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`;
    return `Une aide ${frequence} ${aidTypeLabel} ${montant} a été accordée au demandeur jusqu'au ${aide?.dateExpiration?.toLocaleString()}`;
  }

   const aideTypeLabels = [
    { value: EnumAideTypeField.FinanciRe, label: 'Financière' },
    { value: EnumAideTypeField.AssistanceAdministrative, label: 'Administrative' }
  ]
  
   const aideFrequenceLabels = [
    { value: EnumAideFrequence.UneFois, label: 'en une fois' },
    { value: EnumAideFrequence.BiMensuelle, label: 'bi-mensuelle' },
    { value: EnumAideFrequence.Hebdomadaire, label: 'hebdomadaire' },
    { value: EnumAideFrequence.Mensuelle, label: 'mensuelle' },
    { value: EnumAideFrequence.Trimestrielle, label: 'trimestrielle' },
  
  ]
  
  