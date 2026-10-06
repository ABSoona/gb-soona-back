import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RapportsController } from "./rapports.controller";

@Module({
  controllers: [RapportsController],
  providers: [PrismaService],
})
export class RapportsModule {}
