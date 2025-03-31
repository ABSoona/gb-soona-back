import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { InvitationModuleBase } from "./base/invitation.module.base";
import { InvitationService } from "./invitation.service";
import { InvitationController } from "./invitation.controller";
import { InvitationResolver } from "./invitation.resolver";
import { MailService } from "src/mail/mail.service";

@Module({
  imports: [InvitationModuleBase, forwardRef(() => AuthModule)],
  controllers: [InvitationController],
  providers: [InvitationService, InvitationResolver,MailService],
  exports: [InvitationService],
})
export class InvitationModule {}
