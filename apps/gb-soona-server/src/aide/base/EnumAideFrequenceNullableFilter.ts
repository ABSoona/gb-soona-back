import { Field, InputType } from "@nestjs/graphql";
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { EnumAideFrequence } from "./EnumAideFrequence";

type AideFrequenceValue =
  | "Mensuelle"
  | "BiMensuelle"
  | "Trimestrielle"
  | "Hebdomadaire"
  | "Unefois";

@InputType({
  isAbstract: true,
})
export class EnumAideFrequenceNullableFilter {
  @ApiProperty({
    required: false,
    enum: EnumAideFrequence,
  })
  @IsOptional()
  @Field(() => EnumAideFrequence, {
    nullable: true,
  })
  equals?: AideFrequenceValue | null;

  @ApiProperty({
    required: false,
    enum: EnumAideFrequence,
    isArray: true,
  })
  @IsOptional()
  @Field(() => [EnumAideFrequence], {
    nullable: true,
  })
  in?: Array<AideFrequenceValue> | null;

  @ApiProperty({
    required: false,
    enum: EnumAideFrequence,
    isArray: true,
  })
  @IsOptional()
  @Field(() => [EnumAideFrequence], {
    nullable: true,
  })
  notIn?: Array<AideFrequenceValue> | null;
}
