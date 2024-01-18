import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HttpConfigService {
  constructor(private configService: ConfigService) {}

  getConfig({ path, method, query }: { path: string; method: 'GET' | 'POST'; query?: Record<string, string> }) {
    return {
      method: method,
      maxBodyLength: Infinity,
      url: `https://gitlab.atol.tech/api/v4/${path}`,
      headers: {
        'PRIVATE-TOKEN': this.configService.get<string>('PRIVATE_GITLAB_TOKEN'),
      },
      params: query,
    };
  }
}
