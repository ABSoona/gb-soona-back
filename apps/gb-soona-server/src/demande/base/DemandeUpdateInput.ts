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

import {
  IsString,
  MaxLength,
  IsOptional,
  IsInt,
  Max,
  IsEnum,
  ValidateNested,
  IsDate,
} from "class-validator";

import { EnumDemandeCategorieDemandeur } from "./EnumDemandeCategorieDemandeur";
import { ContactWhereUniqueInput } from "../../contact/base/ContactWhereUniqueInput";
import { Type } from "class-transformer";
import { DocumentUpdateManyWithoutDemandesInput } from "./DocumentUpdateManyWithoutDemandesInput";

@InputType()
class DemandeUpdateInput {
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
  agesEnfants?: string | null;

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
  apl?: number | null;

  @ApiProperty({
    required: false,
    type: String,
  })
  @IsString()
  @MaxLength(2560)
  @IsOptional()
  @Field(() => String, {
    nullable: true,
  })
  autresAides?: string | null;

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
  autresCharges?: number | null;

  @ApiProperty({
    required: false,
    enum: EnumDemandeCategorieDemandeur,
  })
  @IsEnum(EnumDemandeCategorieDemandeur)
  @IsOptional()
  @Field(() => EnumDemandeCategorieDemandeur, {
    nullable: true,
  })
  categorieDemandeur?: "LourdementEndett" | "NCessiteux" | "Pauvre" | null;

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
  contact?: ContactWhereUniqueInput;

  @ApiProperty({
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  @Field(() => Date, {
    nullable: true,
  })
  dateVisite?: Date | null;

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
  dettes?: number | null;

  @ApiProperty({
    required: false,
    type: () => DocumentUpdateManyWithoutDemandesInput,
  })
  @ValidateNested()
  @Type(() => DocumentUpdateManyWithoutDemandesInput)
  @IsOptional()
  @Field(() => DocumentUpdateManyWithoutDemandesInput, {
    nullable: true,
  })
  documents?: DocumentUpdateManyWithoutDemandesInput;

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
  facturesEnergie?: number | null;

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
  loyer?: number | null;

  @ApiProperty({
    required: false,
    type: String,
  })
  @IsString()
  @MaxLength(2560)
  @IsOptional()
  @Field(() => String, {
    nullable: true,
  })
  natureDettes?: string | null;

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
  nombreEnfants?: number | null;

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
  remarques?: string | null;

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
  revenus?: number | null;

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
  revenusConjoint?: number | null;

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
  situationFamiliale?: string | null;

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
  situationProConjoint?: string | null;

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
  situationProfessionnelle?: string | null;

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
}

export { DemandeUpdateInput as DemandeUpdateInput };
