import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { HttpConfigService } from 'src/modules/http/http-config.service';

@Injectable()
export class TokenService {
  private token: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly httpConfigService: HttpConfigService,
  ) {}

  async setToken(token: string): Promise<void> {
    this.token = token;
    await this.pingGitlab();
  }

  private async pingGitlab(): Promise<void> {
    try {
      const response = await lastValueFrom(this.httpService.request(this.getConfig({ path: 'user', method: 'GET' })));
      if (!response.data) {
        throw new Error('Invalid token');
      }
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  getToken() {
    return this.token;
  }

  getConfig(config: { path: string; method: 'GET' | 'POST'; query?: Record<string, string> }) {
    return this.httpConfigService.getConfig({ ...config, token: this.token });
  }
}
