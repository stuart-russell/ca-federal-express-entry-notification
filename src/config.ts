import type { Config } from './types';

/**
 * System-wide configuration for the Express Entry Monitor
 */
export const config: Config = {
  scraper: {
    url: process.env.statusPageUrl || "none",
    timeout: 30000,      // 30 seconds
    retries: 3,
    retryDelay: 1000     // Initial retry delay in ms (exponential backoff)
  },
  storage: {
    dataFilePath: './last-draw-data.json'
  },
  ntfy: { 
    channel: process.env.ntfyName || 'none'
  }
};
