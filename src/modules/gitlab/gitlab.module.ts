import { Module, forwardRef } from '@nestjs/common';
import { GitlabService } from './gitlab.service';
import { GitlabController } from './gitlab.controller';
import { TelegramModule } from '../telegram/telegram.module';
import { CustomHttpModule } from '../http/http.module';
import { BranchService } from './services/branch.service';
import { JobService } from './services/job.service';
import { NotificationService } from './services/notification.service';
import { TokenService } from './services/token.service';

@Module({
  imports: [forwardRef(() => TelegramModule), CustomHttpModule],
  controllers: [GitlabController],
  providers: [GitlabService, BranchService, JobService, NotificationService, TokenService],
  exports: [GitlabService],
})
export class GitlabModule {}
