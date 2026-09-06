import { Field, InputType } from "@nestjs/graphql";
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { EnumDemandeCategorieDemandeur } from "./EnumDemandeCategorieDemandeur";

@InputType({
  isAbstract: true,
})
export class EnumDemandeCategorieDemandeurNullableFilter {
  @ApiProperty({
    required: false,
    enum: EnumDemandeCategorieDemandeur,
  })
  @IsOptional()
  @Field(() => EnumDemandeCategorieDemandeur, {
    nullable: true,
  })
  equals?: "LourdementEndett" | "NCessiteux" | "Pauvre" | null;

  @ApiProperty({
    required: false,
    enum: EnumDemandeCategorieDemandeur,
    isArray: true,
  })
  @IsOptional()
  @Field(() => [EnumDemandeCategorieDemandeur], {
    nullable: true,
  })
  in?: Array<"LourdementEndett" | "NCessiteux" | "Pauvre"> | null;

  @ApiProperty({
    required: false,
    enum: EnumDemandeCategorieDemandeur,
    isArray: true,
  })
  @IsOptional()
  @Field(() => [EnumDemandeCategorieDemandeur], {
    nullable: true,
  })
  notIn?: Array<"LourdementEndett" | "NCessiteux" | "Pauvre"> | null;
}
