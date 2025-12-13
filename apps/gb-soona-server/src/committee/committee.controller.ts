import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import { TelegramService } from "../telegram/telegram.service";
import { Public } from "src/decorators/public.decorator";

@swagger.ApiTags("committee")
@common.Controller("committee")
export class CommitteeController {
  constructor(
    private readonly telegramService: TelegramService
  ) {}

  @common.Post("publish")
  @Public() // ⬅️ important si ton backend est protégé par défaut
  async publish(@common.Body() body: any) {
    await this.telegramService.publishToCommittee(body);
    return { ok: true };
  }
}
