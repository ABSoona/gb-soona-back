import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DemandeActivityModuleBase } from "./base/demandeActivity.module.base";
import { DemandeActivityService } from "./demandeActivity.service";
import { DemandeActivityController } from "./demandeActivity.controller";
import { DemandeActivityResolver } from "./demandeActivity.resolver";

@Module({
  imports: [DemandeActivityModuleBase, forwardRef(() => AuthModule)],
  controllers: [DemandeActivityController],
  providers: [DemandeActivityService, DemandeActivityResolver],
  exports: [DemandeActivityService],
})
export class DemandeActivityModule {}
