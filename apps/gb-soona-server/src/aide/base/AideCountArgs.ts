/*
------------------------------------------------------------------------------ 
This code was generated by Amplication. 
 
Changes to this file will be lost if the code is regenerated. 

There are other ways to to customize your code, see this doc to learn more
https://docs.amplication.com/how-to/custom-code

------------------------------------------------------------------------------
  */
import { ArgsType, Field } from "@nestjs/graphql";
import { ApiProperty } from "@nestjs/swagger";
import { AideWhereInput } from "./AideWhereInput";
import { Type } from "class-transformer";

@ArgsType()
class AideCountArgs {
  @ApiProperty({
    required: false,
    type: () => AideWhereInput,
  })
  @Field(() => AideWhereInput, { nullable: true })
  @Type(() => AideWhereInput)
  where?: AideWhereInput;
}

export { AideCountArgs as AideCountArgs };
