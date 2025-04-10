import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Credentials } from "./Credentials";
import { PasswordService } from "./password.service";
import { TokenService } from "./token.service";
import { UserInfo } from "./UserInfo";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import { MailService } from "src/mail/mail.service";


@Injectable()
export class AuthService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {}

  async validateUser(
    username: string,
    password: string
  ): Promise<UserInfo | null> {
    const user = await this.userService.user({
      where: { username },
    });
    if (user && (await this.passwordService.compare(password, user.password))) {
      const { id, roles } = user;
      const roleList = roles as string[];
      return { id, username, roles: roleList };
    }
    return null;
  }
  async login(credentials: Credentials): Promise<UserInfo> {
    const { username, password } = credentials;
    const user = await this.validateUser(
      credentials.username,
      credentials.password
    );
    if (!user) {
      throw new UnauthorizedException("Email ou mot de passe incorrects");
    }
    const accessToken = await this.tokenService.createToken({
      id: user.id,
      username,
      password,
    });
    return {
      accessToken,
      ...user,
    };
  }

  async passwordRequest({ email }: { email: string }): Promise<void> {
    const users = await this.userService.users({ where: { email } });
  
    const user = users[0];
    if (!user || !user.email) return;
  
    const token = await this.tokenService.createTokenForPasswordReset(user.id);
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
    await this.mailService.sendUserMail('forgot-password',user.email, {resetLink},'Réinitialisation de votre mot de passe');
  }
  

  async resetPassword(data: {token:string,password:string} ): Promise<User> {
   

   const userId = await this.tokenService.decodeJwtToken(data.token)
  
    const user = await this.userService.user({
      where: { id:userId },
    });

    if (user && user?.email)    
    await this.mailService.sendUserMail('forgot-password',user.email, {},'Mot de passe modifié avec succès');
    
      return this.userService.updateUser({where:{id:userId},data:{password:data.password}})
   

  }

}


