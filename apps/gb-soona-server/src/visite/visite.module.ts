import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { VisiteModuleBase } from "./base/visite.module.base";
import { VisiteService } from "./visite.service";
import { VisiteController } from "./visite.controller";
import { VisiteResolver } from "./visite.resolver";

@Module({
  imports: [VisiteModuleBase, forwardRef(() => AuthModule)],
  controllers: [VisiteController],
  providers: [VisiteService, VisiteResolver],
  exports: [VisiteService],
})
export class VisiteModule {}
