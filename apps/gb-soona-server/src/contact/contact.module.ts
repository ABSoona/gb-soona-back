import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { ContactModuleBase } from "./base/contact.module.base";
import { ContactService } from "./contact.service";
import { ContactController } from "./contact.controller";
import { ContactResolver } from "./contact.resolver";
import { MailModule } from "src/mail/mail.module";

@Module({
  imports: [ContactModuleBase, forwardRef(() => AuthModule),MailModule],
  controllers: [ContactController],
  providers: [ContactService, ContactResolver],
  exports: [ContactService],
})
export class ContactModule {}
