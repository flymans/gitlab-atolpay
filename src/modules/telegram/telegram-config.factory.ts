import { ConfigService } from '@nestjs/config';
import { TelegrafModuleAsyncOptions, TelegrafModuleOptions } from 'nestjs-telegraf';
import { sessionMiddleware } from './middlewares/session.middleware';

const telegrafModuleOptions = (config: ConfigService): TelegrafModuleOptions => {
  return {
    middlewares: [sessionMiddleware],
    token: config.get('TELEGRAM_API'),
  };
};
export const getTelegramConfig = (): TelegrafModuleAsyncOptions => {
  return {
    inject: [ConfigService],
    useFactory: (config: ConfigService) => {
      return telegrafModuleOptions(config);
    },
  };
};
