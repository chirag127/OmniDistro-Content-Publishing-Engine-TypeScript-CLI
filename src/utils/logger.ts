import * as fs from 'fs';
import * as path from 'path';

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  platform?: string | undefined;
  file?: string | undefined;
  message: string;
  meta?: Record<string, any> | undefined;
}

export class Logger {
  private logDir: string;
  private currentLogFile: string;

  constructor(logDir = 'logs') {
    this.logDir = logDir;
    this.ensureLogDir();

    // Create log file with timestamp
    const now = new Date();
    this.currentLogFile = path.join(
      this.logDir,
      `publish-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.log`
    );
  }

  private ensureLogDir(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private writeLog(entry: LogEntry): void {
    const logLine = JSON.stringify(entry) + '\n';
    fs.appendFileSync(this.currentLogFile, logLine);
  }

  info(message: string, platform?: string, file?: string, meta?: Record<string, any>): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      platform,
      file,
      message,
      meta
    });
  }

  warn(message: string, platform?: string, file?: string, meta?: Record<string, any>): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: 'WARN',
      platform,
      file,
      message,
      meta
    });
  }

  error(message: string, platform?: string, file?: string, meta?: Record<string, any>): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      platform,
      file,
      message,
      meta
    });
  }

  debug(message: string, platform?: string, file?: string, meta?: Record<string, any>): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: 'DEBUG',
      platform,
      file,
      message,
      meta
    });
  }

  getLogFile(): string {
    return this.currentLogFile;
  }
}

// Global logger instance
export const logger = new Logger();