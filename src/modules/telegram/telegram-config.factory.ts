import { ConfigService } from '@nestjs/config';
import { TelegrafModuleAsyncOptions, TelegrafModuleOptions } from 'nestjs-telegraf';

const telegrafModuleOptions = (config: ConfigService): TelegrafModuleOptions => {
  return {
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
