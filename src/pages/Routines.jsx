import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Play, Edit, Trash2, Dumbbell } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';

export default function Routines() {
  const { routines, deleteRoutine, startWorkout, activeWorkout, getAllExercises } = useApp();
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState(null);
  const allExercises = getAllExercises();
  const exMap = Object.fromEntries(allExercises.map((e) => [e.id, e]));

  const handleStart = (routine) => {
    if (activeWorkout) {
      if (!confirm('You have an active workout. Starting a new one will discard it. Continue?')) return;
    }
    startWorkout(routine);
    navigate('/active-workout');
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteRoutine(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 pb-4">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-bold">Routines</h1>
        <button onClick={() => navigate('/routine/new')} className="btn-primary" id="create-routine-btn">
          <Plus size={16} /> New
        </button>
      </div>

      {routines.length === 0 ? (
        <div className="card text-center py-8">
          <Dumbbell className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={40} />
          <p className="text-gray-400 text-sm">No routines yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {routines.map((routine) => (
            <div key={routine.id} className="card" id={`routine-${routine.id}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold">{routine.name}</h3>
                <div className="flex items-center gap-1">
                  <button onClick={() => navigate(`/routine/${routine.id}`)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" id={`edit-routine-${routine.id}`}>
                    <Edit size={16} className="text-gray-400" />
                  </button>
                  <button onClick={() => setDeleteId(routine.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" id={`delete-routine-${routine.id}`}>
                    <Trash2 size={16} className="text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              </div>
              <div className="text-xs text-gray-500 mb-3">
                {routine.exercises.map((ex) => exMap[ex.exerciseId]?.name || 'Unknown').join(' · ')}
              </div>
              <button
                onClick={() => handleStart(routine)}
                className="btn-primary w-full"
                id={`start-routine-${routine.id}`}
              >
                <Play size={16} /> Start Workout
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Start empty workout */}
      <button
        onClick={() => {
          if (activeWorkout) {
            navigate('/active-workout');
            return;
          }
          startWorkout();
          navigate('/active-workout');
        }}
        className="w-full btn-secondary"
        id="start-empty-workout"
      >
        <Plus size={16} /> {activeWorkout ? 'Resume Workout' : 'Start Empty Workout'}
      </button>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Routine" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Are you sure you want to delete this routine? This cannot be undone.</p>
        <div className="flex gap-2">
          <button onClick={handleDelete} className="btn-danger flex-1" id="confirm-delete-routine">Delete</button>
          <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1" id="cancel-delete-routine">Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
