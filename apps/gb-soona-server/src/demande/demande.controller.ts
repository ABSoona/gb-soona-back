import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import * as nestAccessControl from "nest-access-control";
import { DemandeService } from "./demande.service";
import { DemandeControllerBase } from "./base/demande.controller.base";
import {  Get, Param,  Put,  Query,  Res } from "@nestjs/common";
import { Response } from 'express'; // ✅ Correct import
import { TokenService } from "src/auth/token.service";
import { Public } from "src/decorators/public.decorator";

@swagger.ApiTags("demandes")
@common.Controller("demandes")
export class DemandeController extends DemandeControllerBase {
  constructor(
    protected readonly service: DemandeService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }

  @Get(':id/pdf')
  @Public() 
  async  getPdf(
    @Param('id') id: number,
    @Query('token') token: string,
    @Res() res: Response,
  )  {
    return this.service.donwloadDemande(id,token,res)
  }
  @Get(':id/authenticated-pdf')
  async  getAuthenticatedPdf(
    @Param('id') id: number,   
    @Res() res: Response,
  )  {
    return this.service.donwloadAuthDemande(id,res)
  }

  @Put(':id/share')

  async share(@Param('id') id: number,
    @common.Body() data: {userId:string,subordoneId:string}
  ): Promise<void>{
    await this.service.share({demandeId:id,...data});
    
  }
  
}