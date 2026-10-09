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
    async createTokenForShare(userId: string): Promise<string> {
        const secret = await this.secretsManager.getSecret<string>(EnumSecretsNameKey.JwtSecretKey);

        if (!secret) {
            throw new Error('Missing JWT secret');
        }
        return this.jwtService.signAsync(
            { userId }, // payload
            {
                secret,
                expiresIn: '168h',
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

    // Lien de depot de justificatifs envoye par email au beneficiaire (qui
    // n'a pas de compte). Le token encode uniquement la demande concernee ;
    // aucune colonne DB associee (contrairement a createTokenForShare), donc
    // pas de revocation cote serveur avant expiration (30 jours).
    async createTokenForDocumentUpload(demandeId: number): Promise<string> {
        const secret = await this.secretsManager.getSecret<string>(EnumSecretsNameKey.JwtSecretKey);

        if (!secret) {
            throw new Error('Missing JWT secret');
        }
        return this.jwtService.signAsync(
            { demandeId, purpose: 'docs-upload' },
            {
                secret,
                expiresIn: '720h', // 30 jours
            }
        );
    }

    decodeDocumentUploadToken(token: string): { demandeId: number } {
        const decoded: any = this.jwtService.verify(token);
        if (!decoded || decoded.purpose !== 'docs-upload' || typeof decoded.demandeId !== 'number') {
            throw new Error('Token invalide');
        }
        return { demandeId: decoded.demandeId };
    }
}
