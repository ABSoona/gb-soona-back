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
    @common.Body() data: {objet:string,message:string,demandeId?:number,includeUploadLink?:boolean}): Promise<void> {

    try {
      await this.service.sendMessage(data.message,data.objet,params.id,data.demandeId,data.includeUploadLink)
    } catch (e) {
      throw new common.BadRequestException((e as Error).message);
    }

  }

  @Post("/:id/send-whatsapp-message")
  async sendWhatsappMessage(
    @common.Param() params: ContactWhereUniqueInput,
    @common.Body() data: { message: string }): Promise<void> {

    try {
      await this.service.sendWhatsAppMessage(data.message, params.id)
    } catch (e) {
      throw new common.BadRequestException((e as Error).message);
    }

  }
}
