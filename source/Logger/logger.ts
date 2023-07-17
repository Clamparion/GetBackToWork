import {LogAllLogger} from './log-all-logger';

const currentLogger = new LogAllLogger();

export class Logger {
  static info(...args: any): void {
    currentLogger.info(...args);
  }
  static debug(...args: any): void {
    currentLogger.debug(...args);
  }
  static warn(...args: any): void {
    currentLogger.warn(...args);
  }
  static error(...args: any): void {
    currentLogger.error(...args);
  }
}
