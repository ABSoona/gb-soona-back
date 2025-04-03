import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { Credentials } from "../auth/Credentials";
import { UserInfo } from "./UserInfo";
import { User } from "src/user/base/User";

@ApiTags("auth")
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post("login")
  async login(@Body() body: Credentials): Promise<UserInfo> {
    return this.authService.login(body);
  }

  
  @Post("/forgot-password")  
  async passwordRequest(@Body() data: {email:string}): Promise<void> {
    
    return await this.authService.passwordRequest(
      {email : data.email}
    );
  }

  @Post("/reset-password")  
  async resetPassword(@Body() data: {token:string,password:string}): Promise<User> {
    
    return await this.authService.resetPassword(
      data
    );
  }
}


