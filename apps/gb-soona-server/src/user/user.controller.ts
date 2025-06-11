import { Prisma } from '@prisma/client';
import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import * as nestAccessControl from "nest-access-control";
import { UserService } from "./user.service";
import { UserControllerBase } from "./base/user.controller.base";
import { AclValidateRequestInterceptor } from "src/interceptors/aclValidateRequest.interceptor";
import { Body, Controller, Post } from "@nestjs/common";
import { Invitation } from "src/invitation/base/Invitation";
import { User } from "./base/User";
import { UserCreateInput } from "./base/UserCreateInput";
import { MailService } from "src/mail/mail.service";
import { Public } from "src/decorators/public.decorator";

@swagger.ApiTags("users")
@common.Controller("users")
export class UserController extends UserControllerBase {
  constructor(
    protected readonly service: UserService,
    protected readonly mailService: MailService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
   
  }
  @Public()
  @Post("/register")  
  async createUserWithUnvitation(@Body() data: UserCreateInput): Promise<User> {
    
    return await this.service.createUserWithUnvitation(
     {data: {
      ...data,

      superieur: data.superieur
        ? {
            connect: data.superieur,
          }
        : undefined,
    },  select: {
      createdAt: true,
      email: true,
      firstName: true,
      id: true,
      lastName: true,
      role: true,
      roles: true,
      status: true,
      token: true,
      updatedAt: true,
      username: true,
      adresseRue: true,
      adresseCodePostal: true,
      adresseVille:true,

    }, } 
    );
  }
  @Post("/notify")
  async notify(
    @Body()
    data: {
      template: string;
      to: string;
      subject: string;
      variables: Record<string, string>;
    }
  ): Promise<void> {
    const { template, to, subject, variables } = data;
    console.log("donnée du mail",data);
    if (!template || !to || !subject) {
      throw new common.BadRequestException("template, to et subject sont requis");
    }
  
    await this.mailService.sendMailAsync(template, to, variables, subject);
  }
  
}