import { ObjectType, Field, Int } from "@nestjs/graphql";

// Regroupe les decisions prises le meme jour (une seance de comite). Cree a
// la volee (upsert par date) par DecisionService.createDecision.
@ObjectType()
export class Comite {
  @Field(() => Int)
  id!: number;

  @Field(() => Date)
  date!: Date;

  @Field(() => Date)
  createdAt!: Date;

  // Compteurs calcules par DecisionService.comites() - pratiques pour la
  // page de liste des comites, sans avoir a exposer le tableau complet des
  // decisions ici.
  @Field(() => Int)
  nombreTraites!: number;

  @Field(() => Int)
  nombreApprouves!: number;

  @Field(() => Int)
  nombreRefuses!: number;

  @Field(() => Int)
  nombreAjournes!: number;
}
