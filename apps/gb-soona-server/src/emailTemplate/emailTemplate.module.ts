import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { EmailTemplateController } from "./emailTemplate.controller";
import { EmailTemplateService } from "./emailTemplate.service";

@Module({
  controllers: [EmailTemplateController],
  providers: [EmailTemplateService, PrismaService],
})
export class EmailTemplateModule {}
