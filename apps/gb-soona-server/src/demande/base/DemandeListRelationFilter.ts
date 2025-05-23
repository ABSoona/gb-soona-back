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
import { DemandeWhereInput } from "./DemandeWhereInput";
import { ValidateNested, IsOptional } from "class-validator";
import { Type } from "class-transformer";

@InputType()
class DemandeListRelationFilter {
  @ApiProperty({
    required: false,
    type: () => DemandeWhereInput,
  })
  @ValidateNested()
  @Type(() => DemandeWhereInput)
  @IsOptional()
  @Field(() => DemandeWhereInput, {
    nullable: true,
  })
  every?: DemandeWhereInput;

  @ApiProperty({
    required: false,
    type: () => DemandeWhereInput,
  })
  @ValidateNested()
  @Type(() => DemandeWhereInput)
  @IsOptional()
  @Field(() => DemandeWhereInput, {
    nullable: true,
  })
  some?: DemandeWhereInput;

  @ApiProperty({
    required: false,
    type: () => DemandeWhereInput,
  })
  @ValidateNested()
  @Type(() => DemandeWhereInput)
  @IsOptional()
  @Field(() => DemandeWhereInput, {
    nullable: true,
  })
  none?: DemandeWhereInput;
}
export { DemandeListRelationFilter as DemandeListRelationFilter };
