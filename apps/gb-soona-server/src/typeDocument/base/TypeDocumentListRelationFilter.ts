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
import { TypeDocumentWhereInput } from "./TypeDocumentWhereInput";
import { ValidateNested, IsOptional } from "class-validator";
import { Type } from "class-transformer";

@InputType()
class TypeDocumentListRelationFilter {
  @ApiProperty({
    required: false,
    type: () => TypeDocumentWhereInput,
  })
  @ValidateNested()
  @Type(() => TypeDocumentWhereInput)
  @IsOptional()
  @Field(() => TypeDocumentWhereInput, {
    nullable: true,
  })
  every?: TypeDocumentWhereInput;

  @ApiProperty({
    required: false,
    type: () => TypeDocumentWhereInput,
  })
  @ValidateNested()
  @Type(() => TypeDocumentWhereInput)
  @IsOptional()
  @Field(() => TypeDocumentWhereInput, {
    nullable: true,
  })
  some?: TypeDocumentWhereInput;

  @ApiProperty({
    required: false,
    type: () => TypeDocumentWhereInput,
  })
  @ValidateNested()
  @Type(() => TypeDocumentWhereInput)
  @IsOptional()
  @Field(() => TypeDocumentWhereInput, {
    nullable: true,
  })
  none?: TypeDocumentWhereInput;
}
export { TypeDocumentListRelationFilter as TypeDocumentListRelationFilter };
