import { Module } from '@nestjs/common';
import { GitlabService } from './gitlab.service';
import { GitlabController } from './gitlab.controller';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [TelegramModule],
  controllers: [GitlabController],
  providers: [GitlabService],
})
export class GitlabModule {}
