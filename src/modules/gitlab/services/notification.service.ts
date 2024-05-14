import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { TelegramService } from 'src/modules/telegram/telegram.service';

@Injectable()
export class NotificationService {
  constructor(
    @Inject(forwardRef(() => TelegramService))
    private readonly telegramService: TelegramService,
  ) {}

  async jobNotify(values): Promise<string> {
    await this.telegramService.sendBuildMessageToChat(values);
    return 'Сообщение отправлено в телеграм';
  }

  async autotestStepNotify(values): Promise<string> {
    await this.telegramService.sendAutotestMessageToChat(values);
    return 'Сообщение отправлено в телеграм';
  }
}
