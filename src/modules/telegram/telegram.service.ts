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
  ) {
    setInterval(
      () => {
        this.cleanupBuildMessages();
      },
      10 * 60 * 1000,
    ); //every 10 minute
  }
  private buildMessages = new Map<string, { messageId: number; timestamp: number }>();
  private buildStatusChat = this.configService.get<number>('TELEGRAM_BUILD_STATUS_CHAT_ID');

  async cleanupBuildMessages() {
    const expirationTime = 15 * 60 * 1000; // 15 minutes
    const now = Date.now();

    for (const [key, { messageId, timestamp }] of this.buildMessages.entries()) {
      if (now - timestamp < expirationTime) return;
      const expiredMessage = `Что-то пошло не так со сборкой: ${key} ❌`;
      await this.telegramRepository.editMessage(this.buildStatusChat, messageId, expiredMessage);
      this.buildMessages.delete(key);
    }
  }

  public async sendBuildMessageToChat({
    name,
    branch,
    status,
    link,
  }: {
    name: string;
    branch: string;
    status: string;
    link?: string;
  }): Promise<void> {
    const key = `${name}-${branch}`;
    const message = `
Сборка сервиса <b>${name}</b> на ветке <i>${branch}</i> <b>${status === 'start' ? 'стартовала ⌛' : 'завершилась ✅'}</b>
${link ? `<b>Ссылка: ${atob(link)}</b>` : ''}
    `;

    const { messageId: startMessageId } = this.buildMessages.get(key) || {};
    if (startMessageId) {
      await this.telegramRepository.removeMessage(this.buildStatusChat, startMessageId);
      this.buildMessages.delete(key);
    }

    if (status === 'start') {
      const messageId = await this.telegramRepository.sendMessage(this.buildStatusChat, message);
      this.buildMessages.set(key, { messageId, timestamp: Date.now() });
    } else {
      await this.telegramRepository.sendMessage(this.buildStatusChat, message);
    }
  }

  public async sendAutotestMessageToChat({ name, link }: { name: string; link: string }): Promise<void> {
    const autotestChat = this.configService.get<number>('TELEGRAM_AUTOTESTS_CHAT_ID');
    const encodedLink = atob(link);
    const message = `
✅ Автотесты для сервиса <b>${name}</b> завершились\n
<b>📝 Отчет:</b> ${encodedLink}
`;
    await this.telegramRepository.sendMessage(autotestChat, message);
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
