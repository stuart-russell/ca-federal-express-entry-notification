import { appendFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import type { InvitationData, LogEntry } from './types';
import { config } from './config';

/**
 * Formats a log entry as a string
 */
function formatLogEntry(entry: LogEntry): string {
  const dataStr = entry.data ? ` ${JSON.stringify(entry.data)}` : '';
  return `${entry.timestamp} [${entry.level}] ${entry.message}${dataStr}\n`;
}

/**
 * Logs a new invitation data change
 */
export function logChange(data: InvitationData): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: 'INFO',
    message: `New healthcare round detected: Date=${data.date}, Invitations=${data.invitations}, CRS=${data.crsScore}`,
    data
  };
    console.log(formatLogEntry(entry));
}

/**
 * Logs when no changes are detected
 */
export function logNoChange(): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: 'INFO',
    message: 'No changes detected'
  };
    console.log(formatLogEntry(entry));
}

/**
 * Logs an error with context
 */
export function logError(error: Error, context: string): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    message: `${context}: ${error.message}`,
    data: {
      error: error.message,
      stack: error.stack,
      context
    }
  };
    console.log(formatLogEntry(entry));
}
