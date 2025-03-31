import { Invitation } from 'src/invitation/base/Invitation';

import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PasswordService } from "../auth/password.service";
import { UserServiceBase } from "./base/user.service.base";
import { Prisma } from "@prisma/client";
import { EnumUserNotificationPreferenceTypeField } from "src/userNotificationPreference/base/EnumUserNotificationPreferenceTypeField";
import {
  User as PrismaUser,
} from "@prisma/client";

import { InvitationService } from "src/invitation/invitation.service";
import { UserNotificationPreferenceService } from 'src/userNotificationPreference/userNotificationPreference.service';
@Injectable()
export class UserService extends UserServiceBase {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly passwordService: PasswordService,
    protected readonly invitationService: InvitationService,
    protected readonly userNotificationPreferenceService: UserNotificationPreferenceService, 

  ) {
    super(prisma, passwordService);
  }
  async createUser(args: Prisma.UserCreateArgs): Promise<PrismaUser> {
    // 1. Appel à la méthode générée pour créer l’utilisateur (avec hash du mot de passe)

    const existingUser = await this.prisma.user.findFirst({
      where: { email: args.data.email },
    });
    
    if (existingUser) {

      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }
    const user = await super.createUser(args);

    // 2. Créer les préférences de notifications
    const notificationTypes = Object.values(EnumUserNotificationPreferenceTypeField);

    await this.prisma.userNotificationPreference.createMany({
      data: notificationTypes.map((type) => ({
        userId: user.id,
        typeField: type,
        active: true, 
      })),
    });

    // 3. Retourner l’utilisateur comme d’habitude
    return user;
  }

  async deleteUser(args: Prisma.UserDeleteArgs): Promise<PrismaUser> {
    // 1. Appel à la méthode générée pour créer l’utilisateur (avec hash du mot de passe)
  

    // 2. Créer les préférences de notifications
    const notificationTypes = Object.values(EnumUserNotificationPreferenceTypeField);

    const notifications = await this.userNotificationPreferenceService.userNotificationPreferences({ where :{userId :{equals : args.where.id}}});
    notifications.forEach(element => {
      this.userNotificationPreferenceService.deleteUserNotificationPreference({where :{id :element.id}})
    })
    const user = await super.deleteUser(args);
    // 3. Retourner l’utilisateur comme d’habitude
    return user;
  }

  async createUserWithUnvitation(args: Prisma.UserCreateArgs): Promise<PrismaUser> {
    // 1. Appel à la méthode générée pour créer l’utilisateur (avec hash du mot de passe)
    if(!args.data?.token )
      throw new BadRequestException('Invitation invalide');

    // 2. controler le token 

      const invitations = await this.invitationService.invitations({
        where: {token : {equals : args?.data?.token  },used:false},
      });    
      const invitation = invitations[0]
      if (!invitation || invitation.used) {
        throw new BadRequestException('Invitation invalide ou déjà utilisée');
      }
        
    const user = await this.createUser(args);
    await this.invitationService.updateInvitation({where : {id:invitation.id},data: {used:true}})
    // 3. Retourner l’utilisateur comme d’habitude
    return user;
  }
 
}
