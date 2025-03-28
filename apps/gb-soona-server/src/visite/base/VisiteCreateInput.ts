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
  IsDate,
  IsOptional,
  ValidateNested,
  IsString,
  MaxLength,
} from "class-validator";
import { Type } from "class-transformer";
import { DemandeWhereUniqueInput } from "../../demande/base/DemandeWhereUniqueInput";

@InputType()
class VisiteCreateInput {
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
    type: () => DemandeWhereUniqueInput,
  })
  @ValidateNested()
  @Type(() => DemandeWhereUniqueInput)
  @IsOptional()
  @Field(() => DemandeWhereUniqueInput, {
    nullable: true,
  })
  demande?: DemandeWhereUniqueInput | null;

  @ApiProperty({
    required: false,
    type: String,
  })
  @IsString()
  @MaxLength(12560)
  @IsOptional()
  @Field(() => String, {
    nullable: true,
  })
  rapportVisite?: string | null;
}

export { VisiteCreateInput as VisiteCreateInput };
