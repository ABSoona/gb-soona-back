import * as graphql from "@nestjs/graphql";
import * as nestAccessControl from "nest-access-control";
import * as gqlACGuard from "../auth/gqlAC.guard";
import { GqlDefaultAuthGuard } from "../auth/gqlDefaultAuth.guard";
import * as common from "@nestjs/common";
import { TypeDocumentResolverBase } from "./base/typeDocument.resolver.base";
import { TypeDocument } from "./base/TypeDocument";
import { TypeDocumentService } from "./typeDocument.service";

@common.UseGuards(GqlDefaultAuthGuard, gqlACGuard.GqlACGuard)
@graphql.Resolver(() => TypeDocument)
export class TypeDocumentResolver extends TypeDocumentResolverBase {
  constructor(
    protected readonly service: TypeDocumentService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }
}
