import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { VisiteModuleBase } from "./base/visite.module.base";
import { VisiteService } from "./visite.service";
import { VisiteController } from "./visite.controller";
import { VisiteResolver } from "./visite.resolver";

import { MailModule } from "src/mail/mail.module";

@Module({
  imports: [VisiteModuleBase, forwardRef(() => AuthModule),MailModule],
  controllers: [VisiteController],
  providers: [VisiteService, VisiteResolver],
  exports: [VisiteService],
})
export class VisiteModule {}
