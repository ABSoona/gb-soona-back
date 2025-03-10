import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import * as nestAccessControl from "nest-access-control";
import { DocumentService } from "./document.service";
import { DocumentControllerBase } from "./base/document.controller.base";

@swagger.ApiTags("documents")
@common.Controller("documents")
export class DocumentController extends DocumentControllerBase {
  constructor(
    protected readonly service: DocumentService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }
}
