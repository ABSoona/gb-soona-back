import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { TypeDocumentModuleBase } from "./base/typeDocument.module.base";
import { TypeDocumentService } from "./typeDocument.service";
import { TypeDocumentController } from "./typeDocument.controller";
import { TypeDocumentResolver } from "./typeDocument.resolver";

@Module({
  imports: [TypeDocumentModuleBase, forwardRef(() => AuthModule)],
  controllers: [TypeDocumentController],
  providers: [TypeDocumentService, TypeDocumentResolver],
  exports: [TypeDocumentService],
})
export class TypeDocumentModule {}
