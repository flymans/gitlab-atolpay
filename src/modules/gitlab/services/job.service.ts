import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { TokenService } from './token.service';
import { HttpConfigService } from 'src/modules/http/http-config.service';
import { PROJECT_LIST, ProjectName } from 'src/utils/constants';

@Injectable()
export class JobService {
  constructor(
    private readonly httpService: HttpService,
    private readonly httpConfigService: HttpConfigService,
    private readonly tokenService: TokenService,
  ) {}

  async getJobsTime(project: ProjectName) {
    const projectId = PROJECT_LIST[project];
    const path = `projects/${projectId}/jobs?pagination=keyset&per_page=30&order_by=id&sort=desc`;
    const { data: jobs } = await lastValueFrom(
      this.httpService.request(this.httpConfigService.getConfig({ path, method: 'GET', token: this.tokenService.getToken() })),
    );
    return jobs
      .filter(({ duration }) => duration)
      .map(({ ref, duration }) => {
        const minutes = Math.floor(duration / 60);
        const seconds = Math.round(duration % 60);
        return { ref, duration: `${minutes} minutes, ${seconds} seconds` };
      });
  }
}
