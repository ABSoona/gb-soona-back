import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import * as nestAccessControl from "nest-access-control";
import { FileInterceptor } from "@nestjs/platform-express";
import { DocumentService } from "./document.service";
import { DocumentControllerBase } from "./base/document.controller.base";
import { Public } from "../decorators/public.decorator";
import { TokenService } from "../auth/token.service";

const STATUTS_DEMANDE_INACTIFS = ["clôturée", "refusée", "Abandonnée"];

@swagger.ApiTags("documents")
@common.Controller("documents")
export class DocumentController extends DocumentControllerBase {
  constructor(
    protected readonly service: DocumentService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder,
    private readonly tokenService: TokenService
  ) {
    super(service, rolesBuilder);
  }

  private resolveUploadToken(token: string): { demandeId: number } {
    if (!token) {
      throw new common.BadRequestException("Lien invalide.");
    }
    try {
      return this.tokenService.decodeDocumentUploadToken(token);
    } catch {
      throw new common.BadRequestException("Ce lien a expiré ou est invalide.");
    }
  }

  // Infos publiques necessaires a la page de depot (nom du beneficiaire,
  // types de documents proposes, statut actif ou non de la demande) - pas
  // de donnees sensibles au-dela du prenom/nom deja connus du beneficiaire.
  @Public()
  @common.Get("public-upload-info")
  async getPublicUploadInfo(@common.Query("token") token: string) {
    const { demandeId } = this.resolveUploadToken(token);
    const demande = await this.service.getDemandeInfoForPublicUpload(demandeId);
    if (!demande) {
      throw new common.NotFoundException("Demande introuvable.");
    }
    const typeDocuments = await this.service.getTypeDocumentsForPublicUpload();

    return {
      contactNom: demande.contact?.nom ?? null,
      contactPrenom: demande.contact?.prenom ?? null,
      demandeActive: !STATUTS_DEMANDE_INACTIFS.includes(demande.status ?? ""),
      typeDocuments: typeDocuments.map((t) => ({
        id: t.id,
        label: t.label,
        rattachement: t.rattachement,
        description: t.description,
      })),
    };
  }

  @Public()
  @common.Post("public-upload")
  @common.UseInterceptors(FileInterceptor("file"))
  @swagger.ApiConsumes("multipart/form-data")
  async publicUpload(
    @common.Body("token") token: string,
    @common.Body("typeDocumentId") typeDocumentId: string,
    @common.UploadedFile() file: Express.Multer.File
  ) {
    const { demandeId } = this.resolveUploadToken(token);
    const demande = await this.service.getDemandeInfoForPublicUpload(demandeId);
    if (!demande) {
      throw new common.NotFoundException("Demande introuvable.");
    }
    if (STATUTS_DEMANDE_INACTIFS.includes(demande.status ?? "")) {
      throw new common.BadRequestException("Cette demande n'est plus active.");
    }
    if (!file) {
      throw new common.BadRequestException("Fichier manquant.");
    }

    const typeDoc = await this.service.getTypeDocumentById(Number(typeDocumentId));
    if (
      !typeDoc ||
      !typeDoc.publicUploadEnabled ||
      !["Contact", "Demande"].includes(typeDoc.rattachement)
    ) {
      throw new common.BadRequestException("Type de document invalide.");
    }
    if (typeDoc.rattachement === "Contact" && !demande.contact) {
      throw new common.BadRequestException("Bénéficiaire introuvable.");
    }

    const created = await this.service.createDocument({
      data: {
        name: file.originalname,
        contenu: {},
        uploadedByBeneficiaire: true,
        typeDocument: { connect: { id: typeDoc.id } },
        demande: typeDoc.rattachement === "Demande" ? { connect: { id: demandeId } } : undefined,
        contact:
          typeDoc.rattachement === "Contact" ? { connect: { id: demande.contact!.id } } : undefined,
      },
    });

    await this.service.uploadContenu(
      { where: { id: created.id } },
      Object.assign(file, { filename: file.originalname })
    );

    await this.service.logDepotBeneficiaireActivity(demandeId, typeDoc.label);

    return { id: created.id };
  }

  // Marque un justificatif depose par le beneficiaire comme consulte (fait
  // disparaitre la pastille correspondante dans l'app). Endpoint
  // authentifie normal (garde heritee de DocumentControllerBase).
  @common.Patch(":id/mark-consulted")
  async markConsulted(@common.Param("id") id: string) {
    return this.service.markConsulted(id);
  }
}
