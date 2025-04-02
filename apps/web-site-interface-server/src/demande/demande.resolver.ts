import * as graphql from "@nestjs/graphql";
import { DemandeResolverBase } from "./base/demande.resolver.base";
import { Demande } from "./base/Demande";
import { DemandeService } from "./demande.service";

@graphql.Resolver(() => Demande)
export class DemandeResolver extends DemandeResolverBase {
  constructor(protected readonly service: DemandeService) {
    super(service);
  }
}
