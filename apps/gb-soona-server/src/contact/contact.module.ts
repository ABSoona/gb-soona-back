import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { ContactModuleBase } from "./base/contact.module.base";
import { ContactService } from "./contact.service";
import { ContactController } from "./contact.controller";
import { ContactResolver } from "./contact.resolver";

@Module({
  imports: [ContactModuleBase, forwardRef(() => AuthModule)],
  controllers: [ContactController],
  providers: [ContactService, ContactResolver],
  exports: [ContactService],
})
export class ContactModule {}
