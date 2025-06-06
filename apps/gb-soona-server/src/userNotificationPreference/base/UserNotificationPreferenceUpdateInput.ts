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
import { IsBoolean, IsOptional, IsEnum, ValidateNested } from "class-validator";
import { EnumUserNotificationPreferenceTypeField } from "./EnumUserNotificationPreferenceTypeField";
import { UserWhereUniqueInput } from "../../user/base/UserWhereUniqueInput";
import { Type } from "class-transformer";

@InputType()
class UserNotificationPreferenceUpdateInput {
  @ApiProperty({
    required: false,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, {
    nullable: true,
  })
  active?: boolean;

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

export { UserNotificationPreferenceUpdateInput as UserNotificationPreferenceUpdateInput };
