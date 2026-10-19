import { ObjectType, Field, Int } from "@nestjs/graphql";
import { User } from "../../user/base/User";
import { Aide } from "../../aide/base/Aide";
import { Demande } from "../../demande/base/Demande";
import { DemandeSituationHistory } from "../../demandeSituationHistory/base/DemandeSituationHistory";
import { Comite } from "./comite.model";
import { EnumDecisionType } from "./enum-decision-type";

// Decision prise en comite sur une demande (approbation/refus/ajournement).
// Objet GraphQL ecrit a la main (pas de scaffold Amplication) : le service
// charge comite/acteur/aides en une seule requete Prisma (include), donc pas
// de @ResolveField necessaire ici.
@ObjectType()
export class Decision {
  @Field(() => Int)
  id!: number;

  @Field(() => EnumDecisionType)
  type!: EnumDecisionType;

  @Field(() => String, { nullable: true })
  motivation!: string | null;

  @Field(() => Comite)
  comite!: Comite;

  @Field(() => User, { nullable: true })
  acteur!: User | null;

  @Field(() => [Aide])
  aides!: Aide[];

  @Field(() => Demande, { nullable: true })
  demande!: Demande | null;

  // Instantane de la situation financiere de la demande au moment de la
  // decision - uniquement renseigne pour les decisions d'Approbation
  // (voir DecisionService.createDecision).
  @Field(() => DemandeSituationHistory, { nullable: true })
  situationHistory!: DemandeSituationHistory | null;

  @Field(() => Date)
  createdAt!: Date;
}
