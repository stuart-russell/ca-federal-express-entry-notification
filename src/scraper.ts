import { chromium, type Browser, type Page } from 'playwright';
import type { InvitationData, ScraperConfig } from './types';
import { logError } from './logger';

/**
 * Extracts invitation data from the first result row on the page
 * Handles missing elements gracefully with descriptive error messages
 */
async function extractInvitationData(page: Page): Promise<InvitationData> {
  try {
    // Wait for the results table to be visible
    await page.waitForSelector('table', { timeout: 10000 });
  } catch (error) {
    throw new Error('Table element not found on page - page structure may have changed');
  }
  
  try {
    // Extract data from the first row of results
    // The table structure has headers and data rows
    const firstRow = page.locator('table tbody tr').first();
    
    // Extract the three required fields
    const cells = await firstRow.locator('td').all();
    
    if (cells.length < 3) {
      throw new Error(`Insufficient data cells in the first result row - expected at least 3, found ${cells.length}`);
    }
    
    // Extract text content from cells
    const dateText = await cells[1]?.textContent();
    const invitationsText = await cells[3]?.textContent();
    const crsScoreText = await cells[4]?.textContent();
    
    if (!dateText || !invitationsText || !crsScoreText) {
      throw new Error('Missing data in result cells - one or more cells are empty');
    }
    
    // Parse the date (format: "January 15, 2024" -> "2024-01-15")
    const date = parseDateToISO(dateText.trim());
    
    // Parse numbers (remove commas and convert)
    const invitations = parseInt(invitationsText.replace(/,/g, '').trim(), 10);
    const crsScore = parseInt(crsScoreText.trim(), 10);
    
    if (isNaN(invitations) || isNaN(crsScore)) {
      throw new Error(`Failed to parse numeric values - invitations: "${invitationsText}", crsScore: "${crsScoreText}"`);
    }
    
    return {
      date,
      invitations,
      crsScore
    };
  } catch (error) {
    // Re-throw with more context if it's not already our custom error
    if (error instanceof Error && !error.message.includes('result row')) {
      throw new Error(`Data extraction failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Converts date string from "Month Day, Year" format to ISO 8601 (YYYY-MM-DD)
 */
function parseDateToISO(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Attempts to scrape data with retry logic
 * Wraps all Playwright operations in try-catch blocks
 */
async function attemptScrape(config: ScraperConfig, attemptNumber: number): Promise<InvitationData> {
  let browser: Browser | null = null;
  
  try {
    // Launch headless Chromium browser
    try {
      browser = await chromium.launch({ headless: true });
    } catch (error) {
      throw new Error(`Failed to initialize Playwright browser: ${(error as Error).message}`);
    }
    
    const page = await browser.newPage();
    
    // Set timeout for navigation
    page.setDefaultTimeout(config.timeout);
    
    // Navigate to Express Entry URL with network error handling
    try {
      await page.goto(config.url, { waitUntil: 'networkidle' });
    } catch (error) {
      throw new Error(`Network error navigating to ${config.url}: ${(error as Error).message}`);
    }
    
    // Locate filter text input and type "healthcare"
    // The filter input is typically a search/filter box on the page
    try {
      const filterInput = page.locator('input[type="search"]').nth(1);
      await filterInput.waitFor({ state: 'visible', timeout: 5000 });
      await filterInput.fill('healthcare');
    } catch (error) {
      throw new Error(`Filter input not found or not interactable - page structure may have changed: ${(error as Error).message}`);
    }
    
    // Wait for filtered results to render
    // Give the page time to filter and update the table
    await page.waitForTimeout(2000);
    
    // Extract first result's date, invitations, and CRS score
    const data = await extractInvitationData(page);
    
    // Close browser
    await browser.close();
    
    return data;
  } catch (error) {
    // Ensure browser is closed even on error
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        // Log but don't throw - we're already handling an error
        console.error('Failed to close browser:', closeError);
      }
    }
    throw error;
  }
}

/**
 * Scrapes healthcare round data with exponential backoff retry logic
 * 
 * @param config - Scraper configuration including URL, timeout, and retry settings
 * @returns InvitationData if successful, null if all retries fail
 */
export async function scrapeHealthcareRound(config: ScraperConfig): Promise<InvitationData | null> {
  let lastError: Error | null = null;
  
  // Implement retry logic with exponential backoff (max 3 attempts)
  for (let attempt = 1; attempt <= config.retries; attempt++) {
    try {
      const data = await attemptScrape(config, attempt);
      return data;
    } catch (error) {
      lastError = error as Error;
      
      // Log the error with attempt number
      logError(
        lastError,
        `Scraping attempt ${attempt}/${config.retries} failed`
      );
      
      // If this wasn't the last attempt, wait before retrying
      if (attempt < config.retries) {
        // Exponential backoff: delay * 2^(attempt-1)
        const delay = config.retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // All retries failed
  logError(
    lastError || new Error('Unknown error'),
    `All ${config.retries} scraping attempts failed`
  );
  
  return null;
}
