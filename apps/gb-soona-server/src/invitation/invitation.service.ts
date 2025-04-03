import { Invitation } from './../../node_modules/.prisma/client/index.d';
import { MailService } from 'src/mail/mail.service';
import { BadRequestException, ConflictException, Inject, Injectable, forwardRef } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { InvitationServiceBase } from "./base/invitation.service.base";
import { Prisma, Invitation as PrismaInvitation } from "@prisma/client";
import { randomBytes } from 'crypto'; 
import { UserService } from 'src/user/user.service';

@Injectable()
export class InvitationService extends InvitationServiceBase {
  constructor(protected readonly prisma: PrismaService,
    protected readonly mailService: MailService,
    @Inject(forwardRef(() => UserService)) //
    protected readonly userService: UserService  ) {
    super(prisma);
  }
  async createInvitation(
    args: Prisma.InvitationCreateArgs
  ): Promise<PrismaInvitation> {

    const token = randomBytes(24).toString('hex');
    // 2. Ajouter le token dans les données
    args.data.token = token;
    const existingInvitation = await this.prisma.invitation.findFirst({
      where: { email:{equals : args.data.email} ,used : {equals:false} },
    });
    console.log("test invitation")
    let invitation :Invitation
    if (existingInvitation) {
      console.log("user existant")
       invitation = await super.updateInvitation({
        where: { id:existingInvitation.id} , data:{token:token, role:args.data.role} ,
      });
    }
    else{          
      console.log("avant creation",args)
       invitation = await super.createInvitation(args);
    }


    const existingUser = await this.userService.users({
      where: { email: args.data.email },
    });
    
    if (existingUser.length>0) {

      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    // 2. Envoyer une notification
    
     const lien_invitation = `${process.env.FRONTEND_URL}/sign-up?token=${token}`;
     const message = invitation?.message || ''
     
     await this.mailService.sendUserMail('nouvelle-invitation',args.data.email,{lien_invitation , message},'Invitation à rejoindre GB soona');

     // 3. Retourne la invitation comme d’habitude
   return invitation;
  }
}
