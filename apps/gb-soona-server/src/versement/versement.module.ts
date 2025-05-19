import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { VersementModuleBase } from "./base/versement.module.base";
import { VersementService } from "./versement.service";
import { VersementController } from "./versement.controller";
import { VersementResolver } from "./versement.resolver";

import { DemandeModule } from "src/demande/demande.module";

@Module({
  imports: [VersementModuleBase,DemandeModule, forwardRef(() => AuthModule)],
  controllers: [VersementController],
  providers: [VersementService, VersementResolver],
  exports: [VersementService],
})
export class VersementModule {}
