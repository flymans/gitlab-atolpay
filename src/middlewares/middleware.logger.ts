import { Injectable, NestMiddleware } from '@nestjs/common';
import { LoggingService } from 'src/services/logging.service';

@Injectable()
export class MiddlewareLogger implements NestMiddleware {
  constructor(private loggingService: LoggingService) {}
  public async use(req, res, next: any) {
    const oldEnd = res.end;
    this.loggingService.logRequest(req);
    res.end = (...options) => {
      const response = options[0]?.toString('utf8');

      ['2', '3'].includes(res.statusCode.toString()[0]) ? this.loggingService.logResponse(response) : this.loggingService.logError(response);
      oldEnd.apply(res, options);
    };
    next();
  }
}
