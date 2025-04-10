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
import { DocumentUpdateManyWithoutTypeDocumentsInput } from "./DocumentUpdateManyWithoutTypeDocumentsInput";
import {
  ValidateNested,
  IsOptional,
  IsString,
  MaxLength,
  IsEnum,
} from "class-validator";
import { Type } from "class-transformer";
import { EnumTypeDocumentRattachement } from "./EnumTypeDocumentRattachement";

@InputType()
class TypeDocumentUpdateInput {
  @ApiProperty({
    required: false,
    type: () => DocumentUpdateManyWithoutTypeDocumentsInput,
  })
  @ValidateNested()
  @Type(() => DocumentUpdateManyWithoutTypeDocumentsInput)
  @IsOptional()
  @Field(() => DocumentUpdateManyWithoutTypeDocumentsInput, {
    nullable: true,
  })
  documents?: DocumentUpdateManyWithoutTypeDocumentsInput;

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
  label?: string;

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

export { TypeDocumentUpdateInput as TypeDocumentUpdateInput };
