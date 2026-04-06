import React, { useState, useEffect } from 'react';
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
  const exMap = Object.fromEntries(allExercises.map((e) => [e.id, e]));

  const existing = id !== 'new' ? routines.find((r) => r.id === id) : null;

  const [name, setName] = useState(existing?.name || '');
  const [exercises, setExercises] = useState(
    existing?.exercises || []
  );
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

  const removeExercise = (idx) => {
    setExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveExercise = (idx, dir) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= exercises.length) return;
    const copy = [...exercises];
    [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
    setExercises(copy);
  };

  const updateSet = (exIdx, setIdx, field, value) => {
    setExercises((prev) => prev.map((ex, i) => {
      if (i !== exIdx) return ex;
      return {
        ...ex,
        sets: ex.sets.map((s, j) => j === setIdx ? { ...s, [field]: value } : s),
      };
    }));
  };

  const addSet = (exIdx) => {
    setExercises((prev) => prev.map((ex, i) => {
      if (i !== exIdx) return ex;
      return { ...ex, sets: [...ex.sets, { weight: '', reps: '' }] };
    }));
  };

  const removeSet = (exIdx, setIdx) => {
    setExercises((prev) => prev.map((ex, i) => {
      if (i !== exIdx) return ex;
      return { ...ex, sets: ex.sets.filter((_, j) => j !== setIdx) };
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

      {exercises.map((ex, exIdx) => {
        const info = exMap[ex.exerciseId];
        return (
          <div key={ex.id} className="card" id={`routine-exercise-${exIdx}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold text-sm">{info?.name || 'Unknown'}</div>
                <div className="text-xs text-gray-500">{info?.muscle} · {info?.equipment}</div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => moveExercise(exIdx, -1)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" disabled={exIdx === 0}>
                  <ChevronUp size={16} className="text-gray-400" />
                </button>
                <button onClick={() => moveExercise(exIdx, 1)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" disabled={exIdx === exercises.length - 1}>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                <button onClick={() => removeExercise(exIdx)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                  <Trash2 size={16} className="text-gray-400 hover:text-red-500" />
                </button>
              </div>
            </div>

            {/* Sets */}
            <div className="space-y-2">
              <div className="grid grid-cols-[40px_1fr_1fr_32px] gap-2 text-xs text-gray-400 font-medium px-1">
                <span>SET</span>
                <span>WEIGHT</span>
                <span>REPS</span>
                <span></span>
              </div>
              {ex.sets.map((s, setIdx) => (
                <div key={setIdx} className="grid grid-cols-[40px_1fr_1fr_32px] gap-2 items-center">
                  <span className="text-xs font-bold text-gray-400 text-center">{setIdx + 1}</span>
                  <input
                    type="number"
                    className="input-sm"
                    placeholder="—"
                    value={s.weight}
                    onChange={(e) => updateSet(exIdx, setIdx, 'weight', e.target.value)}
                  />
                  <input
                    type="number"
                    className="input-sm"
                    placeholder="—"
                    value={s.reps}
                    onChange={(e) => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                  />
                  <button onClick={() => removeSet(exIdx, setIdx)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 size={14} className="text-gray-300" />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => addSet(exIdx)} className="btn-ghost text-xs w-full mt-2">
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
