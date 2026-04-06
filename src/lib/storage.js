const PREFIX = 'gymtracker:v1:';

export const StorageKeys = {
  EXERCISES: `${PREFIX}exercises`,
  CUSTOM_EXERCISES: `${PREFIX}customExercises`,
  ROUTINES: `${PREFIX}routines`,
  WORKOUTS: `${PREFIX}workouts`,
  ACTIVE_WORKOUT: `${PREFIX}activeWorkout`,
  SETTINGS: `${PREFIX}settings`,
  MEASUREMENTS: `${PREFIX}measurements`,
  PHOTOS: `${PREFIX}photos`,
  PERSONAL_RECORDS: `${PREFIX}personalRecords`,
};

export function getItem(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('localStorage setItem error:', e);
  }
}

export function removeItem(key) {
  localStorage.removeItem(key);
}

export function getAllData() {
  const data = {};
  Object.values(StorageKeys).forEach((key) => {
    data[key] = getItem(key);
  });
  return data;
}

export function importAllData(data) {
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      setItem(key, value);
    }
  });
}

export function clearAllData() {
  Object.values(StorageKeys).forEach((key) => {
    removeItem(key);
  });
}
