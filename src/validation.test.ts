import { describe, test, expect } from 'bun:test';
import { isValidISODate, isPositiveInteger, isValidInvitationData, validateInvitationData } from './validation';
import type { InvitationData } from './types';

describe('isValidISODate', () => {
  test('accepts valid ISO 8601 dates', () => {
    expect(isValidISODate('2024-01-15')).toBe(true);
    expect(isValidISODate('2023-12-31')).toBe(true);
    expect(isValidISODate('2024-02-29')).toBe(true); // Leap year
  });

  test('rejects invalid date formats', () => {
    expect(isValidISODate('2024/01/15')).toBe(false);
    expect(isValidISODate('15-01-2024')).toBe(false);
    expect(isValidISODate('2024-1-15')).toBe(false);
    expect(isValidISODate('not-a-date')).toBe(false);
  });

  test('rejects invalid dates', () => {
    expect(isValidISODate('2024-02-30')).toBe(false); // February doesn't have 30 days
    expect(isValidISODate('2024-13-01')).toBe(false); // Month 13 doesn't exist
    expect(isValidISODate('2023-02-29')).toBe(false); // Not a leap year
  });
});

describe('isPositiveInteger', () => {
  test('accepts positive integers', () => {
    expect(isPositiveInteger(1)).toBe(true);
    expect(isPositiveInteger(100)).toBe(true);
    expect(isPositiveInteger(3500)).toBe(true);
  });

  test('rejects zero and negative numbers', () => {
    expect(isPositiveInteger(0)).toBe(false);
    expect(isPositiveInteger(-1)).toBe(false);
    expect(isPositiveInteger(-100)).toBe(false);
  });

  test('rejects non-integers', () => {
    expect(isPositiveInteger(1.5)).toBe(false);
    expect(isPositiveInteger(3.14)).toBe(false);
  });
});

describe('isValidInvitationData', () => {
  test('accepts valid InvitationData', () => {
    const validData: InvitationData = {
      date: '2024-01-15',
      invitations: 3500,
      crsScore: 431
    };
    expect(isValidInvitationData(validData)).toBe(true);
  });

  test('rejects invalid date', () => {
    expect(isValidInvitationData({
      date: '2024/01/15',
      invitations: 3500,
      crsScore: 431
    })).toBe(false);
  });

  test('rejects invalid invitations', () => {
    expect(isValidInvitationData({
      date: '2024-01-15',
      invitations: 0,
      crsScore: 431
    })).toBe(false);

    expect(isValidInvitationData({
      date: '2024-01-15',
      invitations: -100,
      crsScore: 431
    })).toBe(false);
  });

  test('rejects invalid crsScore', () => {
    expect(isValidInvitationData({
      date: '2024-01-15',
      invitations: 3500,
      crsScore: 0
    })).toBe(false);
  });

  test('rejects non-object values', () => {
    expect(isValidInvitationData(null)).toBe(false);
    expect(isValidInvitationData(undefined)).toBe(false);
    expect(isValidInvitationData('string')).toBe(false);
    expect(isValidInvitationData(123)).toBe(false);
  });
});

describe('validateInvitationData', () => {
  test('does not throw for valid data', () => {
    const validData: InvitationData = {
      date: '2024-01-15',
      invitations: 3500,
      crsScore: 431
    };
    expect(() => validateInvitationData(validData)).not.toThrow();
  });

  test('throws descriptive error for invalid date', () => {
    expect(() => validateInvitationData({
      date: '2024/01/15',
      invitations: 3500,
      crsScore: 431
    })).toThrow('ISO 8601 format');
  });

  test('throws descriptive error for invalid invitations', () => {
    expect(() => validateInvitationData({
      date: '2024-01-15',
      invitations: 0,
      crsScore: 431
    })).toThrow('positive integer');
  });

  test('throws descriptive error for non-object', () => {
    expect(() => validateInvitationData(null)).toThrow('must be an object');
  });
});
