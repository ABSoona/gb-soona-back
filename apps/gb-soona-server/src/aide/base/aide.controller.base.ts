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
import { AideService } from "../aide.service";
import { AclValidateRequestInterceptor } from "../../interceptors/aclValidateRequest.interceptor";
import { AclFilterResponseInterceptor } from "../../interceptors/aclFilterResponse.interceptor";
import { AideCreateInput } from "./AideCreateInput";
import { Aide } from "./Aide";
import { AideFindManyArgs } from "./AideFindManyArgs";
import { AideWhereUniqueInput } from "./AideWhereUniqueInput";
import { AideUpdateInput } from "./AideUpdateInput";

@swagger.ApiBearerAuth()
@common.UseGuards(defaultAuthGuard.DefaultAuthGuard, nestAccessControl.ACGuard)
export class AideControllerBase {
  constructor(
    protected readonly service: AideService,
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {}
  @common.UseInterceptors(AclValidateRequestInterceptor)
  @common.Post()
  @swagger.ApiCreatedResponse({ type: Aide })
  @nestAccessControl.UseRoles({
    resource: "Aide",
    action: "create",
    possession: "any",
  })
  @swagger.ApiForbiddenResponse({
    type: errors.ForbiddenException,
  })
  async createAide(@common.Body() data: AideCreateInput): Promise<Aide> {
    return await this.service.createAide({
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
        dateAide: true,
        dateExpiration: true,
        frequence: true,
        id: true,
        montant: true,
        nombreVersements: true,
        suspendue: true,
        typeField: true,
        updatedAt: true,
      },
    });
  }

  @common.UseInterceptors(AclFilterResponseInterceptor)
  @common.Get()
  @swagger.ApiOkResponse({ type: [Aide] })
  @ApiNestedQuery(AideFindManyArgs)
  @nestAccessControl.UseRoles({
    resource: "Aide",
    action: "read",
    possession: "any",
  })
  @swagger.ApiForbiddenResponse({
    type: errors.ForbiddenException,
  })
  async aides(@common.Req() request: Request): Promise<Aide[]> {
    const args = plainToClass(AideFindManyArgs, request.query);
    return this.service.aides({
      ...args,
      select: {
        contact: {
          select: {
            id: true,
          },
        },

        createdAt: true,
        dateAide: true,
        dateExpiration: true,
        frequence: true,
        id: true,
        montant: true,
        nombreVersements: true,
        suspendue: true,
        typeField: true,
        updatedAt: true,
      },
    });
  }

  @common.UseInterceptors(AclFilterResponseInterceptor)
  @common.Get("/:id")
  @swagger.ApiOkResponse({ type: Aide })
  @swagger.ApiNotFoundResponse({ type: errors.NotFoundException })
  @nestAccessControl.UseRoles({
    resource: "Aide",
    action: "read",
    possession: "own",
  })
  @swagger.ApiForbiddenResponse({
    type: errors.ForbiddenException,
  })
  async aide(
    @common.Param() params: AideWhereUniqueInput
  ): Promise<Aide | null> {
    const result = await this.service.aide({
      where: params,
      select: {
        contact: {
          select: {
            id: true,
          },
        },

        createdAt: true,
        dateAide: true,
        dateExpiration: true,
        frequence: true,
        id: true,
        montant: true,
        nombreVersements: true,
        suspendue: true,
        typeField: true,
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
  @swagger.ApiOkResponse({ type: Aide })
  @swagger.ApiNotFoundResponse({ type: errors.NotFoundException })
  @nestAccessControl.UseRoles({
    resource: "Aide",
    action: "update",
    possession: "any",
  })
  @swagger.ApiForbiddenResponse({
    type: errors.ForbiddenException,
  })
  async updateAide(
    @common.Param() params: AideWhereUniqueInput,
    @common.Body() data: AideUpdateInput
  ): Promise<Aide | null> {
    try {
      return await this.service.updateAide({
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
          dateAide: true,
          dateExpiration: true,
          frequence: true,
          id: true,
          montant: true,
          nombreVersements: true,
          suspendue: true,
          typeField: true,
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
  @swagger.ApiOkResponse({ type: Aide })
  @swagger.ApiNotFoundResponse({ type: errors.NotFoundException })
  @nestAccessControl.UseRoles({
    resource: "Aide",
    action: "delete",
    possession: "any",
  })
  @swagger.ApiForbiddenResponse({
    type: errors.ForbiddenException,
  })
  async deleteAide(
    @common.Param() params: AideWhereUniqueInput
  ): Promise<Aide | null> {
    try {
      return await this.service.deleteAide({
        where: params,
        select: {
          contact: {
            select: {
              id: true,
            },
          },

          createdAt: true,
          dateAide: true,
          dateExpiration: true,
          frequence: true,
          id: true,
          montant: true,
          nombreVersements: true,
          suspendue: true,
          typeField: true,
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
