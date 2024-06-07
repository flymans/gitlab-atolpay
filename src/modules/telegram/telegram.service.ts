import { Action, Command, Ctx, Hears, On, Start, Update } from 'nestjs-telegraf';
import { Markup, Scenes } from 'telegraf';
import { TelegramRepository } from './telegram.repository';
import { ConfigService } from '@nestjs/config';
import { Inject, forwardRef } from '@nestjs/common';
import { GitlabService } from '../gitlab/gitlab.service';
import { getBuildTimeMessage, prepareBuildMessage, prepareTable } from './utils';
import { BuildMessageArgsDto } from './dto/internal/build-message';

type Context = Scenes.SceneContext;

@Update()
export class TelegramService {
  constructor(
    private readonly telegramRepository: TelegramRepository,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => GitlabService))
    private readonly gitlabService: GitlabService,
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
      const [, name, branch] = key.match(/^\[(.+)\]\[(.+)\]$/);
      const expiredMessage = `❌ Со сборкой <b>${name}</b> на ветке <i>${branch}</i> что-то пошло не так`;
      await this.telegramRepository.editMessage(this.buildStatusChat, messageId, expiredMessage);
      this.buildMessages.delete(key);
    }
  }

  public async sendBuildMessageToChat({ name, branch, status, link, stage, tag }: BuildMessageArgsDto): Promise<void> {
    const buildIdentifier = tag || branch;
    const key = `[${name}][${buildIdentifier}]`;
    const isStarted = status === 'start';
    const { messageId: startMessageId, timestamp: startTimestamp } = this.buildMessages.get(key) || {};
    const buildTime = startTimestamp && !isStarted && getBuildTimeMessage(startTimestamp);
    const message = prepareBuildMessage({ isStarted, buildIdentifier, link, name, stage, buildTime });

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

  private async showMainMenu(ctx: Context, message: string): Promise<void> {
    ctx.replyWithHTML(
      message,
      Markup.keyboard([['🔍 Узнать id чата'], ['🌿 Проверить отставание веток от master']])
        .oneTime()
        .resize(),
    );
  }

  @Start()
  async onStart(@Ctx() ctx: Context): Promise<void> {
    const message = `Привет, <b>${ctx.from.username}</b>
Это тестовый бот для получения оповещений о старте/окончании gitlab build'a
    `;
    this.showMainMenu(ctx, message);
  }

  @Hears('🔍 Узнать id чата')
  @Command('getChatId')
  async getChatIdCommand(@Ctx() ctx: Context): Promise<number> {
    return ctx.chat.id;
  }

  @Hears('🌿 Проверить отставание веток от master')
  async behindMaster(@Ctx() ctx: Context): Promise<void> {
    const branches = ['develop/gryffindor', 'develop/hufflepuff', 'develop/slytherin'];
    const inlineKeyboard = Markup.inlineKeyboard(branches.map((branch) => Markup.button.callback(branch, branch)));
    await ctx.replyWithHTML('Выберите рассматриваемую ветку:', inlineKeyboard);
  }

  @Action(/develop(.+)/)
  async onBranchSelection(@Ctx() ctx): Promise<void> {
    const selectedBranch = ctx.match[0];
    await ctx.replyWithHTML(`
    Выбранная ветка: <b>${selectedBranch}</b>. Пожалуйста, отправьте GitLab токен для запроса.\n
P.S. Токен нигде не сохраняется. При успешном получении, я удалю его из истории чата
    `);
    ctx.session.branch = selectedBranch;
    ctx.session.awaitingToken = true;
  }

  @On('text')
  async listenToGitlabToken(@Ctx() ctx): Promise<void> {
    if (ctx.session.awaitingToken) {
      const token = ctx.message.text;
      await this.telegramRepository.removeMessage(ctx.message.chat.id, ctx.message.message_id);

      ctx.session.awaitingToken = false;

      await ctx.reply('Токен получен, выполняю запрос...');
      try {
        await this.gitlabService.setToken(token);

        const res = await this.gitlabService.compareBranches(ctx.session.branch, 'master');
        await ctx.replyWithHTML(prepareTable(res));
      } catch (error) {
        await ctx.reply('Некорректный токен');
      } finally {
        this.showMainMenu(ctx, 'Возвращение в главное меню: ');
      }
    }
  }
}
