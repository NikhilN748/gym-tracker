import React, { useState, useMemo } from 'react';
import { ArrowLeft, Trophy, Calendar, Dumbbell, Clock, BarChart3, Hash, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { fmtDuration, setVolume } from '../lib/utils';

export default function YearReview() {
  const { workouts, settings, getAllExercises } = useApp();
  const navigate = useNavigate();
  const allExercises = getAllExercises();
  const exMap = Object.fromEntries(allExercises.map((e) => [e.id, e]));

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const years = [...new Set(workouts.map((w) => new Date(w.completedAt || w.startedAt).getFullYear()))].sort((a, b) => b - a);
  if (!years.includes(currentYear)) years.unshift(currentYear);

  const yearWorkouts = useMemo(() => {
    return workouts.filter((w) => new Date(w.completedAt || w.startedAt).getFullYear() === year);
  }, [workouts, year]);

  const stats = useMemo(() => {
    let totalTime = 0;
    let totalVol = 0;
    let totalSets = 0;
    let totalReps = 0;
    const exCounts = {};
    const monthCounts = {};

    yearWorkouts.forEach((w) => {
      totalTime += w.duration || 0;
      const month = new Date(w.completedAt || w.startedAt).toLocaleDateString('en-US', { month: 'long' });
      monthCounts[month] = (monthCounts[month] || 0) + 1;
      w.exercises.forEach((ex) => {
        exCounts[ex.exerciseId] = (exCounts[ex.exerciseId] || 0) + 1;
        ex.sets.forEach((s) => {
          totalSets++;
          totalReps += Number(s.reps) || 0;
          totalVol += setVolume(s);
        });
      });
    });

    const favoriteId = Object.entries(exCounts).sort((a, b) => b[1] - a[1])[0];
    const busiestMonth = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0];
    const uniqueExercises = Object.keys(exCounts).length;

    return { totalTime, totalVol, totalSets, totalReps, favoriteId, busiestMonth, uniqueExercises };
  }, [yearWorkouts]);

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center gap-3 pt-2">
        <button onClick={() => navigate('/progress')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" id="year-review-back">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Year in Review</h1>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="input ml-auto w-24"
          id="year-selector"
        >
          {years.map((y) => <option key={y}>{y}</option>)}
        </select>
      </div>

      {/* Hero Card */}
      <div className="bg-gradient-to-br from-brand-500 to-brand-700 text-white rounded-2xl p-6 text-center shadow-xl shadow-brand-500/20">
        <Sparkles className="mx-auto mb-2" size={32} />
        <div className="text-5xl font-black mb-1">{yearWorkouts.length}</div>
        <div className="text-white/70 font-medium">Workouts in {year}</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center">
          <Clock className="mx-auto text-brand-500 mb-1" size={20} />
          <div className="text-lg font-bold">{fmtDuration(stats.totalTime)}</div>
          <div className="text-[11px] text-gray-500">Time Lifting</div>
        </div>
        <div className="card text-center">
          <BarChart3 className="mx-auto text-green-500 mb-1" size={20} />
          <div className="text-lg font-bold">
            {stats.totalVol >= 1000000 ? `${(stats.totalVol / 1000000).toFixed(1)}M`
              : stats.totalVol >= 1000 ? `${(stats.totalVol / 1000).toFixed(1)}k`
              : stats.totalVol}
          </div>
          <div className="text-[11px] text-gray-500">Volume ({settings.unit})</div>
        </div>
        <div className="card text-center">
          <Hash className="mx-auto text-purple-500 mb-1" size={20} />
          <div className="text-lg font-bold">{stats.totalSets.toLocaleString()}</div>
          <div className="text-[11px] text-gray-500">Total Sets</div>
        </div>
        <div className="card text-center">
          <Dumbbell className="mx-auto text-orange-500 mb-1" size={20} />
          <div className="text-lg font-bold">{stats.totalReps.toLocaleString()}</div>
          <div className="text-[11px] text-gray-500">Total Reps</div>
        </div>
      </div>

      {/* Highlights */}
      <div className="space-y-3">
        {stats.favoriteId && (
          <div className="card flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Trophy size={20} className="text-amber-500" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Favorite Exercise</div>
              <div className="font-semibold text-sm">{exMap[stats.favoriteId[0]]?.name || 'Unknown'}</div>
              <div className="text-xs text-gray-400">{stats.favoriteId[1]} times</div>
            </div>
          </div>
        )}
        {stats.busiestMonth && (
          <div className="card flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
              <Calendar size={20} className="text-brand-500" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Busiest Month</div>
              <div className="font-semibold text-sm">{stats.busiestMonth[0]}</div>
              <div className="text-xs text-gray-400">{stats.busiestMonth[1]} workouts</div>
            </div>
          </div>
        )}
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Sparkles size={20} className="text-purple-500" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Variety</div>
            <div className="font-semibold text-sm">{stats.uniqueExercises} unique exercises</div>
          </div>
        </div>
      </div>
    </div>
  );
}
