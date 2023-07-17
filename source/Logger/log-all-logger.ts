import {LoggerFunctions} from './logger-functions';

export class LogAllLogger implements LoggerFunctions {
  info(...args: any): void {
    console.log(...args);
  }
  debug(...args: any): void {
    console.debug(...args);
  }
  warn(...args: any): void {
    console.warn(...args);
  }
  error(...args: any): void {
    console.warn(...args);
  }
}
