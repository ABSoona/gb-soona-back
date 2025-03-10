/*
------------------------------------------------------------------------------ 
This code was generated by Amplication. 
 
Changes to this file will be lost if the code is regenerated. 

There are other ways to to customize your code, see this doc to learn more
https://docs.amplication.com/how-to/custom-code

------------------------------------------------------------------------------
  */
import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import { isRecordNotFoundError } from "../../prisma.util";
import * as errors from "../../errors";
import { Request } from "express";
import { plainToClass } from "class-transformer";
import { ApiNestedQuery } from "../../decorators/api-nested-query.decorator";
import * as nestAccessControl from "nest-access-control";
import * as defaultAuthGuard from "../../auth/defaultAuth.guard";
import { VisiteService } from "../visite.service";
import { AclValidateRequestInterceptor } from "../../interceptors/aclValidateRequest.interceptor";
import { AclFilterResponseInterceptor } from "../../interceptors/aclFilterResponse.interceptor";
import { VisiteCreateInput } from "./VisiteCreateInput";
import { Visite } from "./Visite";
import { VisiteFindManyArgs } from "./VisiteFindManyArgs";
import { VisiteWhereUniqueInput } from "./VisiteWhereUniqueInput";
import { VisiteUpdateInput } from "./VisiteUpdateInput";

@swagger.ApiBearerAuth()
@common.UseGuards(defaultAuthGuard.DefaultAuthGuard, nestAccessControl.ACGuard)
export class VisiteControllerBase {
  constructor(
    protected readonly service: VisiteService,
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {}
  @common.UseInterceptors(AclValidateRequestInterceptor)
  @common.Post()
  @swagger.ApiCreatedResponse({ type: Visite })
  @nestAccessControl.UseRoles({
    resource: "Visite",
    action: "create",
    possession: "any",
  })
  @swagger.ApiForbiddenResponse({
    type: errors.ForbiddenException,
  })
  async createVisite(@common.Body() data: VisiteCreateInput): Promise<Visite> {
    return await this.service.createVisite({
      data: {
        ...data,

        contact: data.contact
          ? {
              connect: data.contact,
            }
          : undefined,
      },
      select: {
        contact: {
          select: {
            id: true,
          },
        },

        createdAt: true,
        dateVisite: true,
        id: true,
        rapportVisite: true,
        updatedAt: true,
      },
    });
  }

  @common.UseInterceptors(AclFilterResponseInterceptor)
  @common.Get()
  @swagger.ApiOkResponse({ type: [Visite] })
  @ApiNestedQuery(VisiteFindManyArgs)
  @nestAccessControl.UseRoles({
    resource: "Visite",
    action: "read",
    possession: "any",
  })
  @swagger.ApiForbiddenResponse({
    type: errors.ForbiddenException,
  })
  async visites(@common.Req() request: Request): Promise<Visite[]> {
    const args = plainToClass(VisiteFindManyArgs, request.query);
    return this.service.visites({
      ...args,
      select: {
        contact: {
          select: {
            id: true,
          },
        },

        createdAt: true,
        dateVisite: true,
        id: true,
        rapportVisite: true,
        updatedAt: true,
      },
    });
  }

  @common.UseInterceptors(AclFilterResponseInterceptor)
  @common.Get("/:id")
  @swagger.ApiOkResponse({ type: Visite })
  @swagger.ApiNotFoundResponse({ type: errors.NotFoundException })
  @nestAccessControl.UseRoles({
    resource: "Visite",
    action: "read",
    possession: "own",
  })
  @swagger.ApiForbiddenResponse({
    type: errors.ForbiddenException,
  })
  async visite(
    @common.Param() params: VisiteWhereUniqueInput
  ): Promise<Visite | null> {
    const result = await this.service.visite({
      where: params,
      select: {
        contact: {
          select: {
            id: true,
          },
        },

        createdAt: true,
        dateVisite: true,
        id: true,
        rapportVisite: true,
        updatedAt: true,
      },
    });
    if (result === null) {
      throw new errors.NotFoundException(
        `No resource was found for ${JSON.stringify(params)}`
      );
    }
    return result;
  }

  @common.UseInterceptors(AclValidateRequestInterceptor)
  @common.Patch("/:id")
  @swagger.ApiOkResponse({ type: Visite })
  @swagger.ApiNotFoundResponse({ type: errors.NotFoundException })
  @nestAccessControl.UseRoles({
    resource: "Visite",
    action: "update",
    possession: "any",
  })
  @swagger.ApiForbiddenResponse({
    type: errors.ForbiddenException,
  })
  async updateVisite(
    @common.Param() params: VisiteWhereUniqueInput,
    @common.Body() data: VisiteUpdateInput
  ): Promise<Visite | null> {
    try {
      return await this.service.updateVisite({
        where: params,
        data: {
          ...data,

          contact: data.contact
            ? {
                connect: data.contact,
              }
            : undefined,
        },
        select: {
          contact: {
            select: {
              id: true,
            },
          },

          createdAt: true,
          dateVisite: true,
          id: true,
          rapportVisite: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new errors.NotFoundException(
          `No resource was found for ${JSON.stringify(params)}`
        );
      }
      throw error;
    }
  }

  @common.Delete("/:id")
  @swagger.ApiOkResponse({ type: Visite })
  @swagger.ApiNotFoundResponse({ type: errors.NotFoundException })
  @nestAccessControl.UseRoles({
    resource: "Visite",
    action: "delete",
    possession: "any",
  })
  @swagger.ApiForbiddenResponse({
    type: errors.ForbiddenException,
  })
  async deleteVisite(
    @common.Param() params: VisiteWhereUniqueInput
  ): Promise<Visite | null> {
    try {
      return await this.service.deleteVisite({
        where: params,
        select: {
          contact: {
            select: {
              id: true,
            },
          },

          createdAt: true,
          dateVisite: true,
          id: true,
          rapportVisite: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new errors.NotFoundException(
          `No resource was found for ${JSON.stringify(params)}`
        );
      }
      throw error;
    }
  }
}
