import { Injectable } from '@nestjs/common';
import { BranchService } from './services/branch.service';
import { JobService } from './services/job.service';
import { NotificationService } from './services/notification.service';
import { TokenService } from './services/token.service';

@Injectable()
export class GitlabService {
  constructor(
    private readonly branchService: BranchService,
    private readonly jobService: JobService,
    private readonly notificationService: NotificationService,
    private readonly tokenService: TokenService,
  ) {}

  async behindMaster(from: string = 'develop/slytherin', to: string = 'master') {
    return this.branchService.behindMaster(from, to);
  }

  async getJobsTime(project) {
    return this.jobService.getJobsTime(project);
  }

  async jobNotify(values): Promise<string> {
    return this.notificationService.jobNotify(values);
  }

  async autotestStepNotify(values): Promise<string> {
    return this.notificationService.autotestStepNotify(values);
  }

  async setToken(token: string): Promise<void> {
    return this.tokenService.setToken(token);
  }
}
