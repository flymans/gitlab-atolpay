import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { GitlabService } from './gitlab.service';
import { AuthGuard } from 'src/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('gitlab')
export class GitlabController {
  constructor(private readonly gitlabService: GitlabService) {}

  @Get('/jobs/:project')
  async getJobs(@Param('project') project) {
    return this.gitlabService.getJobsTime(project);
  }

  @Post('jobs/notify')
  async jobStart(@Body() body) {
    return this.gitlabService.jobNotify(body);
  }

  @Post('jobs/notify/autotest')
  async autotestStepNotify(@Body() body) {
    return this.gitlabService.autotestStepNotify(body);
  }

  @Get('/behind-master')
  async getBehindMaster(@Query('from') from, @Query('to') to) {
    return this.gitlabService.behindMaster(from, to);
  }
}
