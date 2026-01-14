import type { InvitationData } from './types';

/**
 * Validates if a string is a valid ISO 8601 date format (YYYY-MM-DD)
 */
export function isValidISODate(dateString: string): boolean {
  // Check format with regex: YYYY-MM-DD
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoDateRegex.test(dateString)) {
    return false;
  }

  // Check if it's a valid date
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return false;
  }

  // Verify the date string matches the parsed date (catches invalid dates like 2024-02-30)
  const parts = dateString.split('-').map(Number);
  if (parts.length !== 3 || parts.some(p => isNaN(p))) {
    return false;
  }
  const year = parts[0]!;
  const month = parts[1]!;
  const day = parts[2]!;
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/**
 * Validates if a number is a positive integer
 */
export function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

/**
 * Validates an InvitationData object
 * @returns true if valid, false otherwise
 */
export function isValidInvitationData(data: unknown): data is InvitationData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const obj = data as Record<string, unknown>;

  // Check date field
  if (typeof obj.date !== 'string' || !isValidISODate(obj.date)) {
    return false;
  }

  // Check invitations field
  if (typeof obj.invitations !== 'number' || !isPositiveInteger(obj.invitations)) {
    return false;
  }

  // Check crsScore field
  if (typeof obj.crsScore !== 'number' || !isPositiveInteger(obj.crsScore)) {
    return false;
  }

  return true;
}

/**
 * Validates an InvitationData object and throws an error if invalid
 * @throws Error with descriptive message if validation fails
 */
export function validateInvitationData(data: unknown): asserts data is InvitationData {
  if (!data || typeof data !== 'object') {
    throw new Error('InvitationData must be an object');
  }

  const obj = data as Record<string, unknown>;

  // Validate date field
  if (typeof obj.date !== 'string') {
    throw new Error('InvitationData.date must be a string');
  }
  if (!isValidISODate(obj.date)) {
    throw new Error(`InvitationData.date must be in ISO 8601 format (YYYY-MM-DD), got: ${obj.date}`);
  }

  // Validate invitations field
  if (typeof obj.invitations !== 'number') {
    throw new Error('InvitationData.invitations must be a number');
  }
  if (!isPositiveInteger(obj.invitations)) {
    throw new Error(`InvitationData.invitations must be a positive integer, got: ${obj.invitations}`);
  }

  // Validate crsScore field
  if (typeof obj.crsScore !== 'number') {
    throw new Error('InvitationData.crsScore must be a number');
  }
  if (!isPositiveInteger(obj.crsScore)) {
    throw new Error(`InvitationData.crsScore must be a positive integer, got: ${obj.crsScore}`);
  }
}
