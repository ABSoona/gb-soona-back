import * as graphql from "@nestjs/graphql";
import * as nestAccessControl from "nest-access-control";
import * as gqlACGuard from "../auth/gqlAC.guard";
import { GqlDefaultAuthGuard } from "../auth/gqlDefaultAuth.guard";
import * as common from "@nestjs/common";
import { Decision } from "./models/decision.model";
import { Comite } from "./models/comite.model";
import { CreateDecisionInput } from "./dto/create-decision.input";
import { DecisionService } from "./decision.service";

@common.UseGuards(GqlDefaultAuthGuard, gqlACGuard.GqlACGuard)
@graphql.Resolver(() => Decision)
export class DecisionResolver {
  constructor(private readonly service: DecisionService) {}

  @graphql.Mutation(() => Decision)
  @nestAccessControl.UseRoles({
    resource: "Decision",
    action: "create",
    possession: "any",
  })
  async createDecision(
    @graphql.Args("data") data: CreateDecisionInput
  ): Promise<Decision> {
    return this.service.createDecision(data) as unknown as Decision;
  }

  @graphql.Query(() => [Decision])
  @nestAccessControl.UseRoles({
    resource: "Decision",
    action: "read",
    possession: "any",
  })
  async decisionsByDemande(
    @graphql.Args("demandeId", { type: () => graphql.Int }) demandeId: number
  ): Promise<Decision[]> {
    return this.service.decisionsByDemande(demandeId) as unknown as Decision[];
  }

  @graphql.Query(() => [Comite])
  @nestAccessControl.UseRoles({
    resource: "Decision",
    action: "read",
    possession: "any",
  })
  async comites(): Promise<Comite[]> {
    return this.service.comites() as unknown as Comite[];
  }

  @graphql.Query(() => [Decision])
  @nestAccessControl.UseRoles({
    resource: "Decision",
    action: "read",
    possession: "any",
  })
  async decisionsByComite(
    @graphql.Args("comiteId", { type: () => graphql.Int }) comiteId: number
  ): Promise<Decision[]> {
    return this.service.decisionsByComite(comiteId) as unknown as Decision[];
  }

  @graphql.Mutation(() => Decision)
  @nestAccessControl.UseRoles({
    resource: "Decision",
    action: "update",
    possession: "any",
  })
  async updateDecisionMotivation(
    @graphql.Args("decisionId", { type: () => graphql.Int }) decisionId: number,
    @graphql.Args("motivation") motivation: string
  ): Promise<Decision> {
    return this.service.updateDecisionMotivation(decisionId, motivation) as unknown as Decision;
  }

  @graphql.Mutation(() => Decision)
  @nestAccessControl.UseRoles({
    resource: "Decision",
    action: "create",
    possession: "any",
  })
  async attachAideToDecision(
    @graphql.Args("decisionId", { type: () => graphql.Int }) decisionId: number,
    @graphql.Args("aideId", { type: () => graphql.Int }) aideId: number
  ): Promise<Decision> {
    return this.service.attachAideToDecision(decisionId, aideId) as unknown as Decision;
  }
}
