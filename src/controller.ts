import { config } from './config';
import { readStoredData, writeStoredData } from './storage';
import { scrapeHealthcareRound } from './scraper';
import { compareData } from './comparison';
import { logChange, logNoChange, logError } from './logger';

/**
 * Main orchestration logic for the Express Entry Monitor
 */
export async function runMonitor(): Promise<void> {
  try {
    // Step 1: Read previous data from storage
    const previousData = await readStoredData(config.storage);
    
    // Step 2: Call scraper to get current data
    const currentData = await scrapeHealthcareRound(config.scraper);
    
    // If scraping failed (returned null), log error and exit
    if (currentData === null) {
      logError(
        new Error('Scraping failed after all retry attempts'),
        'Failed to retrieve current healthcare round data'
      );
      throw new Error('Scraping failed after all retry attempts');
    }
    
    // Step 3: Compare previous and current data
    const comparisonResult = compareData(previousData, currentData);
    
    // Step 4: Log changes or no-change
    if (comparisonResult.hasChanged) {
      logChange(currentData);

      // Send push notification if there have been any changes
      await fetch(`https://ntfy.sh/${config.ntfy.channel}`, {
        method: 'POST',
        body: JSON.stringify(currentData)
      })

      // Step 5: Update storage if changed
      try {
        await writeStoredData(config.storage, currentData);
      } catch (error) {
        logError(
          error as Error,
          'Failed to update storage after detecting change'
        );
        throw new Error('Failed to update storage after detecting change')
      }
    } else {
      logNoChange();
    }
  } catch (error) {
    // Step 6: Handle all errors gracefully
    logError(
      error as Error,
      'Unexpected error in monitor orchestration'
    );
    throw new Error(error as string)
  }
}
