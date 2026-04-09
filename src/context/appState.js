import { getItem, setItem, StorageKeys } from '../lib/storage';
import { defaultExercises } from '../data/exercises';

export const DEFAULT_SETTINGS = {
  unit: 'lb',
  darkMode: false,
  defaultRestSeconds: 90,
  barWeight: 45,
  barWeightKg: 20,
  vibrateOnRest: true,
};

export function loadInitialState() {
  const savedExercises = getItem(StorageKeys.EXERCISES);
  if (!savedExercises) {
    setItem(StorageKeys.EXERCISES, defaultExercises);
  }

  return {
    exercises: savedExercises || defaultExercises,
    customExercises: getItem(StorageKeys.CUSTOM_EXERCISES) || [],
    routines: getItem(StorageKeys.ROUTINES) || [],
    workouts: getItem(StorageKeys.WORKOUTS) || [],
    activeWorkout: getItem(StorageKeys.ACTIVE_WORKOUT) || null,
    settings: { ...DEFAULT_SETTINGS, ...(getItem(StorageKeys.SETTINGS) || {}) },
    measurements: getItem(StorageKeys.MEASUREMENTS) || [],
    photos: [],
    personalRecords: getItem(StorageKeys.PERSONAL_RECORDS) || {},
    photosLoaded: false,
  };
}

export function appReducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'SET_ACTIVE_WORKOUT':
      return { ...state, activeWorkout: action.payload };
    case 'SET_ROUTINES':
      return { ...state, routines: action.payload };
    case 'SET_WORKOUTS':
      return { ...state, workouts: action.payload };
    case 'SET_MEASUREMENTS':
      return { ...state, measurements: action.payload };
    case 'SET_PHOTOS':
      return { ...state, photos: action.payload, photosLoaded: true };
    case 'SET_PERSONAL_RECORDS':
      return { ...state, personalRecords: action.payload };
    case 'SET_CUSTOM_EXERCISES':
      return { ...state, customExercises: action.payload };
    case 'RELOAD_ALL':
      return loadInitialState();
    default:
      return state;
  }
}
