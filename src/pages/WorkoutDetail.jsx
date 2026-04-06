import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fmtDate, fmtTime, fmtDuration, setVolume, SET_TYPES } from '../lib/utils';
import Modal from '../components/Modal';

export default function WorkoutDetail() {
  const { id } = useParams();
  const { workouts, deleteWorkout, settings, getAllExercises } = useApp();
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);
  const allExercises = getAllExercises();
  const exMap = Object.fromEntries(allExercises.map((e) => [e.id, e]));

  const workout = workouts.find((w) => w.id === id);
  if (!workout) {
    return (
      <div className="pt-4">
        <button onClick={() => navigate('/history')} className="btn-ghost mb-4"><ArrowLeft size={16} /> Back</button>
        <p className="text-gray-400 text-center">Workout not found.</p>
      </div>
    );
  }

  const totalVolume = workout.exercises.reduce((eSum, ex) =>
    eSum + ex.sets.reduce((sSum, s) => sSum + setVolume(s), 0), 0);
  const totalSets = workout.exercises.reduce((s, ex) => s + ex.sets.length, 0);

  const handleDelete = () => {
    deleteWorkout(id);
    navigate('/history');
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/history')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" id="workout-detail-back">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold">{workout.name}</h1>
            <p className="text-xs text-gray-500">{fmtDate(workout.completedAt || workout.startedAt)} · {fmtTime(workout.startedAt)}</p>
          </div>
        </div>
        <button onClick={() => setShowDelete(true)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20" id="delete-workout-btn">
          <Trash2 size={18} className="text-gray-400 hover:text-red-500" />
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <div className="text-lg font-bold">{fmtDuration(workout.duration)}</div>
          <div className="text-[11px] text-gray-500">Duration</div>
        </div>
        <div className="card text-center">
          <div className="text-lg font-bold">{totalVolume.toLocaleString()}</div>
          <div className="text-[11px] text-gray-500">Volume ({settings.unit})</div>
        </div>
        <div className="card text-center">
          <div className="text-lg font-bold">{totalSets}</div>
          <div className="text-[11px] text-gray-500">Sets</div>
        </div>
      </div>

      {/* Notes */}
      {workout.notes && (
        <div className="card">
          <div className="text-xs font-medium text-gray-500 mb-1">Notes</div>
          <p className="text-sm">{workout.notes}</p>
        </div>
      )}

      {/* Exercises */}
      {workout.exercises.map((ex, exIdx) => {
        const info = exMap[ex.exerciseId];
        return (
          <div key={ex.id} className="card">
            <div className="font-bold text-brand-500 text-sm mb-2">{info?.name || 'Unknown'}</div>
            {ex.notes && <p className="text-xs text-gray-400 mb-2">{ex.notes}</p>}
            <div className="space-y-1">
              <div className="grid grid-cols-[40px_1fr_1fr_1fr] gap-2 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                <span>Set</span>
                <span>Weight</span>
                <span>Reps</span>
                <span>RPE</span>
              </div>
              {ex.sets.map((s, setIdx) => {
                const typeInfo = SET_TYPES[s.type] || SET_TYPES.normal;
                return (
                  <div key={s.id || setIdx} className="grid grid-cols-[40px_1fr_1fr_1fr] gap-2 items-center py-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md text-center ${typeInfo.colorClass}`}>
                      {s.setNumber || setIdx + 1}{typeInfo.short !== 'N' ? typeInfo.short : ''}
                    </span>
                    <span className="text-sm font-medium">{s.weight || '—'} {s.weight ? settings.unit : ''}</span>
                    <span className="text-sm font-medium">{s.reps || '—'}</span>
                    <span className="text-sm text-gray-400">{s.rpe || '—'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Delete Modal */}
      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Delete Workout" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">This will permanently remove this workout from your history.</p>
        <div className="flex gap-2">
          <button onClick={handleDelete} className="btn-danger flex-1" id="confirm-delete-workout">Delete</button>
          <button onClick={() => setShowDelete(false)} className="btn-secondary flex-1">Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
