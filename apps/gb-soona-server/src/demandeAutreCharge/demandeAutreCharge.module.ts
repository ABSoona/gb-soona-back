import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DemandeAutreChargeModuleBase } from "./base/demandeAutreCharge.module.base";
import { DemandeAutreChargeService } from "./demandeAutreCharge.service";
import { DemandeAutreChargeController } from "./demandeAutreCharge.controller";
import { DemandeAutreChargeResolver } from "./demandeAutreCharge.resolver";

@Module({
  imports: [DemandeAutreChargeModuleBase, forwardRef(() => AuthModule)],
  controllers: [DemandeAutreChargeController],
  providers: [DemandeAutreChargeService, DemandeAutreChargeResolver],
  exports: [DemandeAutreChargeService],
})
export class DemandeAutreChargeModule {}
