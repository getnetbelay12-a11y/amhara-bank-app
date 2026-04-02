import { registerAs } from '@nestjs/config';

export const loggingConfig = registerAs('logging', () => ({
  appName: process.env.APP_NAME ?? 'Amhara Bank API',
  level: process.env.APP_LOG_LEVEL ?? 'log',
}));
