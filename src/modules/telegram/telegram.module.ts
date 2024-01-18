import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { getTelegramConfig } from './telegram-config.factory';
import { TelegramRepository } from './telegram.repository';

@Module({
  imports: [TelegrafModule.forRootAsync(getTelegramConfig())],
  providers: [TelegramService, TelegramRepository],
  exports: [TelegramService],
})
export class TelegramModule {}
