/*
------------------------------------------------------------------------------ 
This code was generated by Amplication. 
 
Changes to this file will be lost if the code is regenerated. 

There are other ways to to customize your code, see this doc to learn more
https://docs.amplication.com/how-to/custom-code

------------------------------------------------------------------------------
  */
import { ObjectType, Field } from "@nestjs/graphql";
import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsEnum,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { EnumUserNotificationPreferenceTypeField } from "./EnumUserNotificationPreferenceTypeField";
import { User } from "../../user/base/User";

@ObjectType()
class UserNotificationPreference {
  @ApiProperty({
    required: true,
    type: Boolean,
  })
  @IsBoolean()
  @Field(() => Boolean)
  active!: boolean;

  @ApiProperty({
    required: true,
  })
  @IsDate()
  @Type(() => Date)
  @Field(() => Date)
  createdAt!: Date;

  @ApiProperty({
    required: true,
    type: Number,
  })
  @IsInt()
  @Field(() => Number)
  id!: number;

  @ApiProperty({
    required: true,
    enum: EnumUserNotificationPreferenceTypeField,
  })
  @IsEnum(EnumUserNotificationPreferenceTypeField)
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
    required: true,
  })
  @IsDate()
  @Type(() => Date)
  @Field(() => Date)
  updatedAt!: Date;

  @ApiProperty({
    required: true,
    type: () => User,
  })
  @ValidateNested()
  @Type(() => User)
  user?: User;
}

export { UserNotificationPreference as UserNotificationPreference };
