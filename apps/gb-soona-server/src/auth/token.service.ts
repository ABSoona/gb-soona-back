import { UserService } from './../user/user.service';
import { JwtService } from "@nestjs/jwt";
import { ITokenService } from "./ITokenService";

import { TokenServiceBase } from "./base/token.service.base";
import { EnumSecretsNameKey } from "src/providers/secrets/secretsNameKey.enum";
import { SecretsManagerService } from "src/providers/secrets/secretsManager.service";
import { Injectable } from "@nestjs/common";
@Injectable()
export class TokenService extends TokenServiceBase implements ITokenService {
    constructor(protected readonly jwtService: JwtService,
        private readonly secretsManager: SecretsManagerService) {
        super(jwtService); // <-- Important ! Appelle le constructeur parent
    }

    async createTokenForPasswordReset(userId: string): Promise<string> {
        const secret = await this.secretsManager.getSecret<string>(EnumSecretsNameKey.JwtSecretKey);

        if (!secret) {
            throw new Error('Missing JWT secret');
        }
        return this.jwtService.signAsync(
            { userId }, // payload
            {
                secret,
                expiresIn: '1h',
            }
        );
    }

    async decodeJwtToken(token: string): Promise<string> {
        const secret = await this.secretsManager.getSecret<string>(EnumSecretsNameKey.JwtSecretKey);
        const decoded: any =  this.jwtService.verify(token); 
        if (!decoded) {
            throw new Error('Token is invalide');
        }           
        return decoded.userId;
        
    }
}
