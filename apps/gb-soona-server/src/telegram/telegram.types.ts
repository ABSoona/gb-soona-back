export type PublishCommitteePayload = {
    demandeId: number;
    beneficiaire: string;
    situationFam?: string;
    situationPro?: string;
    montant?: number;
    motif?: string;
    createdAt?: string; // ISO
  };
  