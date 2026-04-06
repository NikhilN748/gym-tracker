import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Dumbbell, TrendingUp, CalendarDays, Trophy, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fmtDate, fmtDuration, setVolume, calculateStreak } from '../lib/utils';

export default function Home() {
  const { workouts, activeWorkout, startWorkout, settings, getAllExercises } = useApp();
  const navigate = useNavigate();
  const allExercises = getAllExercises();
  const exMap = Object.fromEntries(allExercises.map((e) => [e.id, e]));

  const handleStart = () => {
    if (activeWorkout) {
      navigate('/active-workout');
      return;
    }
    startWorkout();
    navigate('/active-workout');
  };

  const streak = calculateStreak(workouts);
  const thisWeekWorkouts = workouts.filter((w) => {
    const d = new Date(w.completedAt || w.startedAt);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return d >= weekAgo;
  });

  const totalVolume = thisWeekWorkouts.reduce((sum, w) =>
    sum + w.exercises.reduce((eSum, ex) =>
      eSum + ex.sets.reduce((sSum, s) => sSum + setVolume(s), 0), 0), 0);

  const recentWorkouts = workouts.slice(0, 3);

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-bold">GymTracker</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Ready to train?</p>
      </div>

      {/* Quick Start */}
      <button
        onClick={handleStart}
        className="w-full bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-2xl p-5 flex items-center gap-4 shadow-xl shadow-brand-500/20 hover:shadow-brand-500/30 active:scale-[0.98] transition-all duration-200"
        id="quick-start-workout"
      >
        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
          <Plus size={28} />
        </div>
        <div className="text-left">
          <div className="font-bold text-lg">{activeWorkout ? 'Resume Workout' : 'Start Workout'}</div>
          <div className="text-white/70 text-sm">{activeWorkout ? 'Continue your session' : 'Begin an empty workout'}</div>
        </div>
      </button>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 mx-auto mb-2 flex items-center justify-center">
            <Activity size={16} className="text-orange-500" />
          </div>
          <div className="text-xl font-bold">{streak}</div>
          <div className="text-[11px] text-gray-500">Day Streak</div>
        </div>
        <div className="card text-center">
          <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 mx-auto mb-2 flex items-center justify-center">
            <CalendarDays size={16} className="text-brand-500" />
          </div>
          <div className="text-xl font-bold">{thisWeekWorkouts.length}</div>
          <div className="text-[11px] text-gray-500">This Week</div>
        </div>
        <div className="card text-center">
          <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 mx-auto mb-2 flex items-center justify-center">
            <Trophy size={16} className="text-green-500" />
          </div>
          <div className="text-xl font-bold">{totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : totalVolume}</div>
          <div className="text-[11px] text-gray-500">Volume ({settings.unit})</div>
        </div>
      </div>

      {/* Recent Workouts */}
      {recentWorkouts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">Recent Workouts</h2>
            <button onClick={() => navigate('/history')} className="text-brand-500 text-sm font-medium" id="view-all-history">
              View All
            </button>
          </div>
          <div className="space-y-2">
            {recentWorkouts.map((w) => {
              const vol = w.exercises.reduce((eSum, ex) =>
                eSum + ex.sets.reduce((sSum, s) => sSum + setVolume(s), 0), 0);
              const totalSets = w.exercises.reduce((s, ex) => s + ex.sets.length, 0);
              return (
                <button
                  key={w.id}
                  onClick={() => navigate(`/workout/${w.id}`)}
                  className="card w-full text-left hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
                  id={`recent-workout-${w.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm">{w.name}</div>
                      <div className="text-xs text-gray-500">{fmtDate(w.completedAt || w.startedAt)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">{fmtDuration(w.duration)}</div>
                      <div className="text-xs text-gray-400">{vol.toLocaleString()} {settings.unit} · {totalSets} sets</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {workouts.length === 0 && (
        <div className="card text-center py-8">
          <Dumbbell className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={40} />
          <p className="text-gray-400 text-sm">No workouts yet. Hit the button above to start!</p>
        </div>
      )}
    </div>
  );
}
