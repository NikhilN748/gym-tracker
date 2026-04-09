import { clearAllData, getAllData, importAllData, StorageKeys } from './storage';
import { clearPhotos, getAllPhotos, replaceAllPhotos } from './photoStorage';

const BACKUP_VERSION = 2;

function isObject(value) {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function pickKnownDataKeys(data) {
  const output = {};
  Object.values(StorageKeys).forEach((key) => {
    if (key === StorageKeys.PHOTOS) {
      return;
    }
    output[key] = data[key] ?? null;
  });
  return output;
}

export async function createBackup() {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: pickKnownDataKeys(getAllData()),
    photos: await getAllPhotos(),
  };
}

export function parseBackup(raw) {
  if (!isObject(raw)) {
    throw new Error('Backup file must contain an object.');
  }

  if (raw.version === BACKUP_VERSION) {
    if (!isObject(raw.data)) {
      throw new Error('Backup data payload is missing.');
    }

    return {
      data: pickKnownDataKeys(raw.data),
      photos: Array.isArray(raw.photos) ? raw.photos : [],
    };
  }

  const legacyData = pickKnownDataKeys(raw);
  const legacyPhotos = Array.isArray(raw[StorageKeys.PHOTOS]) ? raw[StorageKeys.PHOTOS] : [];

  return {
    data: legacyData,
    photos: legacyPhotos,
  };
}

export async function restoreBackup(backup) {
  const parsed = parseBackup(backup);
  clearAllData();
  importAllData(parsed.data);
  await replaceAllPhotos(parsed.photos);
}

export async function wipeAllAppData() {
  clearAllData();
  await clearPhotos();
}
