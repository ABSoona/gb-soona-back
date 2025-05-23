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
import { DemandeWhereUniqueInput } from "../../demande/base/DemandeWhereUniqueInput";
import { ValidateNested, IsString, MaxLength } from "class-validator";
import { Type } from "class-transformer";

@InputType()
class DemandeStatusHistoryCreateInput {
  @ApiProperty({
    required: true,
    type: () => DemandeWhereUniqueInput,
  })
  @ValidateNested()
  @Type(() => DemandeWhereUniqueInput)
  @Field(() => DemandeWhereUniqueInput)
  demande!: DemandeWhereUniqueInput;

  @ApiProperty({
    required: true,
    type: String,
  })
  @IsString()
  @MaxLength(256)
  @Field(() => String)
  status!: string;
}

export { DemandeStatusHistoryCreateInput as DemandeStatusHistoryCreateInput };
