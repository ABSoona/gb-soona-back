import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DemandeDetteDetailModuleBase } from "./base/demandeDetteDetail.module.base";
import { DemandeDetteDetailService } from "./demandeDetteDetail.service";
import { DemandeDetteDetailController } from "./demandeDetteDetail.controller";
import { DemandeDetteDetailResolver } from "./demandeDetteDetail.resolver";

@Module({
  imports: [DemandeDetteDetailModuleBase, forwardRef(() => AuthModule)],
  controllers: [DemandeDetteDetailController],
  providers: [DemandeDetteDetailService, DemandeDetteDetailResolver],
  exports: [DemandeDetteDetailService],
})
export class DemandeDetteDetailModule {}
