import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { UserModuleBase } from "./base/user.module.base";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { UserResolver } from "./user.resolver";
import { InvitationModule } from "src/invitation/invitation.module";
import { MailModule } from "src/mail/mail.module";
import { UserNotificationPreferenceModule } from "src/userNotificationPreference/userNotificationPreference.module";

@Module({
  imports: [UserModuleBase, forwardRef(() => AuthModule),forwardRef(() => InvitationModule),MailModule,UserNotificationPreferenceModule],
  controllers: [UserController],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
