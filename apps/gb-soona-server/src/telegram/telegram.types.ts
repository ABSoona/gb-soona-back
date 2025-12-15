export type recommandationType = "accept" | "reject" ;

export type PublishCommitteePayload = {
    demandeId: number;
    title?: string;
    lines: string[];
    demandeUrl?:string;
    authoriseVote?:boolean;  
    recommandation : recommandationType;
    message : string;
  };