import { InputType, Field, Int } from "@nestjs/graphql";
import { IsInt, IsOptional, IsString } from "class-validator";
import { EnumDecisionType } from "../models/enum-decision-type";

@InputType()
export class CreateDecisionInput {
  @Field(() => Int)
  @IsInt()
  demandeId!: number;

  @Field(() => EnumDecisionType)
  type!: EnumDecisionType;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  motivation?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  acteurId?: string;
}
