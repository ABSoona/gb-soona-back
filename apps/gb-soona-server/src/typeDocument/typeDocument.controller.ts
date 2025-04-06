import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import * as nestAccessControl from "nest-access-control";
import { TypeDocumentService } from "./typeDocument.service";
import { TypeDocumentControllerBase } from "./base/typeDocument.controller.base";

@swagger.ApiTags("typeDocuments")
@common.Controller("typeDocuments")
export class TypeDocumentController extends TypeDocumentControllerBase {
  constructor(
    protected readonly service: TypeDocumentService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }
}
