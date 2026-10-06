import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import * as nestAccessControl from "nest-access-control";
import * as defaultAuthGuard from "../auth/defaultAuth.guard";
import { Response } from "express";
import { endOfDay, startOfDay, parseISO, format } from "date-fns";
import { PrismaService } from "../prisma/prisma.service";
import {
  getActivityReportData,
  buildActivityReportHtml,
  generateActivityReportPdfBuffer,
} from "../schedules/activity-report.helper";

function parsePeriode(from?: string, to?: string): { debut: Date; fin: Date } {
  if (!from || !to) {
    throw new common.BadRequestException("Les paramètres 'from' et 'to' sont requis.");
  }
  const debut = startOfDay(parseISO(from));
  const fin = endOfDay(parseISO(to));
  if (isNaN(debut.getTime()) || isNaN(fin.getTime())) {
    throw new common.BadRequestException("Dates invalides.");
  }
  if (debut > fin) {
    throw new common.BadRequestException("La date de début doit précéder la date de fin.");
  }
  return { debut, fin };
}

@swagger.ApiTags("rapports")
@common.Controller("rapports")
@common.UseGuards(defaultAuthGuard.DefaultAuthGuard, nestAccessControl.ACGuard)
export class RapportsController {
  constructor(private readonly prisma: PrismaService) {}

  @common.Get("activite")
  async getActiviteData(
    @common.Query("from") from: string,
    @common.Query("to") to: string,
  ) {
    const { debut, fin } = parsePeriode(from, to);
    return getActivityReportData(this.prisma, debut, fin);
  }

  @common.Get("activite/pdf")
  async getActivitePdf(
    @common.Query("from") from: string,
    @common.Query("to") to: string,
    @common.Res() res: Response,
  ) {
    const { debut, fin } = parsePeriode(from, to);
    const data = await getActivityReportData(this.prisma, debut, fin);
    const periodLabel = `${format(debut, "dd/MM/yyyy")} – ${format(fin, "dd/MM/yyyy")}`;
    const html = buildActivityReportHtml(data, periodLabel);
    const pdfBuffer = await generateActivityReportPdfBuffer(html);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="rapport-activite-${format(debut, "dd-MM-yyyy")}-${format(fin, "dd-MM-yyyy")}.pdf"`,
    );
    res.end(pdfBuffer);
  }
}
