import { describe, test, expect } from 'bun:test';
import { compareData } from './comparison';
import type { InvitationData } from './types';

describe('Error Handling', () => {
  test('compareData handles invalid current data gracefully', () => {
    const invalidData = { date: '', invitations: 100, crsScore: 400 } as InvitationData;
    
    expect(() => compareData(null, invalidData)).toThrow('Comparison failed');
  });

  test('compareData handles invalid previous data gracefully', () => {
    const validCurrent: InvitationData = {
      date: '2024-01-15',
      invitations: 100,
      crsScore: 400
    };
    const invalidPrevious = { date: '', invitations: 100, crsScore: 400 } as InvitationData;
    
    expect(() => compareData(invalidPrevious, validCurrent)).toThrow('Comparison failed');
  });

  test('compareData works with valid data', () => {
    const previous: InvitationData = {
      date: '2024-01-14',
      invitations: 100,
      crsScore: 400
    };
    const current: InvitationData = {
      date: '2024-01-15',
      invitations: 150,
      crsScore: 410
    };
    
    const result = compareData(previous, current);
    expect(result.hasChanged).toBe(true);
    expect(result.previous).toEqual(previous);
    expect(result.current).toEqual(current);
  });
});
