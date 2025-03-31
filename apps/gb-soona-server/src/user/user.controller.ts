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

@swagger.ApiTags("users")
@common.Controller("users")
export class UserController extends UserControllerBase {
  constructor(
    protected readonly service: UserService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
   
  }

  @Post("/register")  
  async createUserWithUnvitation(@Body() data: UserCreateInput): Promise<User> {
    
    return await this.service.createUserWithUnvitation(
     {data: data,  select: {
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
    }, } 
    );
  }
  
}