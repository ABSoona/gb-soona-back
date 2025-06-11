import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import * as nestAccessControl from "nest-access-control";
import { InvitationService } from "./invitation.service";
import { InvitationControllerBase } from "./base/invitation.controller.base";
import { Get, Query, Res } from "@nestjs/common";
import { Public } from "src/decorators/public.decorator";

@swagger.ApiTags("invitations")
@common.Controller("invitations")
export class InvitationController extends InvitationControllerBase {
  constructor(
    protected readonly service: InvitationService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }

  @Get('by-token')
  @Public() 
  async  getPdf(
    @Query('token') token: string,
    )  {
      
      return  this.service.invitationWithToken(token)
  }
}
