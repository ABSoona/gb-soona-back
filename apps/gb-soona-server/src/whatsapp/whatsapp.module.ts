import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DocumentModule } from "../document/document.module";
import { WhatsappService } from "./whatsapp.service";
import { WhatsappController } from "./whatsapp.controller";

@Module({
  imports: [DocumentModule],
  controllers: [WhatsappController],
  providers: [WhatsappService, PrismaService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
