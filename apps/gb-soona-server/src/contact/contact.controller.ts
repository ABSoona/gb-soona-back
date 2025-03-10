import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import * as nestAccessControl from "nest-access-control";
import { ContactService } from "./contact.service";
import { ContactControllerBase } from "./base/contact.controller.base";

@swagger.ApiTags("contacts")
@common.Controller("contacts")
export class ContactController extends ContactControllerBase {
  constructor(
    protected readonly service: ContactService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }
}
