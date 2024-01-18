import { Controller, Get, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/jobs/:project')
  getJobs(@Param('project') project) {
    return this.appService.getJobsTime(project);
  }

  @Get('/behind-master')
  getBehindMaster(@Query('from') from, @Query('to') to) {
    return this.appService.behindMaster(from, to);
  }
}
