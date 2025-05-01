import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AideModuleBase } from "./base/aide.module.base";
import { AideService } from "./aide.service";
import { AideController } from "./aide.controller";
import { AideResolver } from "./aide.resolver";
import { DemandeModule } from "src/demande/demande.module";

@Module({
  imports: [AideModuleBase, forwardRef(() => AuthModule),DemandeModule],
  controllers: [AideController],
  providers: [AideService, AideResolver],
  exports: [AideService],
})
export class AideModule {}
