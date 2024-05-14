import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { TokenService } from './token.service';
import { GROUP_LIST } from 'src/utils/constants';

@Injectable()
export class BranchService {
  constructor(
    private readonly httpService: HttpService,
    private readonly tokenService: TokenService,
  ) {}

  private async fetchBranches(project: { id: number; name: string }) {
    const { data: branches } = await lastValueFrom(
      this.httpService.request(
        this.tokenService.getConfig({
          path: `projects/${project.id}/repository/branches?per_page=100`,
          method: 'GET',
        }),
      ),
    );

    return {
      project,
      branches: branches.map(({ name }) => name),
    };
  }

  private async compareBranches({ projectId, from, to }: { projectId: number; from: string; to: string }) {
    const { data: comparison } = await lastValueFrom(
      this.httpService.request(
        this.tokenService.getConfig({
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
  }

  private async fetchProjects(groupId: number) {
    const response = await lastValueFrom(
      this.httpService.request(
        this.tokenService.getConfig({
          path: `groups/${groupId}/projects?include_subgroups=true&per_page=100`,
          method: 'GET',
        }),
      ),
    );

    return response.data.map(({ id, name }) => ({ id, name }));
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
}
