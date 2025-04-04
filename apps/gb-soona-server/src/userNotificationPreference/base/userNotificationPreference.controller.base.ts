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
import { UserNotificationPreferenceService } from "../userNotificationPreference.service";
import { AclValidateRequestInterceptor } from "../../interceptors/aclValidateRequest.interceptor";
import { AclFilterResponseInterceptor } from "../../interceptors/aclFilterResponse.interceptor";
import { UserNotificationPreferenceCreateInput } from "./UserNotificationPreferenceCreateInput";
import { UserNotificationPreference } from "./UserNotificationPreference";
import { UserNotificationPreferenceFindManyArgs } from "./UserNotificationPreferenceFindManyArgs";
import { UserNotificationPreferenceWhereUniqueInput } from "./UserNotificationPreferenceWhereUniqueInput";
import { UserNotificationPreferenceUpdateInput } from "./UserNotificationPreferenceUpdateInput";

@swagger.ApiBearerAuth()
@common.UseGuards(defaultAuthGuard.DefaultAuthGuard, nestAccessControl.ACGuard)
export class UserNotificationPreferenceControllerBase {
  constructor(
    protected readonly service: UserNotificationPreferenceService,
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {}
  @common.UseInterceptors(AclValidateRequestInterceptor)
  @common.Post()
  @swagger.ApiCreatedResponse({ type: UserNotificationPreference })
  @nestAccessControl.UseRoles({
    resource: "UserNotificationPreference",
    action: "create",
    possession: "any",
  })
  @swagger.ApiForbiddenResponse({
    type: errors.ForbiddenException,
  })
  async createUserNotificationPreference(
    @common.Body() data: UserNotificationPreferenceCreateInput
  ): Promise<UserNotificationPreference> {
    return await this.service.createUserNotificationPreference({
      data: {
        ...data,

        user: {
          connect: data.user,
        },
      },
      select: {
        active: true,
        createdAt: true,
        id: true,
        typeField: true,
        updatedAt: true,

        user: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  @common.UseInterceptors(AclFilterResponseInterceptor)
  @common.Get()
  @swagger.ApiOkResponse({ type: [UserNotificationPreference] })
  @ApiNestedQuery(UserNotificationPreferenceFindManyArgs)
  @nestAccessControl.UseRoles({
    resource: "UserNotificationPreference",
    action: "read",
    possession: "any",
  })
  @swagger.ApiForbiddenResponse({
    type: errors.ForbiddenException,
  })
  async userNotificationPreferences(
    @common.Req() request: Request
  ): Promise<UserNotificationPreference[]> {
    const args = plainToClass(
      UserNotificationPreferenceFindManyArgs,
      request.query
    );
    return this.service.userNotificationPreferences({
      ...args,
      select: {
        active: true,
        createdAt: true,
        id: true,
        typeField: true,
        updatedAt: true,

        user: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  @common.UseInterceptors(AclFilterResponseInterceptor)
  @common.Get("/:id")
  @swagger.ApiOkResponse({ type: UserNotificationPreference })
  @swagger.ApiNotFoundResponse({ type: errors.NotFoundException })
  @nestAccessControl.UseRoles({
    resource: "UserNotificationPreference",
    action: "read",
    possession: "own",
  })
  @swagger.ApiForbiddenResponse({
    type: errors.ForbiddenException,
  })
  async userNotificationPreference(
    @common.Param() params: UserNotificationPreferenceWhereUniqueInput
  ): Promise<UserNotificationPreference | null> {
    const result = await this.service.userNotificationPreference({
      where: params,
      select: {
        active: true,
        createdAt: true,
        id: true,
        typeField: true,
        updatedAt: true,

        user: {
          select: {
            id: true,
          },
        },
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
  @swagger.ApiOkResponse({ type: UserNotificationPreference })
  @swagger.ApiNotFoundResponse({ type: errors.NotFoundException })
  @nestAccessControl.UseRoles({
    resource: "UserNotificationPreference",
    action: "update",
    possession: "any",
  })
  @swagger.ApiForbiddenResponse({
    type: errors.ForbiddenException,
  })
  async updateUserNotificationPreference(
    @common.Param() params: UserNotificationPreferenceWhereUniqueInput,
    @common.Body() data: UserNotificationPreferenceUpdateInput
  ): Promise<UserNotificationPreference | null> {
    try {
      return await this.service.updateUserNotificationPreference({
        where: params,
        data: {
          ...data,

          user: {
            connect: data.user,
          },
        },
        select: {
          active: true,
          createdAt: true,
          id: true,
          typeField: true,
          updatedAt: true,

          user: {
            select: {
              id: true,
            },
          },
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
  @swagger.ApiOkResponse({ type: UserNotificationPreference })
  @swagger.ApiNotFoundResponse({ type: errors.NotFoundException })
  @nestAccessControl.UseRoles({
    resource: "UserNotificationPreference",
    action: "delete",
    possession: "any",
  })
  @swagger.ApiForbiddenResponse({
    type: errors.ForbiddenException,
  })
  async deleteUserNotificationPreference(
    @common.Param() params: UserNotificationPreferenceWhereUniqueInput
  ): Promise<UserNotificationPreference | null> {
    try {
      return await this.service.deleteUserNotificationPreference({
        where: params,
        select: {
          active: true,
          createdAt: true,
          id: true,
          typeField: true,
          updatedAt: true,

          user: {
            select: {
              id: true,
            },
          },
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
