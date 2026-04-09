import { describe, expect, it } from 'vitest';
import { parseBackup } from './backup';
import { StorageKeys } from './storage';

describe('parseBackup', () => {
  it('parses the current backup format', () => {
    const backup = {
      version: 2,
      exportedAt: '2026-04-09T00:00:00.000Z',
      data: {
        [StorageKeys.WORKOUTS]: [{ id: 'wk_1' }],
      },
      photos: [{ id: 'ph_1', dataUrl: 'data:image/jpeg;base64,abc', date: '2026-04-09T00:00:00.000Z' }],
    };

    expect(parseBackup(backup)).toEqual({
      data: expect.objectContaining({
        [StorageKeys.WORKOUTS]: [{ id: 'wk_1' }],
      }),
      photos: backup.photos,
    });
  });

  it('parses the legacy storage-key backup format', () => {
    const legacy = {
      [StorageKeys.WORKOUTS]: [{ id: 'wk_2' }],
      [StorageKeys.PHOTOS]: [{ id: 'ph_2', dataUrl: 'data:image/jpeg;base64,xyz', date: '2026-04-08T00:00:00.000Z' }],
    };

    expect(parseBackup(legacy)).toEqual({
      data: expect.objectContaining({
        [StorageKeys.WORKOUTS]: [{ id: 'wk_2' }],
      }),
      photos: legacy[StorageKeys.PHOTOS],
    });
  });

  it('rejects invalid backup payloads', () => {
    expect(() => parseBackup(null)).toThrow('Backup file must contain an object.');
  });
});
