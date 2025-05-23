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
import { BooleanFilter } from "../../util/BooleanFilter";
import { Type } from "class-transformer";
import { IsOptional, IsEnum, ValidateNested } from "class-validator";
import { IntFilter } from "../../util/IntFilter";
import { EnumUserNotificationPreferenceTypeField } from "./EnumUserNotificationPreferenceTypeField";
import { UserWhereUniqueInput } from "../../user/base/UserWhereUniqueInput";

@InputType()
class UserNotificationPreferenceWhereInput {
  @ApiProperty({
    required: false,
    type: BooleanFilter,
  })
  @Type(() => BooleanFilter)
  @IsOptional()
  @Field(() => BooleanFilter, {
    nullable: true,
  })
  active?: BooleanFilter;

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
    enum: EnumUserNotificationPreferenceTypeField,
  })
  @IsEnum(EnumUserNotificationPreferenceTypeField)
  @IsOptional()
  @Field(() => EnumUserNotificationPreferenceTypeField, {
    nullable: true,
  })
  typeField?:
    | "NouvelleDemande"
    | "DemandeEnVisite"
    | "DemandeEnCommission"
    | "ContactBan"
    | "AideExpir"
    | "ErreursDemandes"
    | "DemandeAffecte";

  @ApiProperty({
    required: false,
    type: () => UserWhereUniqueInput,
  })
  @ValidateNested()
  @Type(() => UserWhereUniqueInput)
  @IsOptional()
  @Field(() => UserWhereUniqueInput, {
    nullable: true,
  })
  user?: UserWhereUniqueInput;
}

export { UserNotificationPreferenceWhereInput as UserNotificationPreferenceWhereInput };
