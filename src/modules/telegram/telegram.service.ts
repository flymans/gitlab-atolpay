import { Command, Ctx, Start, Update } from 'nestjs-telegraf';
import { Scenes } from 'telegraf';
import { TelegramRepository } from './telegram.repository';
import { ConfigService } from '@nestjs/config';

type Context = Scenes.SceneContext;

@Update()
export class TelegramService {
  constructor(
    private readonly telegramRepository: TelegramRepository,
    private readonly configService: ConfigService,
  ) {}
  private buildMessages = new Map<string, number>();

  public async sendBuildMessageToChat({ name, branch, status }: { name: string; branch: string; status: string }): Promise<void> {
    const buildStatusChat = this.configService.get<number>('TELEGRAM_BUILD_STATUS_CHAT_ID');
    const key = `${name}-${branch}`;
    const message = `Сборка сервиса <b>${name}</b> на ветке <i>${branch}</i> <b>${status === 'start' ? 'стартовала⌛' : 'завершилась✅'}</b>`;

    if (status === 'start') {
      const messageId = await this.telegramRepository.sendMessage(buildStatusChat, message);
      this.buildMessages.set(key, messageId);
    } else {
      const startMessageId = this.buildMessages.get(key);
      if (startMessageId) {
        await this.telegramRepository.removeMessage(buildStatusChat, startMessageId);
        this.buildMessages.delete(key);
      }

      const messageId = await this.telegramRepository.sendMessage(buildStatusChat, message);
      setTimeout(async () => {
        await this.telegramRepository.removeMessage(buildStatusChat, messageId);
      }, 5000); // 5 sec
    }
  }
  // private async saveChatId(chatId: number) {
  //   await appendFile('subscribers.txt', `${chatId}\n`);
  // }

  // private async removeChatId(chatId: number) {
  //   const data = await readFile('subscribers.txt', 'utf8');
  //   const chatIds = data.split('\n');
  //   const filteredChatIds = chatIds.filter((id) => id !== chatId.toString());
  //   await writeFile('subscribers.txt', filteredChatIds.join('\n'));
  // }

  // private async isChatIdSubscribed(chatId: number): Promise<boolean> {
  //   const data = await readFile('subscribers.txt', 'utf8');
  //   return data.split('\n').includes(chatId.toString());
  // }

  @Start()
  async onStart(@Ctx() ctx: Context): Promise<void> {
    // const chatId = ctx.chat.id;
    // const isSubscriber = await this.isChatIdSubscribed(chatId);
    ctx.replyWithHTML(
      `Привет, <b>${ctx.from.username}</b>
Это тестовый бот для получения оповещений о старте/окончании gitlab build'a
    `,
      // Markup.inlineKeyboard([Markup.button.callback(isSubscriber ? 'Отписаться' : 'Подписаться', isSubscriber ? 'unsubscribe' : 'subscribe')]),
    );
  }

  //   @Action('subscribe')
  //   async onSubscribe(@Ctx() ctx: Context): Promise<void> {
  //     const chatId = ctx.chat.id;
  //     const isSubscriber = await this.isChatIdSubscribed(chatId);
  //     if (isSubscriber) ctx.answerCbQuery('Вы уже подписаны!');
  //     else {
  //       await this.saveChatId(chatId);
  //       await ctx.answerCbQuery('Вы подписались!');
  //       await ctx.reply(`Вы успешно подписались!
  // Теперь при старте/окончании сборки сервиса atolpay, Вам будут приходить оповещения`);
  //     }
  //   }

  // @Action('unsubscribe')
  // async onUnsubscribe(@Ctx() ctx: Context): Promise<void> {
  //   const chatId = ctx.chat.id;
  //   const isSubscriber = await this.isChatIdSubscribed(chatId);
  //   if (!isSubscriber) ctx.answerCbQuery('Вы уже отписаны!');
  //   else {
  //     await this.removeChatId(chatId);
  //     await ctx.answerCbQuery('Вы отписались!');
  //     await this.onStart(ctx);
  //   }
  // }

  @Command('getChatId')
  async getChatId(@Ctx() ctx: Context): Promise<number> {
    return ctx.chat.id;
  }
}
