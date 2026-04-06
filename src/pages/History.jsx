import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fmtDate, fmtDuration, setVolume } from '../lib/utils';

export default function History() {
  const { workouts, settings, getAllExercises } = useApp();
  const navigate = useNavigate();
  const allExercises = getAllExercises();
  const exMap = Object.fromEntries(allExercises.map((e) => [e.id, e]));

  const grouped = useMemo(() => {
    const map = {};
    workouts.forEach((w) => {
      const d = new Date(w.completedAt || w.startedAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!map[key]) map[key] = { label, workouts: [] };
      map[key].workouts.push(w);
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
              {monthWorkouts.map((w) => {
                const vol = w.exercises.reduce((eSum, ex) =>
                  eSum + ex.sets.reduce((sSum, s) => sSum + setVolume(s), 0), 0);
                const totalSets = w.exercises.reduce((s, ex) => s + ex.sets.length, 0);
                return (
                  <button
                    key={w.id}
                    onClick={() => navigate(`/workout/${w.id}`)}
                    className="card w-full text-left hover:border-brand-300 dark:hover:border-brand-700 transition-colors flex items-center justify-between"
                    id={`history-workout-${w.id}`}
                  >
                    <div>
                      <div className="font-semibold text-sm">{w.name}</div>
                      <div className="text-xs text-gray-500">{fmtDate(w.completedAt || w.startedAt)}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {fmtDuration(w.duration)} · {vol.toLocaleString()} {settings.unit} · {totalSets} sets
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
