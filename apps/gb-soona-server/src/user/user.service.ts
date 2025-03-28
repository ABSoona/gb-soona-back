
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PasswordService } from "../auth/password.service";
import { UserServiceBase } from "./base/user.service.base";
import { Prisma } from "@prisma/client";
import { EnumUserNotificationPreferenceTypeField } from "src/userNotificationPreference/base/EnumUserNotificationPreferenceTypeField";
import {
  User as PrismaUser,
} from "@prisma/client";
@Injectable()
export class UserService extends UserServiceBase {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly passwordService: PasswordService,

  ) {
    super(prisma, passwordService);
  }
  async createUser(args: Prisma.UserCreateArgs): Promise<PrismaUser> {
    // 1. Appel à la méthode générée pour créer l’utilisateur (avec hash du mot de passe)
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
 
}
