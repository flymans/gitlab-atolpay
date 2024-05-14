import { Module, forwardRef } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { getTelegramConfig } from './telegram-config.factory';
import { TelegramRepository } from './telegram.repository';
import { GitlabModule } from '../gitlab/gitlab.module';

@Module({
  imports: [TelegrafModule.forRootAsync(getTelegramConfig()), forwardRef(() => GitlabModule)],
  providers: [TelegramService, TelegramRepository],
  exports: [TelegramService],
})
export class TelegramModule {}
