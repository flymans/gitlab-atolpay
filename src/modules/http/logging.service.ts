import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggingService {
  private getRequest = (req) => {
    return {
      method: req.method,
      url: req.url,
      originalUrl: req.originalUrl,
      headers: {
        ...req.headers,
        ...(req.headers.authorization && { authorization: '***' }),
        ...(req.headers['PRIVATE-TOKEN'] && { 'PRIVATE-TOKEN': '***' }),
      },
      body: req.body,
    };
  };

  private getResponse = (response) => {
    return {
      status: response.status,
      statusText: response.statusText,
    };
  };

  private getError(error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  }

  private readonly logger = new Logger(LoggingService.name);

  logRequest(details) {
    this.logger.log(`Request: ${JSON.stringify(this.getRequest(details))}`);
  }

  logResponse(response) {
    this.logger.log(`Response: ${JSON.stringify(this.getResponse(response))}`);
  }

  logError(details) {
    this.logger.error(`Error: ${JSON.stringify(this.getError(details))}`);
  }
}
