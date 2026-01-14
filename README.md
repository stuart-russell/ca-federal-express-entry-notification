# Express Entry Monitor

An automated monitoring system that tracks changes to Canada's Express Entry healthcare invitation rounds. The system scrapes data from the official government website and sends push notifications via [ntfy.sh](https://ntfy.sh) when new rounds are detected.

## Features

- **Automated Monitoring**: Runs via CircleCI scheduled pipelines
- **Web Scraping**: Uses Playwright to extract healthcare round data from the official Canada immigration website
- **Change Detection**: Compares new data against stored data to detect updates
- **Push Notifications**: Sends notifications to your ntfy.sh channel when changes are detected
- **Persistent Storage**: Saves the most recent healthcare round data in JSON format
- **Comprehensive Logging**: Records all changes, errors, and system events with timestamps
- **Error Resilience**: Handles network errors, page structure changes, and other failures gracefully
- **Retry Logic**: Automatically retries failed scraping attempts with exponential backoff
- **CI/CD Integration**: Automated execution via CircleCI with scheduled workflows

## What It Monitors

The system tracks three key pieces of information from Express Entry healthcare rounds:

- **Date**: When the invitation round occurred
- **Number of Invitations**: How many invitations were issued
- **CRS Score**: The minimum Comprehensive Ranking System score required

## Prerequisites

- [Bun](https://bun.sh) runtime (v1.2.22 or later)
- Internet connection to access the Canada immigration website
- [ntfy.sh](https://ntfy.sh) channel for push notifications (free, no signup required)
- CircleCI account (for automated scheduled runs)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ca-federal-express-entry-notification
```

2. Install dependencies:
```bash
bun install
```

This will install:
- `playwright` - For web scraping
- `fast-check` - For property-based testing (dev dependency)

3. Install Playwright browsers:
```bash
bunx playwright install chromium
```

4. Configure environment variables:

Create a `.env` file in the root directory:

```env
ntfyName=your-unique-channel-name
statusPageUrl=https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds.html
```

**Important**: Choose a unique channel name for `ntfyName` to avoid conflicts with other users.

## Usage

### Running Locally

Run an immediate scrape:

```bash
bun start
# or
bun run index.ts
```

This will:
1. Scrape the current healthcare round data
2. Compare it with previously stored data
3. Send a push notification if changes are detected
4. Update the stored data file
5. Log all activity

**Output example:**
```
Express Entry Monitor - Running ad-hoc check...
Starting scrape...

Scrape completed successfully!
```

### Receiving Notifications

To receive push notifications on your device:

1. **Mobile**: Download the ntfy app ([iOS](https://apps.apple.com/us/app/ntfy/id1625396347) / [Android](https://play.google.com/store/apps/details?id=io.heckel.ntfy))
2. **Desktop**: Visit [ntfy.sh/your-channel-name](https://ntfy.sh) in your browser
3. Subscribe to your channel name (the value from `ntfyName` in `.env`)

When a new healthcare round is detected, you'll receive a notification with the invitation data.

### CircleCI Automated Execution

The project includes a CircleCI configuration for automated scheduled runs.

**Setup:**

1. Connect your repository to CircleCI
2. Add environment variables in CircleCI project settings:
   - `ntfyName` - Your ntfy.sh channel name
   - `statusPageUrl` - The Express Entry rounds URL

3. Configure a scheduled pipeline in CircleCI:
   - Go to Project Settings → Triggers
   - Create a new scheduled trigger named `check-draw`
   - Set your desired schedule (e.g., daily at 8:00 AM)

The workflow will:
- Run tests
- Execute the scraper
- Commit updated data back to the repository
- Send notifications on changes

## Configuration

Configuration is located in `src/config.ts`:

```typescript
{
  scraper: {
    url: process.env.statusPageUrl || "none",
    timeout: 30000,      // 30 seconds
    retries: 3,          // Maximum retry attempts
    retryDelay: 1000     // Initial retry delay (exponential backoff)
  },
  storage: {
    dataFilePath: './last-draw-data.json'
  },
  ntfy: { 
    channel: process.env.ntfyName || 'none'
  }
}
```

### Environment Variables

- `statusPageUrl` - URL of the Express Entry rounds page (optional, has default)
- `ntfyName` - Your unique ntfy.sh channel name (required for notifications)

## Data Files

### Invitation Data (`./last-draw-data.json`)

Stores the most recent healthcare round data:

```json
{
  "date": "2024-01-15",
  "invitations": 3500,
  "crsScore": 431
}
```

This file is automatically committed back to the repository by CircleCI to track changes over time.

### Log File (`./data/monitor.log`)

Records all system events with timestamps:

```
2024-01-15T08:00:15Z [INFO] New healthcare round detected: Date=2024-01-15, Invitations=3500, CRS=431
2024-01-16T08:00:12Z [INFO] No changes detected
2024-01-17T08:00:10Z [ERROR] Failed to scrape data: Network timeout
```

## Testing

Run the test suite:

```bash
bun test
```

The project includes:
- **Unit tests**: Verify specific functionality and edge cases
- **Property-based tests**: Validate universal properties across many inputs
- **Integration tests**: Test component interactions

Test files are located in `src/*.test.ts`.

## Available Scripts

- `bun start` - Run an immediate scrape
- `bun test` - Run the test suite

## Architecture

The system uses a layered architecture:

1. **Orchestration Layer**: Main controller coordinates the workflow
2. **Data Acquisition Layer**: Playwright-based scraper extracts data
3. **Business Logic Layer**: Comparison engine detects changes
4. **Notification Layer**: ntfy.sh integration for push notifications
5. **Persistence Layer**: File-based storage for data and logs
6. **CI/CD Layer**: CircleCI for automated scheduled execution

## Error Handling

The system handles various error conditions gracefully:

- **Network Errors**: Retries up to 3 times with exponential backoff
- **Page Structure Changes**: Logs detailed error messages
- **File System Errors**: Preserves existing data on write failures
- **Notification Failures**: Logs errors but continues execution
- **Initialization Errors**: Exits cleanly with descriptive messages

All errors are logged with context and timestamps for debugging.

## Project Structure

```
.
├── .circleci/
│   └── config.yml          # CircleCI workflow configuration
├── index.ts                # Entry point
├── src/
│   ├── config.ts           # System configuration
│   ├── types.ts            # TypeScript interfaces
│   ├── controller.ts       # Main orchestration logic
│   ├── scraper.ts          # Playwright web scraper
│   ├── comparison.ts       # Change detection
│   ├── storage.ts          # File persistence
│   ├── logger.ts           # Logging utilities
│   ├── validation.ts       # Data validation
│   └── *.test.ts           # Test files
├── data/                   # Log files
├── last-draw-data.json     # Most recent draw data (tracked in git)
├── .env                    # Environment variables (not in git)
```

## How It Works

1. **Scraping**: Playwright navigates to the Express Entry page, filters for healthcare rounds, and extracts the most recent data
2. **Comparison**: The new data is compared against the stored data (by date)
3. **Notification**: If changes are detected, a push notification is sent via ntfy.sh
4. **Storage**: The new data is saved to `last-draw-data.json`
5. **Logging**: All activity is logged to `./data/monitor.log`
6. **Automation**: CircleCI runs this process on a schedule and commits updates

## Troubleshooting

**Environment variables not loading:**
- Bun automatically loads `.env` files - no need for dotenv package
- Ensure `.env` file is in the root directory
- Check that variable names match exactly (case-sensitive)

**Scraping fails:**
- Verify Playwright browsers are installed: `bunx playwright install chromium`
- Check internet connection
- Verify the Express Entry page structure hasn't changed

**No notifications received:**
- Verify your ntfy.sh channel name is correct
- Check that you're subscribed to the correct channel
- Test by visiting `https://ntfy.sh/your-channel-name` in a browser

## License

Private project.

## Built With

- [Bun](https://bun.sh) - Fast all-in-one JavaScript runtime
- [Playwright](https://playwright.dev) - Browser automation
- [ntfy.sh](https://ntfy.sh) - Simple push notifications
- [fast-check](https://fast-check.dev) - Property-based testing
- [CircleCI](https://circleci.com) - CI/CD automation
