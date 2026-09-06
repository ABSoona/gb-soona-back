import { Field, InputType } from "@nestjs/graphql";
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { EnumAideCrediteur } from "./EnumAideCrediteur";

@InputType({
  isAbstract: true,
})
export class EnumAideCrediteurNullableFilter {
  @ApiProperty({
    required: false,
    enum: EnumAideCrediteur,
  })
  @IsOptional()
  @Field(() => EnumAideCrediteur, {
    nullable: true,
  })
  equals?: "LeBNFiciaire" | "UnCrAncier" | null;

  @ApiProperty({
    required: false,
    enum: EnumAideCrediteur,
    isArray: true,
  })
  @IsOptional()
  @Field(() => [EnumAideCrediteur], {
    nullable: true,
  })
  in?: Array<"LeBNFiciaire" | "UnCrAncier"> | null;

  @ApiProperty({
    required: false,
    enum: EnumAideCrediteur,
    isArray: true,
  })
  @IsOptional()
  @Field(() => [EnumAideCrediteur], {
    nullable: true,
  })
  notIn?: Array<"LeBNFiciaire" | "UnCrAncier"> | null;
}
