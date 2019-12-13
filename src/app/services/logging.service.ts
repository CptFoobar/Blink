import { Injectable } from '@angular/core';

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
  constructor(tag: string, level: Level = Level.Info) {
    this.tag = tag;
    this.level = level;
  }

  private log(level: string, ...message: any[]) {
    console.log(`${new Date().toISOString()} [${level.toUpperCase()}] -`, ...message);
  }

  debug(...message: any[]) {
    if (this.level >= Level.Debug) {
      this.log('DEBUG', ...message);
    }
  }

  info(...message: any[]) {
    if (this.level >= Level.Debug) {
      this.log('INFO', ...message);
    }
  }

  warn(...message: any[]) {
    if (this.level >= Level.Debug) {
      this.log('WARN', ...message);
    }
  }

  error(...message: any[]) {
    if (this.level >= Level.Debug) {
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
