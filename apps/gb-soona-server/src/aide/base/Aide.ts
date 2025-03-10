/*
------------------------------------------------------------------------------ 
This code was generated by Amplication. 
 
Changes to this file will be lost if the code is regenerated. 

There are other ways to to customize your code, see this doc to learn more
https://docs.amplication.com/how-to/custom-code

------------------------------------------------------------------------------
  */
import { ObjectType, Field } from "@nestjs/graphql";
import { ApiProperty } from "@nestjs/swagger";
import { Contact } from "../../contact/base/Contact";

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

@ObjectType()
class Aide {
  @ApiProperty({
    required: false,
    type: () => Contact,
  })
  @ValidateNested()
  @Type(() => Contact)
  @IsOptional()
  contact?: Contact | null;

  @ApiProperty({
    required: true,
  })
  @IsDate()
  @Type(() => Date)
  @Field(() => Date)
  createdAt!: Date;

  @ApiProperty({
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  @Field(() => Date, {
    nullable: true,
  })
  dateAide!: Date | null;

  @ApiProperty({
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  @Field(() => Date, {
    nullable: true,
  })
  dateExpiration!: Date | null;

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
    | null;

  @ApiProperty({
    required: true,
    type: Number,
  })
  @IsInt()
  @Field(() => Number)
  id!: number;

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
  montant!: number | null;

  @ApiProperty({
    required: false,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, {
    nullable: true,
  })
  paiementRecurrent!: boolean | null;

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
  status!: string | null;

  @ApiProperty({
    required: false,
    type: String,
  })
  @IsString()
  @MaxLength(1000)
  @IsOptional()
  @Field(() => String, {
    nullable: true,
  })
  typeField!: string | null;

  @ApiProperty({
    required: true,
  })
  @IsDate()
  @Type(() => Date)
  @Field(() => Date)
  updatedAt!: Date;
}

export { Aide as Aide };
