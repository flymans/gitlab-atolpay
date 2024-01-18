import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MiddlewareLogger } from './middlewares/middleware.logger';
import { LoggingService } from './services/logging.service';
import { HttpConfigService } from './services/http-config.service';
import { TelegramModule } from './modules/telegram/telegram.module';
import { GitlabController } from './modules/gitlab/gitlab.controller';
import { GitlabService } from './modules/gitlab/gitlab.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HttpModule, TelegramModule],
  controllers: [GitlabController],
  providers: [GitlabService, LoggingService, HttpConfigService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MiddlewareLogger).forRoutes('*');
  }
}
