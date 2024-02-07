import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Scenes, Telegraf } from 'telegraf';

type Context = Scenes.SceneContext;
@Injectable()
export class TelegramRepository extends Telegraf<Context> {
  constructor(private readonly configService: ConfigService) {
    super(configService.get('TELEGRAM_API'));
  }
  async sendMessage(chatId: number, message: string): Promise<number> {
    const msg = await this.telegram.sendMessage(chatId, message, { parse_mode: 'HTML' });
    return msg.message_id;
  }
  async removeMessage(chatId: number, messageId: number): Promise<void> {
    await this.telegram.deleteMessage(chatId, messageId);
  }
  async editMessage(chatId: number, messageId: number, message: string): Promise<void> {
    await this.telegram.editMessageText(chatId, messageId, null, message);
  }
}
