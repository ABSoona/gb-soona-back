/*
------------------------------------------------------------------------------ 
This code was generated by Amplication. 
 
Changes to this file will be lost if the code is regenerated. 

There are other ways to to customize your code, see this doc to learn more
https://docs.amplication.com/how-to/custom-code

------------------------------------------------------------------------------
  */
import * as graphql from "@nestjs/graphql";
import { GraphQLError } from "graphql";
import { isRecordNotFoundError } from "../../prisma.util";
import { MetaQueryPayload } from "../../util/MetaQueryPayload";
import * as nestAccessControl from "nest-access-control";
import * as gqlACGuard from "../../auth/gqlAC.guard";
import { GqlDefaultAuthGuard } from "../../auth/gqlDefaultAuth.guard";
import * as common from "@nestjs/common";
import { AclFilterResponseInterceptor } from "../../interceptors/aclFilterResponse.interceptor";
import { AclValidateRequestInterceptor } from "../../interceptors/aclValidateRequest.interceptor";
import { Demande } from "./Demande";
import { DemandeCountArgs } from "./DemandeCountArgs";
import { DemandeFindManyArgs } from "./DemandeFindManyArgs";
import { DemandeFindUniqueArgs } from "./DemandeFindUniqueArgs";
import { CreateDemandeArgs } from "./CreateDemandeArgs";
import { UpdateDemandeArgs } from "./UpdateDemandeArgs";
import { DeleteDemandeArgs } from "./DeleteDemandeArgs";
import { Contact } from "../../contact/base/Contact";
import { Visite } from "../../visite/base/Visite";
import { DemandeService } from "../demande.service";
@common.UseGuards(GqlDefaultAuthGuard, gqlACGuard.GqlACGuard)
@graphql.Resolver(() => Demande)
export class DemandeResolverBase {
  constructor(
    protected readonly service: DemandeService,
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {}

  @graphql.Query(() => MetaQueryPayload)
  @nestAccessControl.UseRoles({
    resource: "Demande",
    action: "read",
    possession: "any",
  })
  async _demandesMeta(
    @graphql.Args() args: DemandeCountArgs
  ): Promise<MetaQueryPayload> {
    const result = await this.service.count(args);
    return {
      count: result,
    };
  }

  @common.UseInterceptors(AclFilterResponseInterceptor)
  @graphql.Query(() => [Demande])
  @nestAccessControl.UseRoles({
    resource: "Demande",
    action: "read",
    possession: "any",
  })
  async demandes(
    @graphql.Args() args: DemandeFindManyArgs
  ): Promise<Demande[]> {
    return this.service.demandes(args);
  }

  @common.UseInterceptors(AclFilterResponseInterceptor)
  @graphql.Query(() => Demande, { nullable: true })
  @nestAccessControl.UseRoles({
    resource: "Demande",
    action: "read",
    possession: "own",
  })
  async demande(
    @graphql.Args() args: DemandeFindUniqueArgs
  ): Promise<Demande | null> {
    const result = await this.service.demande(args);
    if (result === null) {
      return null;
    }
    return result;
  }

  @common.UseInterceptors(AclValidateRequestInterceptor)
  @graphql.Mutation(() => Demande)
  @nestAccessControl.UseRoles({
    resource: "Demande",
    action: "create",
    possession: "any",
  })
  async createDemande(
    @graphql.Args() args: CreateDemandeArgs
  ): Promise<Demande> {
    return await this.service.createDemande({
      ...args,
      data: {
        ...args.data,

        contact: {
          connect: args.data.contact,
        },

        visites: args.data.visites
          ? {
              connect: args.data.visites,
            }
          : undefined,
      },
    });
  }

  @common.UseInterceptors(AclValidateRequestInterceptor)
  @graphql.Mutation(() => Demande)
  @nestAccessControl.UseRoles({
    resource: "Demande",
    action: "update",
    possession: "any",
  })
  async updateDemande(
    @graphql.Args() args: UpdateDemandeArgs
  ): Promise<Demande | null> {
    try {
      return await this.service.updateDemande({
        ...args,
        data: {
          ...args.data,

          contact: {
            connect: args.data.contact,
          },

          visites: args.data.visites
            ? {
                connect: args.data.visites,
              }
            : undefined,
        },
      });
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new GraphQLError(
          `No resource was found for ${JSON.stringify(args.where)}`
        );
      }
      throw error;
    }
  }

  @graphql.Mutation(() => Demande)
  @nestAccessControl.UseRoles({
    resource: "Demande",
    action: "delete",
    possession: "any",
  })
  async deleteDemande(
    @graphql.Args() args: DeleteDemandeArgs
  ): Promise<Demande | null> {
    try {
      return await this.service.deleteDemande(args);
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new GraphQLError(
          `No resource was found for ${JSON.stringify(args.where)}`
        );
      }
      throw error;
    }
  }

  @common.UseInterceptors(AclFilterResponseInterceptor)
  @graphql.ResolveField(() => Contact, {
    nullable: true,
    name: "contact",
  })
  @nestAccessControl.UseRoles({
    resource: "Contact",
    action: "read",
    possession: "any",
  })
  async getContact(@graphql.Parent() parent: Demande): Promise<Contact | null> {
    const result = await this.service.getContact(parent.id);

    if (!result) {
      return null;
    }
    return result;
  }

  @common.UseInterceptors(AclFilterResponseInterceptor)
  @graphql.ResolveField(() => Visite, {
    nullable: true,
    name: "visites",
  })
  @nestAccessControl.UseRoles({
    resource: "Visite",
    action: "read",
    possession: "any",
  })
  async getVisites(@graphql.Parent() parent: Demande): Promise<Visite | null> {
    const result = await this.service.getVisites(parent.id);

    if (!result) {
      return null;
    }
    return result;
  }
}
