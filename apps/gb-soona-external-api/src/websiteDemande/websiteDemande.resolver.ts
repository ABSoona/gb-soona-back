import * as graphql from "@nestjs/graphql";
import { WebsiteDemandeResolverBase } from "./base/websiteDemande.resolver.base";
import { WebsiteDemande } from "./base/WebsiteDemande";
import { WebsiteDemandeService } from "./websiteDemande.service";

@graphql.Resolver(() => WebsiteDemande)
export class WebsiteDemandeResolver extends WebsiteDemandeResolverBase {
  constructor(protected readonly service: WebsiteDemandeService) {
    super(service);
  }
}
