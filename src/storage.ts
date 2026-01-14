import { mkdir, readFile, writeFile, rename } from 'fs/promises';
import { dirname } from 'path';
import type { InvitationData, StorageConfig } from './types';
import { logError } from './logger';

/**
 * Read stored invitation data from file
 * Returns null if file doesn't exist or contains invalid data
 */
export async function readStoredData(config: StorageConfig): Promise<InvitationData | null> {
  try {
    const content = await readFile(config.dataFilePath, 'utf-8');
    const data = JSON.parse(content) as InvitationData;
    
    // Basic validation
    if (!data.date || typeof data.invitations !== 'number' || typeof data.crsScore !== 'number') {
      logError(
        new Error('Invalid data structure in storage file'),
        `Storage file ${config.dataFilePath} contains invalid data structure`
      );
      return null;
    }
    
    return data;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    
    // File not found is expected on first run
    if (err.code === 'ENOENT') {
      return null;
    }
    
    // JSON parse errors
    if (error instanceof SyntaxError) {
      logError(
        error,
        `Failed to parse JSON from storage file ${config.dataFilePath}`
      );
      return null;
    }
    
    // Log other errors but still return null to allow system to continue
    logError(
      err,
      `Error reading stored data from ${config.dataFilePath}`
    );
    return null;
  }
}

/**
 * Write invitation data to file using atomic write operation
 * Creates directory if it doesn't exist
 * Preserves existing data on write failures
 */
export async function writeStoredData(config: StorageConfig, data: InvitationData): Promise<void> {
  const tempPath = `${config.dataFilePath}.tmp`;
  
  try {
    // Ensure directory exists
    const dir = dirname(config.dataFilePath);
    try {
      await mkdir(dir, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create directory ${dir}: ${(error as Error).message}`);
    }
    
    // Atomic write: write to temp file, then rename
    // This ensures the original file is preserved if write fails
    const content = JSON.stringify(data, null, 2);
    
    try {
      await writeFile(tempPath, content, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to write to temporary file ${tempPath}: ${(error as Error).message}`);
    }
    
    try {
      await rename(tempPath, config.dataFilePath);
    } catch (error) {
      // Clean up temp file if rename fails
      try {
        await readFile(tempPath);
        // Temp file exists, try to remove it
        const { unlink } = await import('fs/promises');
        await unlink(tempPath);
      } catch {
        // Ignore cleanup errors
      }
      throw new Error(`Failed to rename temporary file to ${config.dataFilePath}: ${(error as Error).message}`);
    }
  } catch (error) {
    logError(
      error as Error,
      `Error writing stored data to ${config.dataFilePath} - existing data preserved`
    );
    throw error;
  }
}
