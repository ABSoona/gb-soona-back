import { registerEnumType } from "@nestjs/graphql";

export enum EnumDecisionType {
  Approbation = "Approbation",
  Refus = "Refus",
  Ajournement = "Ajournement",
}

registerEnumType(EnumDecisionType, {
  name: "EnumDecisionType",
});
