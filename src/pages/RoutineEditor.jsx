import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ExercisePicker from '../components/ExercisePicker';
import { uid } from '../lib/utils';

export default function RoutineEditor() {
  const { id } = useParams();
  const { routines, saveRoutine, getAllExercises } = useApp();
  const navigate = useNavigate();
  const allExercises = getAllExercises();
  const exMap = Object.fromEntries(allExercises.map((exercise) => [exercise.id, exercise]));

  const existing = id !== 'new' ? routines.find((routine) => routine.id === id) : null;

  const [name, setName] = useState(existing?.name || '');
  const [exercises, setExercises] = useState(existing?.exercises || []);
  const [showPicker, setShowPicker] = useState(false);

  const addExercise = (exerciseId) => {
    setExercises((prev) => [
      ...prev,
      {
        id: uid('rex'),
        exerciseId,
        sets: [{ weight: '', reps: '' }],
      },
    ]);
  };

  const removeExercise = (index) => {
    setExercises((prev) => prev.filter((_, exerciseIndex) => exerciseIndex !== index));
  };

  const moveExercise = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= exercises.length) return;

    const reordered = [...exercises];
    [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
    setExercises(reordered);
  };

  const updateSet = (exerciseIndex, setIndex, field, value) => {
    setExercises((prev) => prev.map((exercise, index) => {
      if (index !== exerciseIndex) return exercise;
      return {
        ...exercise,
        sets: exercise.sets.map((set, currentSetIndex) =>
          currentSetIndex === setIndex ? { ...set, [field]: value } : set
        ),
      };
    }));
  };

  const addSet = (exerciseIndex) => {
    setExercises((prev) => prev.map((exercise, index) => {
      if (index !== exerciseIndex) return exercise;
      return { ...exercise, sets: [...exercise.sets, { weight: '', reps: '' }] };
    }));
  };

  const removeSet = (exerciseIndex, setIndex) => {
    setExercises((prev) => prev.map((exercise, index) => {
      if (index !== exerciseIndex) return exercise;
      return { ...exercise, sets: exercise.sets.filter((_, currentSetIndex) => currentSetIndex !== setIndex) };
    }));
  };

  const handleSave = () => {
    if (!name.trim()) return;

    saveRoutine({
      ...(existing || {}),
      id: existing?.id || undefined,
      name: name.trim(),
      exercises,
    });
    navigate('/routines');
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center gap-3 pt-2">
        <button onClick={() => navigate('/routines')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" id="routine-editor-back">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">{existing ? 'Edit Routine' : 'New Routine'}</h1>
      </div>

      <input
        className="input text-lg font-semibold"
        placeholder="Routine name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        id="routine-name-input"
      />

      {exercises.map((exercise, exerciseIndex) => {
        const info = exMap[exercise.exerciseId];
        return (
          <div key={exercise.id} className="card" id={`routine-exercise-${exerciseIndex}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold text-sm">{info?.name || 'Unknown'}</div>
                <div className="text-xs text-gray-500">{info?.muscle} • {info?.equipment}</div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => moveExercise(exerciseIndex, -1)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" disabled={exerciseIndex === 0}>
                  <ChevronUp size={16} className="text-gray-400" />
                </button>
                <button onClick={() => moveExercise(exerciseIndex, 1)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" disabled={exerciseIndex === exercises.length - 1}>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                <button onClick={() => removeExercise(exerciseIndex)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                  <Trash2 size={16} className="text-gray-400 hover:text-red-500" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-[40px_1fr_1fr_32px] gap-2 text-xs text-gray-400 font-medium px-1">
                <span>SET</span>
                <span>WEIGHT</span>
                <span>REPS</span>
                <span />
              </div>
              {exercise.sets.map((set, setIndex) => (
                <div key={setIndex} className="grid grid-cols-[40px_1fr_1fr_32px] gap-2 items-center">
                  <span className="text-xs font-bold text-gray-400 text-center">{setIndex + 1}</span>
                  <input
                    type="number"
                    className="input-sm"
                    placeholder="-"
                    value={set.weight}
                    onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight', e.target.value)}
                  />
                  <input
                    type="number"
                    className="input-sm"
                    placeholder="-"
                    value={set.reps}
                    onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', e.target.value)}
                  />
                  <button onClick={() => removeSet(exerciseIndex, setIndex)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 size={14} className="text-gray-300" />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => addSet(exerciseIndex)} className="btn-ghost text-xs w-full mt-2">
              <Plus size={14} /> Add Set
            </button>
          </div>
        );
      })}

      <button onClick={() => setShowPicker(true)} className="btn-secondary w-full" id="add-routine-exercise">
        <Plus size={16} /> Add Exercise
      </button>

      <button onClick={handleSave} className="btn-primary w-full" id="save-routine-btn">
        Save Routine
      </button>

      <ExercisePicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={addExercise}
      />
    </div>
  );
}
