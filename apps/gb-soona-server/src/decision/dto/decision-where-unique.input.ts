import { InputType, Field } from "@nestjs/graphql";
import { IsInt } from "class-validator";
import { Transform } from "class-transformer";

// Permet de connecter une Decision existante depuis AideCreateInput (voir
// le champ "decision" ajoute a la main dans AideCreateInput.ts), sans avoir
// a repliquer tout le scaffold Amplication pour Decision.
@InputType()
export class DecisionWhereUniqueInput {
  @IsInt()
  @Transform((prop) => parseInt(prop.value), {
    toClassOnly: true,
  })
  @Field(() => Number)
  id!: number;
}
