import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { UserNotificationPreferenceModuleBase } from "./base/userNotificationPreference.module.base";
import { UserNotificationPreferenceService } from "./userNotificationPreference.service";
import { UserNotificationPreferenceController } from "./userNotificationPreference.controller";
import { UserNotificationPreferenceResolver } from "./userNotificationPreference.resolver";

@Module({
  imports: [UserNotificationPreferenceModuleBase, forwardRef(() => AuthModule)],
  controllers: [UserNotificationPreferenceController],
  providers: [
    UserNotificationPreferenceService,
    UserNotificationPreferenceResolver,
  ],
  exports: [UserNotificationPreferenceService],
})
export class UserNotificationPreferenceModule {}
