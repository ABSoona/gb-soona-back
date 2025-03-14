/*
------------------------------------------------------------------------------ 
This code was generated by Amplication. 
 
Changes to this file will be lost if the code is regenerated. 

There are other ways to to customize your code, see this doc to learn more
https://docs.amplication.com/how-to/custom-code

------------------------------------------------------------------------------
  */
import { InputType, Field } from "@nestjs/graphql";
import { ApiProperty } from "@nestjs/swagger";
import { ContactWhereUniqueInput } from "../../contact/base/ContactWhereUniqueInput";

import {
  ValidateNested,
  IsOptional,
  IsDate,
  IsEnum,
  IsInt,
  Max,
  IsBoolean,
  IsString,
  MaxLength,
} from "class-validator";

import { Type } from "class-transformer";
import { EnumAideFrequence } from "./EnumAideFrequence";
import { EnumAideTypeField } from "./EnumAideTypeField";

@InputType()
class AideCreateInput {
  @ApiProperty({
    required: false,
    type: () => ContactWhereUniqueInput,
  })
  @ValidateNested()
  @Type(() => ContactWhereUniqueInput)
  @IsOptional()
  @Field(() => ContactWhereUniqueInput, {
    nullable: true,
  })
  contact?: ContactWhereUniqueInput | null;

  @ApiProperty({
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  @Field(() => Date, {
    nullable: true,
  })
  dateAide?: Date | null;

  @ApiProperty({
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  @Field(() => Date, {
    nullable: true,
  })
  dateExpiration?: Date | null;

  @ApiProperty({
    required: false,
    enum: EnumAideFrequence,
  })
  @IsEnum(EnumAideFrequence)
  @IsOptional()
  @Field(() => EnumAideFrequence, {
    nullable: true,
  })
  frequence?:
    | "Mensuelle"
    | "BiMensuelle"
    | "Trimestrielle"
    | "Hebdomadaire"
    | "Unefois"
    | null;

  @ApiProperty({
    required: false,
    type: Number,
  })
  @IsInt()
  @Max(99999999999)
  @IsOptional()
  @Field(() => Number, {
    nullable: true,
  })
  montant?: number | null;

  @ApiProperty({
    required: false,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, {
    nullable: true,
  })
  paiementRecurrent?: boolean | null;

  @ApiProperty({
    required: false,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, {
    nullable: true,
  })
  reexaminer?: boolean | null;

  @ApiProperty({
    required: false,
    type: String,
  })
  @IsString()
  @MaxLength(256)
  @IsOptional()
  @Field(() => String, {
    nullable: true,
  })
  status?: string | null;

  @ApiProperty({
    required: false,
    enum: EnumAideTypeField,
  })
  @IsEnum(EnumAideTypeField)
  @IsOptional()
  @Field(() => EnumAideTypeField, {
    nullable: true,
  })
  typeField?: "Alimentaire" | null;
}

export { AideCreateInput as AideCreateInput };
