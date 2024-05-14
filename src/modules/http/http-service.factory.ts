import { HttpService } from '@nestjs/axios';
import { LoggingService } from './logging.service';
import { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

export const createHttpService = (loggingService: LoggingService): HttpService => {
  const httpService = new HttpService();
  const axiosInstance = httpService.axiosRef;

  axiosInstance.interceptors.request.use(
    (request: InternalAxiosRequestConfig) => {
      loggingService.logRequest(request);
      return request;
    },
    (error) => {
      loggingService.logError(error);
      return Promise.reject(error);
    },
  );

  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      loggingService.logResponse(response);
      return response;
    },
    (error) => {
      loggingService.logError(error);
      return Promise.reject(error);
    },
  );

  return httpService;
};
