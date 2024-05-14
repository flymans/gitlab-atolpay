import { HttpService, HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { HttpConfigService } from './http-config.service';
import { LoggingService } from './logging.service';
import { createHttpService } from './http-service.factory';

@Module({
  imports: [HttpModule],
  providers: [
    LoggingService,
    HttpConfigService,
    {
      provide: HttpService,
      useFactory: createHttpService,
      inject: [LoggingService],
    },
  ],
  exports: [HttpService, HttpConfigService],
})
export class CustomHttpModule {}
