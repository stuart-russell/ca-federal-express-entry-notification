import type { InvitationData, ComparisonResult } from './types';

/**
 * Compare two invitation data records to detect changes
 * 
 * Two invitation records are considered different if their dates differ.
 * This is the primary key for detecting new rounds.
 * 
 * @param previous - Previously stored invitation data (null if first run)
 * @param current - Newly scraped invitation data
 * @returns ComparisonResult with hasChanged flag and both data objects
 */
export function compareData(
  previous: InvitationData | null,
  current: InvitationData
): ComparisonResult {
  try {
    // Validate current data
    if (!current || !current.date) {
      throw new Error('Invalid current data: missing date field');
    }
    
    // If no previous data exists, this is a new entry (changed)
    if (previous === null) {
      return {
        hasChanged: true,
        previous: null,
        current,
      };
    }

    // Validate previous data
    if (!previous.date) {
      throw new Error('Invalid previous data: missing date field');
    }

    // Compare dates - this is the primary key for detecting changes
    const hasChanged = previous.date !== current.date;

    return {
      hasChanged,
      previous,
      current,
    };
  } catch (error) {
    // Re-throw with context
    throw new Error(`Comparison failed: ${(error as Error).message}`);
  }
}
