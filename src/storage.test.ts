import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { readStoredData, writeStoredData } from './storage';
import type { InvitationData, StorageConfig } from './types';
import { unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const testConfig: StorageConfig = {
  dataFilePath: './test-data/test-last-draw-data.json',
};

describe('Storage Functions', () => {
  beforeEach(async () => {
    // Clean up test files before each test
    try {
      if (existsSync(testConfig.dataFilePath)) {
        await unlink(testConfig.dataFilePath);
      }
    } catch (error) {
      // Ignore errors if file doesn't exist
    }
  });

  afterEach(async () => {
    // Clean up test files after each test
    try {
      if (existsSync(testConfig.dataFilePath)) {
        await unlink(testConfig.dataFilePath);
      }
    } catch (error) {
      // Ignore errors
    }
  });

  test('readStoredData returns null when file does not exist', async () => {
    const result = await readStoredData(testConfig);
    expect(result).toBeNull();
  });

  test('writeStoredData creates directory and writes data', async () => {
    const testData: InvitationData = {
      date: '2024-01-15',
      invitations: 3500,
      crsScore: 431
    };

    await writeStoredData(testConfig, testData);
    
    expect(existsSync(testConfig.dataFilePath)).toBe(true);
  });

  test('writeStoredData and readStoredData round-trip', async () => {
    const testData: InvitationData = {
      date: '2024-01-15',
      invitations: 3500,
      crsScore: 431
    };

    await writeStoredData(testConfig, testData);
    const result = await readStoredData(testConfig);
    
    expect(result).toEqual(testData);
  });

  test('readStoredData returns null for invalid JSON', async () => {
    await mkdir('./test-data', { recursive: true });
    const fs = await import('fs/promises');
    await fs.writeFile(testConfig.dataFilePath, 'invalid json', 'utf-8');
    
    const result = await readStoredData(testConfig);
    expect(result).toBeNull();
  });

  test('readStoredData returns null for incomplete data', async () => {
    await mkdir('./test-data', { recursive: true });
    const fs = await import('fs/promises');
    await fs.writeFile(testConfig.dataFilePath, JSON.stringify({ date: '2024-01-15' }), 'utf-8');
    
    const result = await readStoredData(testConfig);
    expect(result).toBeNull();
  });
});
