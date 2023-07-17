import {LoggerFunctions} from './logger-functions';

export class LogNothingLogger implements LoggerFunctions {
  info(..._args: any): void {}
  debug(..._args: any): void {}
  warn(..._args: any): void {}
  error(..._args: any): void {}
}
