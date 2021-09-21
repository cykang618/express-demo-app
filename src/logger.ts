import path from 'path';
import { createLogger, format, transports } from 'winston';
import { AsyncLocalStorage } from 'async_hooks';
import { v4 as uuidv4 } from 'uuid';

const LOGDIR = process.env.LOGDIR || './logs';
const storage = new AsyncLocalStorage();

export const getRequestId = (): string => {
  return storage.getStore() as any;
}

export const runWithRequestId = (fn: () => void): void => {
  const id: string = uuidv4();
  storage.run(id, fn);
}

const appendRequestId = format((info, opts) => {
  const id = getRequestId();
  info.requestId = id;
  return info;
});

const richInfoFormatter = format((info, opts) => {
  const identifier = info.requestId || 'global';
  const prefix = `${info.timestamp} [${info.label}] ` + 
    `<${identifier.slice(-12).padStart(12)}>`;
  info.level = info.level.toUpperCase();
  info = format.colorize().transform(info, {}) as any;
  info.message = `${prefix} ${info.level} \t${info.message}`;
  return info;
});

const logger = createLogger({
  level: process.env.NODE_ENV === 'development' ? 'silly' : 'info',
  format: format.combine(
    appendRequestId(),
    format.timestamp(),
    format.label({ label: 'API' }),
    richInfoFormatter()
  ),
  transports: [
    new transports.File({
      filename: path.join(LOGDIR, 'app.log'),
      format: format.combine(
        format.uncolorize(),
        format.json()
      )
    }),
    new transports.Console({
      format: format.combine(
        format.printf((info) => {
          return info.message;
        })
      )
    })
  ]
});

export default logger;
