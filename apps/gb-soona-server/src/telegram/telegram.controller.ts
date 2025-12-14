import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import { TelegramService } from "./telegram.service";
import { Public } from "src/decorators/public.decorator";
import type { PublishCommitteePayload } from "./telegram.types";

@swagger.ApiTags("telegram")
@common.Controller("telegram")
export class TelegramController {
  constructor(
    private readonly telegramService: TelegramService
  ) {}

  @common.Post("publish")
  @Public()
  async publish(@common.Body() body: PublishCommitteePayload) {
    await this.telegramService.publishToCommittee(body);
    return { ok: true };
  }
}
