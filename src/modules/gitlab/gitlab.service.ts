import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { GROUP_LIST, PROJECT_LIST, ProjectName } from '../../utils/constants';
import { lastValueFrom } from 'rxjs';
import { LoggingService } from '../../services/logging.service';
import { HttpConfigService } from '../../services/http-config.service';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class GitlabService {
  constructor(
    private readonly httpService: HttpService,
    private readonly loggingService: LoggingService,
    private readonly httpConfigService: HttpConfigService,
    private readonly telegramService: TelegramService,
  ) {
    this.addAxiosInterceptors();
  }

  private addAxiosInterceptors() {
    const axios = this.httpService.axiosRef;

    axios.interceptors.request.use(
      (request) => {
        this.loggingService.logRequest(request);
        return request;
      },
      (error) => {
        this.loggingService.logError(error);
        return Promise.reject(error);
      },
    );

    axios.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        this.loggingService.logError(error);
        return Promise.reject(error);
      },
    );
  }

  private fetchProjects = async (groupId) => {
    const response = await lastValueFrom(
      this.httpService.request(
        this.httpConfigService.getConfig({
          path: `groups/${groupId}/projects?include_subgroups=true&per_page=100`,
          method: 'GET',
        }),
      ),
    );

    return response.data.map(({ id, name }) => ({ id, name }));
  };

  private fetchBranches = async (project) => {
    const { data: branches } = await lastValueFrom(
      this.httpService.request(
        this.httpConfigService.getConfig({
          path: `projects/${project.id}/repository/branches?per_page=100`,
          method: 'GET',
        }),
      ),
    );

    return {
      project,
      branches: branches.map(({ name }) => name),
    };
  };

  private compareBranches = async ({ projectId, from, to }: { projectId: number; from: string; to: string }) => {
    const { data: comparison } = await lastValueFrom(
      this.httpService.request(
        this.httpConfigService.getConfig({
          path: `projects/${projectId}/repository/compare?from=${from}&to=${to}`,
          method: 'GET',
        }),
      ),
    );
    if (comparison.diffs && comparison.diffs.length > 0) {
      const configChanges = comparison.diffs
        .filter((diff) => diff.new_path === '.env-dist' || diff.new_path === 'config/default-dist.json')
        .map((diff) => ({ file: diff.new_path, diff: diff.diff }));
      return configChanges.length === 0 ? 'No changes ❌' : { changes: configChanges, link: comparison.web_url };
    }
    return null;
  };

  async getJobsTime(project: ProjectName) {
    const projectId = PROJECT_LIST[project];
    const path = `projects/${projectId}/jobs?pagination=keyset&per_page=30&order_by=id&sort=desc`;
    const { data: jobs } = await lastValueFrom(this.httpService.request(this.httpConfigService.getConfig({ path, method: 'GET' })));
    return jobs
      .filter(({ duration }) => duration)
      .map(({ ref, duration }) => {
        const minutes = Math.floor(duration / 60);
        const seconds = Math.round(duration % 60);
        return { ref, duration: `${minutes} minutes, ${seconds} seconds` };
      });
  }

  async behindMaster(from: string = 'develop/slytherin', to: string = 'master') {
    const projects = (await Promise.all(Object.values(GROUP_LIST).map((groupId) => this.fetchProjects(groupId)))).flat();

    const allProjectBranches = await projects.reduce(async (accumulatorPromise, project) => {
      const accumulator = await accumulatorPromise;
      const projectBranchData = await this.fetchBranches(project);
      if ([from, to].every((value) => projectBranchData.branches.includes(value))) {
        const comparison = await this.compareBranches({ projectId: project.id, from, to });
        if (comparison) {
          accumulator.push({ project: projectBranchData.project.name, configChanges: comparison });
        }
      }

      return accumulator;
    }, Promise.resolve([]));

    return allProjectBranches;
  }

  async jobNotify(values) {
    await this.telegramService.sendBuildMessageToChat(values);
    return 'Сообщение отправлено в телеграм';
  }
}
