import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { UserModuleBase } from "./base/user.module.base";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { UserResolver } from "./user.resolver";
import { JwtModule } from "@nestjs/jwt";
import { TokenService } from "src/auth/token.service";
import { SecretsManagerModule } from "src/providers/secrets/secretsManager.module";
import { InvitationService } from "src/invitation/invitation.service";
import { InvitationModule } from "src/invitation/invitation.module";
import { MailModule } from "src/mail/mail.module";
import { UserNotificationPreference } from "src/userNotificationPreference/base/UserNotificationPreference";
import { UserNotificationPreferenceModule } from "src/userNotificationPreference/userNotificationPreference.module";

@Module({
  imports: [UserModuleBase, forwardRef(() => AuthModule),forwardRef(() => InvitationModule),MailModule,UserNotificationPreferenceModule],
  controllers: [UserController],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
