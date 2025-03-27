import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UserNotificationPreferenceServiceBase } from "./base/userNotificationPreference.service.base";

@Injectable()
export class UserNotificationPreferenceService extends UserNotificationPreferenceServiceBase {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}
