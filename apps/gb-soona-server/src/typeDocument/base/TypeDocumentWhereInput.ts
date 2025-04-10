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
import { DocumentListRelationFilter } from "../../document/base/DocumentListRelationFilter";
import { ValidateNested, IsOptional, IsEnum } from "class-validator";
import { Type } from "class-transformer";
import { IntFilter } from "../../util/IntFilter";
import { StringFilter } from "../../util/StringFilter";
import { EnumTypeDocumentRattachement } from "./EnumTypeDocumentRattachement";

@InputType()
class TypeDocumentWhereInput {
  @ApiProperty({
    required: false,
    type: () => DocumentListRelationFilter,
  })
  @ValidateNested()
  @Type(() => DocumentListRelationFilter)
  @IsOptional()
  @Field(() => DocumentListRelationFilter, {
    nullable: true,
  })
  documents?: DocumentListRelationFilter;

  @ApiProperty({
    required: false,
    type: IntFilter,
  })
  @Type(() => IntFilter)
  @IsOptional()
  @Field(() => IntFilter, {
    nullable: true,
  })
  id?: IntFilter;

  @ApiProperty({
    required: false,
    type: StringFilter,
  })
  @Type(() => StringFilter)
  @IsOptional()
  @Field(() => StringFilter, {
    nullable: true,
  })
  label?: StringFilter;

  @ApiProperty({
    required: false,
    enum: EnumTypeDocumentRattachement,
  })
  @IsEnum(EnumTypeDocumentRattachement)
  @IsOptional()
  @Field(() => EnumTypeDocumentRattachement, {
    nullable: true,
  })
  rattachement?: "Contact" | "Demande";
}

export { TypeDocumentWhereInput as TypeDocumentWhereInput };
