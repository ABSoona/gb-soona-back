import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import * as nestAccessControl from "nest-access-control";
import { ContactService } from "./contact.service";
import { ContactControllerBase } from "./base/contact.controller.base";
import { Body, Controller, Post } from "@nestjs/common";
import { ContactWhereUniqueInput } from "./base/ContactWhereUniqueInput";

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

  @Post("/:id/send-message")  
  
  async sendMessage(
    @common.Param() params: ContactWhereUniqueInput,
    @common.Body() data: {objet:string,message:string}): Promise<void> {
    
    this.service.sendMessage(data.message,data.objet,params.id)
    
  }
}
