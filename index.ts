#!/usr/bin/env bun

import { runMonitor } from './src/controller';

/**
 * Express Entry Monitor Runner
 */

async function main() {
  console.log('Express Entry Monitor - Running ad-hoc check...');
  console.log('Starting scrape...\n');
  
  try {
    await runMonitor();
    console.log('\nScrape completed successfully!');
  } catch (error) {
    console.error('\nScrape failed:', error);
    process.exit(1);
  }
}

main();
