import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Trash2, Check, Clock, Weight, Hash, MoreVertical,
  MessageSquare, Calculator, Flame, X, Link
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import ExercisePicker from '../components/ExercisePicker';
import RestTimer from '../components/RestTimer';
import PlateCalculator from '../components/PlateCalculator';
import WarmupCalculator from '../components/WarmupCalculator';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import { fmtClock, setVolume, SET_TYPES, SET_TYPE_ORDER } from '../lib/utils';

export default function ActiveWorkout() {
  const {
    activeWorkout, updateActiveWorkout, addExerciseToWorkout, removeExerciseFromWorkout,
    addSetToExercise, removeSetFromExercise, updateSet, finishWorkout, discardWorkout,
    checkPR, getAllExercises, getPreviousExerciseData, toggleSuperset, settings,
  } = useApp();
  const navigate = useNavigate();
  const allExercises = getAllExercises();
  const exMap = Object.fromEntries(allExercises.map((e) => [e.id, e]));

  const [elapsed, setElapsed] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [showPlateCalc, setShowPlateCalc] = useState(false);
  const [showWarmupCalc, setShowWarmupCalc] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null);
  const [notesOpen, setNotesOpen] = useState(null);

  useEffect(() => {
    if (!activeWorkout) return undefined;

    const update = () => {
      setElapsed(Math.floor((Date.now() - new Date(activeWorkout.startedAt).getTime()) / 1000));
    };

    update();
    const intervalId = setInterval(update, 1000);
    return () => clearInterval(intervalId);
  }, [activeWorkout, navigate]);

  useEffect(() => {
    if (!activeWorkout) navigate('/');
  }, [activeWorkout, navigate]);

  if (!activeWorkout) return null;

  const totalVolume = activeWorkout.exercises.reduce((sum, ex) =>
    sum + ex.sets.reduce((setSum, set) => setSum + (set.completed ? setVolume(set) : 0), 0), 0);

  const completedSets = activeWorkout.exercises.reduce((sum, ex) =>
    sum + ex.sets.filter((set) => set.completed).length, 0);

  const toggleSetType = (exerciseEntryId, setId, currentType) => {
    const currentIdx = SET_TYPE_ORDER.indexOf(currentType);
    const nextType = SET_TYPE_ORDER[(currentIdx + 1) % SET_TYPE_ORDER.length];
    updateSet(exerciseEntryId, setId, { type: nextType });
  };

  const handleComplete = (exerciseEntryId, setId, exerciseId, weight, reps, type) => {
    const normalizedWeight = Number(weight);
    const normalizedReps = Number(reps);
    updateSet(exerciseEntryId, setId, { completed: true });

    if (normalizedWeight && normalizedReps && type !== 'warmup') {
      const prTypes = checkPR(exerciseId, normalizedWeight, normalizedReps);
      if (prTypes.length > 0) {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message: `New ${prTypes.join(' & ')} PR!`, type: 'pr' }]);
      }
      setShowRestTimer(true);
    }
  };

  const handleUncomplete = (exerciseEntryId, setId) => {
    updateSet(exerciseEntryId, setId, { completed: false });
  };

  const copyPrevious = (exerciseEntryId, setId, exerciseId, setIndex) => {
    const prevData = getPreviousExerciseData(exerciseId);
    if (prevData && prevData[setIndex]) {
      updateSet(exerciseEntryId, setId, {
        weight: prevData[setIndex].weight,
        reps: prevData[setIndex].reps,
      });
    }
  };

  const handleFinish = () => {
    const completed = finishWorkout();
    if (completed) {
      navigate(`/workout/${completed.id}`);
    }
  };

  const handleDiscard = () => {
    discardWorkout();
    navigate('/');
  };

  const updateWorkoutNotes = (notes) => {
    updateActiveWorkout({ ...activeWorkout, notes });
  };

  const updateExerciseNotes = (exerciseEntryId, notes) => {
    updateActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map((exercise) =>
        exercise.id === exerciseEntryId ? { ...exercise, notes } : exercise
      ),
    });
  };

  const updateWorkoutName = (name) => {
    updateActiveWorkout({ ...activeWorkout, name });
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between pt-2">
        <input
          className="text-xl font-bold bg-transparent border-none focus:outline-none w-full"
          value={activeWorkout.name}
          onChange={(e) => updateWorkoutName(e.target.value)}
          id="workout-name-input"
          aria-label="Workout name"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-brand-50 dark:bg-brand-950/50 rounded-xl px-3 py-2 text-center">
          <div className="text-xs text-brand-600 dark:text-brand-400 flex items-center justify-center gap-1"><Clock size={12} /> Duration</div>
          <div className="font-bold text-sm font-mono">{fmtClock(elapsed)}</div>
        </div>
        <div className="bg-green-50 dark:bg-green-950/50 rounded-xl px-3 py-2 text-center">
          <div className="text-xs text-green-600 dark:text-green-400 flex items-center justify-center gap-1"><Weight size={12} /> Volume</div>
          <div className="font-bold text-sm">{totalVolume.toLocaleString()}</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-950/50 rounded-xl px-3 py-2 text-center">
          <div className="text-xs text-purple-600 dark:text-purple-400 flex items-center justify-center gap-1"><Hash size={12} /> Sets</div>
          <div className="font-bold text-sm">{completedSets}</div>
        </div>
      </div>

      <textarea
        className="input text-sm resize-none"
        rows={2}
        placeholder="Workout notes..."
        value={activeWorkout.notes || ''}
        onChange={(e) => updateWorkoutNotes(e.target.value)}
        id="workout-notes"
        aria-label="Workout notes"
      />

      {activeWorkout.exercises.map((exercise, exerciseIndex) => {
        const info = exMap[exercise.exerciseId];
        const prevData = getPreviousExerciseData(exercise.exerciseId);
        const isSuperset = exercise.supersetGroup != null;

        return (
          <div
            key={exercise.id}
            className={`card ${isSuperset ? 'border-l-4 border-l-purple-500' : ''}`}
            id={`workout-exercise-${exerciseIndex}`}
          >
            {isSuperset && (
              <div className="text-[10px] font-bold text-purple-500 uppercase tracking-wider mb-1">Superset</div>
            )}
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-bold text-brand-500 text-sm">{info?.name || 'Unknown'}</div>
                <div className="text-xs text-gray-400">{info?.muscle}</div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(menuOpen === exercise.id ? null : exercise.id)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  id={`exercise-menu-${exerciseIndex}`}
                  aria-label={`Open actions for ${info?.name || 'exercise'}`}
                >
                  <MoreVertical size={16} className="text-gray-400" />
                </button>
                {menuOpen === exercise.id && (
                  <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50 min-w-[160px]">
                    <button onClick={() => { setNotesOpen(notesOpen === exercise.id ? null : exercise.id); setMenuOpen(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                      <MessageSquare size={14} /> Notes
                    </button>
                    <button onClick={() => { toggleSuperset(exercise.id); setMenuOpen(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                      <Link size={14} /> {isSuperset ? 'Remove Superset' : 'Superset with next'}
                    </button>
                    <button onClick={() => { removeExerciseFromWorkout(exercise.id); setMenuOpen(null); }} className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            {notesOpen === exercise.id && (
              <textarea
                className="input text-xs resize-none mb-2"
                rows={2}
                placeholder="Exercise notes..."
                value={exercise.notes || ''}
                onChange={(e) => updateExerciseNotes(exercise.id, e.target.value)}
                aria-label={`Notes for ${info?.name || 'exercise'}`}
              />
            )}

            <div className="grid grid-cols-[36px_52px_1fr_1fr_48px_36px] gap-1 text-[10px] text-gray-400 font-medium px-1 mb-1 uppercase tracking-wider">
              <span>Set</span>
              <span>Prev</span>
              <span>Weight</span>
              <span>Reps</span>
              <span>RPE</span>
              <span className="text-center">Done</span>
            </div>

            {exercise.sets.map((set, setIndex) => {
              const prevSet = prevData?.[setIndex];
              const typeInfo = SET_TYPES[set.type];
              return (
                <div
                  key={set.id}
                  className={`grid grid-cols-[36px_52px_1fr_1fr_48px_36px] gap-1 items-center py-1.5 rounded-lg ${set.completed ? 'bg-green-50 dark:bg-green-950/30' : ''}`}
                >
                  <button
                    onClick={() => toggleSetType(exercise.id, set.id, set.type)}
                    className={`text-[10px] font-bold px-1 py-0.5 rounded-md ${typeInfo.colorClass} text-center`}
                    title={typeInfo.label}
                    aria-label={`Set ${set.setNumber} type ${typeInfo.label}`}
                  >
                    {set.setNumber}{typeInfo.short !== 'N' ? typeInfo.short : ''}
                  </button>
                  <button
                    onClick={() => copyPrevious(exercise.id, set.id, exercise.exerciseId, setIndex)}
                    className="text-[10px] text-gray-400 truncate text-left hover:text-brand-500"
                    title="Tap to copy previous"
                    aria-label={`Copy previous values for set ${set.setNumber}`}
                  >
                    {prevSet ? `${prevSet.weight}x${prevSet.reps}` : '-'}
                  </button>
                  <input
                    type="number"
                    className="input-sm text-xs"
                    placeholder="-"
                    value={set.weight}
                    onChange={(e) => updateSet(exercise.id, set.id, { weight: e.target.value })}
                    aria-label={`Weight for set ${set.setNumber}`}
                  />
                  <input
                    type="number"
                    className="input-sm text-xs"
                    placeholder="-"
                    value={set.reps}
                    onChange={(e) => updateSet(exercise.id, set.id, { reps: e.target.value })}
                    aria-label={`Reps for set ${set.setNumber}`}
                  />
                  <input
                    type="number"
                    className="input-sm text-xs"
                    placeholder="-"
                    step="0.5"
                    min="0"
                    max="10"
                    value={set.rpe}
                    onChange={(e) => updateSet(exercise.id, set.id, { rpe: e.target.value })}
                    aria-label={`RPE for set ${set.setNumber}`}
                  />
                  <button
                    onClick={() => {
                      if (set.completed) {
                        handleUncomplete(exercise.id, set.id);
                      } else {
                        handleComplete(exercise.id, set.id, exercise.exerciseId, set.weight, set.reps, set.type);
                      }
                    }}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${set.completed ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-green-100 dark:hover:bg-green-900/30'}`}
                    id={`complete-set-${exerciseIndex}-${setIndex}`}
                    aria-label={set.completed ? `Mark set ${set.setNumber} incomplete` : `Mark set ${set.setNumber} complete`}
                  >
                    <Check size={16} />
                  </button>
                </div>
              );
            })}

            <div className="flex gap-2 mt-2">
              <button onClick={() => addSetToExercise(exercise.id)} className="btn-ghost text-xs flex-1">
                <Plus size={14} /> Add Set
              </button>
              {exercise.sets.length > 0 && (
                <button
                  onClick={() => removeSetFromExercise(exercise.id, exercise.sets[exercise.sets.length - 1].id)}
                  className="btn-ghost text-xs text-red-400"
                  aria-label={`Remove last set from ${info?.name || 'exercise'}`}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        );
      })}

      <button onClick={() => setShowPicker(true)} className="btn-secondary w-full" id="add-exercise-to-workout">
        <Plus size={16} /> Add Exercise
      </button>

      <div className="flex gap-2">
        <button onClick={() => setShowPlateCalc(true)} className="btn-ghost flex-1 text-xs" id="open-plate-calc">
          <Calculator size={14} /> Plates
        </button>
        <button onClick={() => setShowWarmupCalc(true)} className="btn-ghost flex-1 text-xs" id="open-warmup-calc">
          <Flame size={14} /> Warmup
        </button>
        <button onClick={() => setShowRestTimer(true)} className="btn-ghost flex-1 text-xs" id="open-rest-timer">
          <Clock size={14} /> Rest
        </button>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setShowFinishModal(true)} className="btn-primary flex-1" id="finish-workout-btn">
          <Check size={16} /> Finish
        </button>
        <button onClick={() => setShowDiscardModal(true)} className="btn-ghost text-red-500" id="discard-workout-btn" aria-label="Discard active workout">
          <X size={16} />
        </button>
      </div>

      <ExercisePicker isOpen={showPicker} onClose={() => setShowPicker(false)} onSelect={(id) => addExerciseToWorkout(id)} />
      <RestTimer isOpen={showRestTimer} onClose={() => setShowRestTimer(false)} defaultSeconds={settings.defaultRestSeconds} />
      <PlateCalculator isOpen={showPlateCalc} onClose={() => setShowPlateCalc(false)} />
      <WarmupCalculator isOpen={showWarmupCalc} onClose={() => setShowWarmupCalc(false)} />

      <Modal isOpen={showFinishModal} onClose={() => setShowFinishModal(false)} title="Finish Workout" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Incomplete sets will be removed.</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Duration: {fmtClock(elapsed)}</p>
        <div className="flex gap-2">
          <button onClick={handleFinish} className="btn-primary flex-1" id="confirm-finish-workout">Finish</button>
          <button onClick={() => setShowFinishModal(false)} className="btn-secondary flex-1">Cancel</button>
        </div>
      </Modal>

      <Modal isOpen={showDiscardModal} onClose={() => setShowDiscardModal(false)} title="Discard Workout" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Are you sure? All progress will be lost.</p>
        <div className="flex gap-2">
          <button onClick={handleDiscard} className="btn-danger flex-1" id="confirm-discard-workout">Discard</button>
          <button onClick={() => setShowDiscardModal(false)} className="btn-secondary flex-1">Cancel</button>
        </div>
      </Modal>

      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onDone={() => setToasts((prev) => prev.filter((item) => item.id !== toast.id))} />
      ))}
    </div>
  );
}
