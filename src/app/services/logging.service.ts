import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

enum Level {
  Debug,
  Info,
  Warn,
  Error
}
export class Logger {
  static readonly Level = Level;
  tag: string;
  level: Level;
  isProd: boolean;
  constructor(tag: string, level: Level = Level.Info) {
    this.tag = tag;
    this.level = level;
    this.isProd = environment.production;
  }

  private log(level: string, ...message: any[]) {
    console.log(`${new Date().toISOString()} [${level.toUpperCase()}] - ${this.tag}:`, ...message);
  }

  debug(...message: any[]) {
    if (this.level >= Level.Debug && !this.isProd) {
      this.log('DEBUG', ...message);
    }
  }

  info(...message: any[]) {
    if (this.level >= Level.Info) {
      this.log('INFO', ...message);
    }
  }

  warn(...message: any[]) {
    if (this.level >= Level.Warn) {
      this.log('WARN', ...message);
    }
  }

  error(...message: any[]) {
    if (this.level >= Level.Error) {
      this.log('ERROR', ...message);
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  static readonly Level = Level;
  readonly Level = Level;
  constructor() { }

  getLogger(tag: string, level: Level) {
    return new Logger(tag, level);
  }
}
