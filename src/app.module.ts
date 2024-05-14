import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';

import { TelegramModule } from './modules/telegram/telegram.module';
import { GitlabController } from './modules/gitlab/gitlab.controller';
import { CustomHttpModule } from './modules/http/http.module';
import { GitlabModule } from './modules/gitlab/gitlab.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), CustomHttpModule, TelegramModule, GitlabModule],
  controllers: [GitlabController],
})
export class AppModule {}
