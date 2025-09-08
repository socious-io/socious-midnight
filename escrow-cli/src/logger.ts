import { pino } from 'pino';
import type { Logger } from 'pino';

const logger: Logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

export { logger };
export default logger;
