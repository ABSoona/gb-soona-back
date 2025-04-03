import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { InvitationModuleBase } from "./base/invitation.module.base";
import { InvitationService } from "./invitation.service";
import { InvitationController } from "./invitation.controller";
import { InvitationResolver } from "./invitation.resolver";
import { MailService } from "src/mail/mail.service";
import { UserService } from "src/user/user.service";
import { UserModule } from "src/user/user.module";
import { MailModule } from "src/mail/mail.module";

@Module({
  imports: [InvitationModuleBase, forwardRef(() => AuthModule),forwardRef(() => UserModule),MailModule],
  controllers: [InvitationController],
  providers: [InvitationService, InvitationResolver],
  exports: [InvitationService],
})
export class InvitationModule {}
