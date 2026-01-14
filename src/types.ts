/**
 * Core data structure representing a healthcare invitation round
 */
export interface InvitationData {
  date: string;        // ISO 8601 date format (YYYY-MM-DD)
  invitations: number; // Positive integer
  crsScore: number;    // Positive integer, typically 300-500 range
}

/**
 * Result of comparing two invitation data records
 */
export interface ComparisonResult {
  hasChanged: boolean;
  previous: InvitationData | null;
  current: InvitationData;
}

/**
 * Log entry structure
 */
export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'ERROR' | 'WARN';
  message: string;
  data?: any;
}

/**
 * Web scraper configuration
 */
export interface ScraperConfig {
  url: string;
  timeout: number;
  retries: number;
  retryDelay: number;
}

/**
 * Storage configuration
 */
export interface StorageConfig {
  dataFilePath: string;
}

/**
 * Storage configuration
 */
export interface NotificationConfig {
  channel: string;
}

/**
 * System-wide configuration
 */
export interface Config {
  scraper: ScraperConfig;
  storage: StorageConfig;
  ntfy: NotificationConfig;
}
