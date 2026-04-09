import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fmtDate, fmtDuration, setVolume } from '../lib/utils';

export default function History() {
  const { workouts, settings } = useApp();
  const navigate = useNavigate();

  const grouped = useMemo(() => {
    const map = {};
    workouts.forEach((workout) => {
      const date = new Date(workout.completedAt || workout.startedAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!map[key]) map[key] = { label, workouts: [] };
      map[key].workouts.push(workout);
    });
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  }, [workouts]);

  return (
    <div className="space-y-6 pb-4">
      <div className="pt-2">
        <h1 className="text-2xl font-bold">History</h1>
        <p className="text-gray-500 text-sm">{workouts.length} workouts logged</p>
      </div>

      {grouped.length === 0 ? (
        <div className="card text-center py-8">
          <Calendar className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={40} />
          <p className="text-gray-400 text-sm">No workout history yet</p>
        </div>
      ) : (
        grouped.map(([key, { label, workouts: monthWorkouts }]) => (
          <div key={key}>
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">{label}</h2>
            <div className="space-y-2">
              {monthWorkouts.map((workout) => {
                const volume = workout.exercises.reduce((exerciseSum, exercise) =>
                  exerciseSum + exercise.sets.reduce((setSum, set) => setSum + setVolume(set), 0), 0);
                const totalSets = workout.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);

                return (
                  <button
                    key={workout.id}
                    onClick={() => navigate(`/workout/${workout.id}`)}
                    className="card w-full text-left hover:border-brand-300 dark:hover:border-brand-700 transition-colors flex items-center justify-between"
                    id={`history-workout-${workout.id}`}
                  >
                    <div>
                      <div className="font-semibold text-sm">{workout.name}</div>
                      <div className="text-xs text-gray-500">{fmtDate(workout.completedAt || workout.startedAt)}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {fmtDuration(workout.duration)} • {volume.toLocaleString()} {settings.unit} • {totalSets} sets
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-300" />
                  </button>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
