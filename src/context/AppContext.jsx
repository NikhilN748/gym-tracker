import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { getItem, setItem, removeItem, StorageKeys } from '../lib/storage';
import { defaultExercises } from '../data/exercises';
import { uid, epley1RM, setVolume } from '../lib/utils';

const AppContext = createContext(null);

const DEFAULT_SETTINGS = {
  unit: 'lb',
  darkMode: false,
  defaultRestSeconds: 90,
  barWeight: 45,
  barWeightKg: 20,
  vibrateOnRest: true,
};

function loadInitialState() {
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
    photos: getItem(StorageKeys.PHOTOS) || [],
    personalRecords: getItem(StorageKeys.PERSONAL_RECORDS) || {},
  };
}

function reducer(state, action) {
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
      return { ...state, photos: action.payload };
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

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadInitialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Persist to localStorage on changes
  useEffect(() => { setItem(StorageKeys.SETTINGS, state.settings); }, [state.settings]);
  useEffect(() => { setItem(StorageKeys.ROUTINES, state.routines); }, [state.routines]);
  useEffect(() => { setItem(StorageKeys.WORKOUTS, state.workouts); }, [state.workouts]);
  useEffect(() => { setItem(StorageKeys.MEASUREMENTS, state.measurements); }, [state.measurements]);
  useEffect(() => { setItem(StorageKeys.PHOTOS, state.photos); }, [state.photos]);
  useEffect(() => { setItem(StorageKeys.PERSONAL_RECORDS, state.personalRecords); }, [state.personalRecords]);
  useEffect(() => { setItem(StorageKeys.CUSTOM_EXERCISES, state.customExercises); }, [state.customExercises]);
  useEffect(() => {
    if (state.activeWorkout) {
      setItem(StorageKeys.ACTIVE_WORKOUT, state.activeWorkout);
    } else {
      removeItem(StorageKeys.ACTIVE_WORKOUT);
    }
  }, [state.activeWorkout]);

  // Dark mode class management
  useEffect(() => {
    if (state.settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.settings.darkMode]);

  // ── Actions ──
  const updateSettings = useCallback((updates) => {
    dispatch({ type: 'SET_SETTINGS', payload: updates });
  }, []);

  const addCustomExercise = useCallback((exercise) => {
    const newEx = { ...exercise, id: uid('cex'), isCustom: true };
    dispatch({ type: 'SET_CUSTOM_EXERCISES', payload: [...stateRef.current.customExercises, newEx] });
    return newEx;
  }, []);

  const getAllExercises = useCallback(() => {
    return [...state.exercises, ...state.customExercises];
  }, [state.exercises, state.customExercises]);

  // ── Routines ──
  const saveRoutine = useCallback((routine) => {
    const existing = stateRef.current.routines;
    if (routine.id) {
      dispatch({ type: 'SET_ROUTINES', payload: existing.map((r) => r.id === routine.id ? routine : r) });
    } else {
      const newRoutine = { ...routine, id: uid('rt') };
      dispatch({ type: 'SET_ROUTINES', payload: [...existing, newRoutine] });
    }
  }, []);

  const deleteRoutine = useCallback((id) => {
    dispatch({ type: 'SET_ROUTINES', payload: stateRef.current.routines.filter((r) => r.id !== id) });
  }, []);

  // ── Active Workout ──
  const startWorkout = useCallback((fromRoutine = null) => {
    const workout = {
      id: uid('wk'),
      name: fromRoutine ? fromRoutine.name : 'Empty Workout',
      startedAt: new Date().toISOString(),
      notes: '',
      exercises: fromRoutine
        ? fromRoutine.exercises.map((ex) => ({
            id: uid('wex'),
            exerciseId: ex.exerciseId,
            notes: '',
            supersetGroup: null,
            sets: ex.sets.map((s, i) => ({
              id: uid('set'),
              setNumber: i + 1,
              type: 'normal',
              weight: s.weight || '',
              reps: s.reps || '',
              rpe: '',
              completed: false,
            })),
          }))
        : [],
    };
    dispatch({ type: 'SET_ACTIVE_WORKOUT', payload: workout });
    return workout;
  }, []);

  const updateActiveWorkout = useCallback((workout) => {
    dispatch({ type: 'SET_ACTIVE_WORKOUT', payload: workout });
  }, []);

  const addExerciseToWorkout = useCallback((exerciseId) => {
    const aw = stateRef.current.activeWorkout;
    if (!aw) return;
    const newExercise = {
      id: uid('wex'),
      exerciseId,
      notes: '',
      supersetGroup: null,
      sets: [{
        id: uid('set'),
        setNumber: 1,
        type: 'normal',
        weight: '',
        reps: '',
        rpe: '',
        completed: false,
      }],
    };
    dispatch({
      type: 'SET_ACTIVE_WORKOUT',
      payload: { ...aw, exercises: [...aw.exercises, newExercise] },
    });
  }, []);

  const removeExerciseFromWorkout = useCallback((exerciseEntryId) => {
    const aw = stateRef.current.activeWorkout;
    if (!aw) return;
    dispatch({
      type: 'SET_ACTIVE_WORKOUT',
      payload: { ...aw, exercises: aw.exercises.filter((e) => e.id !== exerciseEntryId) },
    });
  }, []);

  const addSetToExercise = useCallback((exerciseEntryId) => {
    const aw = stateRef.current.activeWorkout;
    if (!aw) return;
    const updated = {
      ...aw,
      exercises: aw.exercises.map((ex) => {
        if (ex.id !== exerciseEntryId) return ex;
        const newSet = {
          id: uid('set'),
          setNumber: ex.sets.length + 1,
          type: 'normal',
          weight: '',
          reps: '',
          rpe: '',
          completed: false,
        };
        return { ...ex, sets: [...ex.sets, newSet] };
      }),
    };
    dispatch({ type: 'SET_ACTIVE_WORKOUT', payload: updated });
  }, []);

  const removeSetFromExercise = useCallback((exerciseEntryId, setId) => {
    const aw = stateRef.current.activeWorkout;
    if (!aw) return;
    const updated = {
      ...aw,
      exercises: aw.exercises.map((ex) => {
        if (ex.id !== exerciseEntryId) return ex;
        const filtered = ex.sets.filter((s) => s.id !== setId);
        return { ...ex, sets: filtered.map((s, i) => ({ ...s, setNumber: i + 1 })) };
      }),
    };
    dispatch({ type: 'SET_ACTIVE_WORKOUT', payload: updated });
  }, []);

  const updateSet = useCallback((exerciseEntryId, setId, updates) => {
    const aw = stateRef.current.activeWorkout;
    if (!aw) return;
    const updated = {
      ...aw,
      exercises: aw.exercises.map((ex) => {
        if (ex.id !== exerciseEntryId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => s.id === setId ? { ...s, ...updates } : s),
        };
      }),
    };
    dispatch({ type: 'SET_ACTIVE_WORKOUT', payload: updated });
  }, []);

  const checkPR = useCallback((exerciseId, weight, reps) => {
    if (!weight || !reps || reps <= 0) return [];
    const prs = stateRef.current.personalRecords;
    const existing = prs[exerciseId] || {};
    const newPRs = [];
    const est1RM = epley1RM(weight, reps);
    const vol = weight * reps;

    if (!existing.maxWeight || weight > existing.maxWeight) newPRs.push('Max Weight');
    if (!existing.max1RM || est1RM > existing.max1RM) newPRs.push('Est. 1RM');
    if (!existing.maxVolume || vol > existing.maxVolume) newPRs.push('Max Volume');
    return newPRs;
  }, []);

  const updatePersonalRecords = useCallback((exerciseId, weight, reps) => {
    if (!weight || !reps || reps <= 0) return;
    const prs = { ...stateRef.current.personalRecords };
    const existing = prs[exerciseId] || {};
    const est1RM = epley1RM(weight, reps);
    const vol = weight * reps;

    prs[exerciseId] = {
      maxWeight: Math.max(existing.maxWeight || 0, weight),
      max1RM: Math.max(existing.max1RM || 0, est1RM),
      maxVolume: Math.max(existing.maxVolume || 0, vol),
    };
    dispatch({ type: 'SET_PERSONAL_RECORDS', payload: prs });
  }, []);

  const finishWorkout = useCallback(() => {
    const aw = stateRef.current.activeWorkout;
    if (!aw) return null;
    const completedWorkout = {
      ...aw,
      completedAt: new Date().toISOString(),
      exercises: aw.exercises.map((ex) => ({
        ...ex,
        sets: ex.sets.filter((s) => s.completed),
      })).filter((ex) => ex.sets.length > 0),
    };

    // Update PRs for completed sets
    completedWorkout.exercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        if (s.weight && s.reps) {
          updatePersonalRecords(ex.exerciseId, Number(s.weight), Number(s.reps));
        }
      });
    });

    const totalDuration = Math.floor(
      (new Date(completedWorkout.completedAt) - new Date(completedWorkout.startedAt)) / 1000
    );
    completedWorkout.duration = totalDuration;

    dispatch({ type: 'SET_WORKOUTS', payload: [completedWorkout, ...stateRef.current.workouts] });
    dispatch({ type: 'SET_ACTIVE_WORKOUT', payload: null });
    return completedWorkout;
  }, [updatePersonalRecords]);

  const discardWorkout = useCallback(() => {
    dispatch({ type: 'SET_ACTIVE_WORKOUT', payload: null });
  }, []);

  const deleteWorkout = useCallback((id) => {
    dispatch({ type: 'SET_WORKOUTS', payload: stateRef.current.workouts.filter((w) => w.id !== id) });
  }, []);

  // ── Measurements ──
  const addMeasurement = useCallback((entry) => {
    const newEntry = { ...entry, id: uid('ms'), date: new Date().toISOString() };
    dispatch({ type: 'SET_MEASUREMENTS', payload: [newEntry, ...stateRef.current.measurements] });
  }, []);

  const deleteMeasurement = useCallback((id) => {
    dispatch({ type: 'SET_MEASUREMENTS', payload: stateRef.current.measurements.filter((m) => m.id !== id) });
  }, []);

  // ── Photos ──
  const addPhoto = useCallback((dataUrl) => {
    const entry = { id: uid('ph'), dataUrl, date: new Date().toISOString() };
    dispatch({ type: 'SET_PHOTOS', payload: [entry, ...stateRef.current.photos] });
  }, []);

  const deletePhoto = useCallback((id) => {
    dispatch({ type: 'SET_PHOTOS', payload: stateRef.current.photos.filter((p) => p.id !== id) });
  }, []);

  // ── Previous exercise data ──
  const getPreviousExerciseData = useCallback((exerciseId) => {
    const workouts = stateRef.current.workouts;
    for (const w of workouts) {
      const ex = w.exercises.find((e) => e.exerciseId === exerciseId);
      if (ex && ex.sets.length > 0) return ex.sets;
    }
    return null;
  }, []);

  // ── Superset toggling ──
  const toggleSuperset = useCallback((exerciseEntryId) => {
    const aw = stateRef.current.activeWorkout;
    if (!aw) return;
    const idx = aw.exercises.findIndex((e) => e.id === exerciseEntryId);
    if (idx < 0 || idx >= aw.exercises.length - 1) return;

    const current = aw.exercises[idx];
    const next = aw.exercises[idx + 1];
    const groupId = current.supersetGroup || uid('ss');

    const updated = {
      ...aw,
      exercises: aw.exercises.map((ex) => {
        if (ex.id === current.id || ex.id === next.id) {
          if (current.supersetGroup && next.supersetGroup === current.supersetGroup) {
            return { ...ex, supersetGroup: null };
          }
          return { ...ex, supersetGroup: groupId };
        }
        return ex;
      }),
    };
    dispatch({ type: 'SET_ACTIVE_WORKOUT', payload: updated });
  }, []);

  const reloadAll = useCallback(() => {
    dispatch({ type: 'RELOAD_ALL' });
  }, []);

  const value = {
    ...state,
    dispatch,
    updateSettings,
    addCustomExercise,
    getAllExercises,
    saveRoutine,
    deleteRoutine,
    startWorkout,
    updateActiveWorkout,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    addSetToExercise,
    removeSetFromExercise,
    updateSet,
    checkPR,
    updatePersonalRecords,
    finishWorkout,
    discardWorkout,
    deleteWorkout,
    addMeasurement,
    deleteMeasurement,
    addPhoto,
    deletePhoto,
    getPreviousExerciseData,
    toggleSuperset,
    reloadAll,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
