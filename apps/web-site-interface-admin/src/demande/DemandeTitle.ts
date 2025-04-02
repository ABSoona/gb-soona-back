import { Demande as TDemande } from "../api/demande/Demande";

export const DEMANDE_TITLE_FIELD = "id";

export const DemandeTitle = (record: TDemande): string => {
  return record.id?.toString() || String(record.id);
};
