import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Dumbbell, TrendingUp, BarChart3, Scale, Camera, CalendarDays, ChevronRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { useApp } from '../context/AppContext';
import {
  calculateStreak, setVolume, startOfWeek, epley1RM, fmtDate
} from '../lib/utils';

const PERIODS = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
  { key: 'all', label: 'All' },
];

const COLORS = ['#1f7af5', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6', '#e11d48', '#84cc16', '#a855f7', '#0ea5e9', '#d946ef', '#eab308'];

export default function Progress() {
  const { workouts, personalRecords, settings, getAllExercises } = useApp();
  const navigate = useNavigate();
  const [period, setPeriod] = useState('month');
  const allExercises = getAllExercises();
  const exMap = Object.fromEntries(allExercises.map((e) => [e.id, e]));

  const filteredWorkouts = useMemo(() => {
    if (period === 'all') return workouts;
    const now = new Date();
    const cutoff = new Date();
    if (period === 'week') cutoff.setDate(now.getDate() - 7);
    else if (period === 'month') cutoff.setMonth(now.getMonth() - 1);
    else if (period === 'year') cutoff.setFullYear(now.getFullYear() - 1);
    return workouts.filter((w) => new Date(w.completedAt || w.startedAt) >= cutoff);
  }, [workouts, period]);

  const streak = calculateStreak(workouts);
  const totalVolume = filteredWorkouts.reduce((sum, w) =>
    sum + w.exercises.reduce((eSum, ex) =>
      eSum + ex.sets.reduce((sSum, s) => sSum + setVolume(s), 0), 0), 0);
  const totalSets = filteredWorkouts.reduce((sum, w) =>
    sum + w.exercises.reduce((s, ex) => s + ex.sets.length, 0), 0);

  // Weekly consistency chart (last 12 weeks)
  const consistencyData = useMemo(() => {
    const weeks = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - i * 7);
      const ws = startOfWeek(weekStart);
      const we = new Date(ws);
      we.setDate(ws.getDate() + 7);
      const count = workouts.filter((w) => {
        const d = new Date(w.completedAt || w.startedAt);
        return d >= ws && d < we;
      }).length;
      weeks.push({
        week: `W${12 - i}`,
        workouts: count,
      });
    }
    return weeks;
  }, [workouts]);

  // Muscle group sets (current week)
  const muscleData = useMemo(() => {
    const ws = startOfWeek(new Date());
    const we = new Date(ws);
    we.setDate(ws.getDate() + 7);
    const counts = {};
    workouts.forEach((w) => {
      const d = new Date(w.completedAt || w.startedAt);
      if (d < ws || d >= we) return;
      w.exercises.forEach((ex) => {
        const info = exMap[ex.exerciseId];
        if (!info) return;
        counts[info.muscle] = (counts[info.muscle] || 0) + ex.sets.length;
      });
    });
    return Object.entries(counts)
      .map(([muscle, sets]) => ({ muscle, sets }))
      .sort((a, b) => b.sets - a.sets);
  }, [workouts, exMap]);

  // Muscle distribution pie (selected period)
  const musclePieData = useMemo(() => {
    const counts = {};
    filteredWorkouts.forEach((w) => {
      w.exercises.forEach((ex) => {
        const info = exMap[ex.exerciseId];
        if (!info) return;
        counts[info.muscle] = (counts[info.muscle] || 0) + ex.sets.length;
      });
    });
    const total = Object.values(counts).reduce((s, v) => s + v, 0);
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value, pct: total ? Math.round((value / total) * 100) : 0 }))
      .sort((a, b) => b.value - a.value);
  }, [filteredWorkouts, exMap]);

  // Volume over time
  const volumeData = useMemo(() => {
    return [...filteredWorkouts].reverse().map((w) => ({
      date: new Date(w.completedAt || w.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: w.exercises.reduce((eSum, ex) =>
        eSum + ex.sets.reduce((sSum, s) => sSum + setVolume(s), 0), 0),
    }));
  }, [filteredWorkouts]);

  // Top PRs
  const topPRs = useMemo(() => {
    return Object.entries(personalRecords)
      .map(([exId, pr]) => ({ exerciseId: exId, ...pr, name: exMap[exId]?.name || 'Unknown' }))
      .sort((a, b) => (b.max1RM || 0) - (a.max1RM || 0))
      .slice(0, 8);
  }, [personalRecords, exMap]);

  return (
    <div className="space-y-6 pb-4">
      <div className="pt-2">
        <h1 className="text-2xl font-bold">Progress</h1>
      </div>

      {/* Period filter */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              period === p.key ? 'bg-brand-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            id={`period-${p.key}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center">
          <Flame className="mx-auto text-orange-500 mb-1" size={20} />
          <div className="text-2xl font-bold">{streak}</div>
          <div className="text-[11px] text-gray-500">Day Streak</div>
        </div>
        <div className="card text-center">
          <CalendarDays className="mx-auto text-brand-500 mb-1" size={20} />
          <div className="text-2xl font-bold">{filteredWorkouts.length}</div>
          <div className="text-[11px] text-gray-500">Workouts</div>
        </div>
        <div className="card text-center">
          <TrendingUp className="mx-auto text-green-500 mb-1" size={20} />
          <div className="text-2xl font-bold">{totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : totalVolume}</div>
          <div className="text-[11px] text-gray-500">Volume ({settings.unit})</div>
        </div>
        <div className="card text-center">
          <BarChart3 className="mx-auto text-purple-500 mb-1" size={20} />
          <div className="text-2xl font-bold">{totalSets}</div>
          <div className="text-[11px] text-gray-500">Total Sets</div>
        </div>
      </div>

      {/* Nav cards */}
      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => navigate('/measurements')} className="card text-center hover:border-brand-300 dark:hover:border-brand-700" id="nav-measurements">
          <Scale className="mx-auto text-brand-500 mb-1" size={18} />
          <div className="text-xs font-medium">Measurements</div>
        </button>
        <button onClick={() => navigate('/photos')} className="card text-center hover:border-brand-300 dark:hover:border-brand-700" id="nav-photos">
          <Camera className="mx-auto text-brand-500 mb-1" size={18} />
          <div className="text-xs font-medium">Photos</div>
        </button>
        <button onClick={() => navigate('/year-review')} className="card text-center hover:border-brand-300 dark:hover:border-brand-700" id="nav-year-review">
          <CalendarDays className="mx-auto text-brand-500 mb-1" size={18} />
          <div className="text-xs font-medium">Year Review</div>
        </button>
      </div>

      {/* Consistency Chart */}
      {workouts.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-sm mb-3">Workout Consistency</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={consistencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #e5e7eb)" />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="workouts" fill="#1f7af5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Muscle Group Sets */}
      {muscleData.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-sm mb-3">Sets per Muscle (This Week)</h3>
          <div className="space-y-2">
            {muscleData.map((m, i) => (
              <div key={m.muscle} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-20 text-right">{m.muscle}</span>
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(m.sets / Math.max(...muscleData.map((x) => x.sets))) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }}
                  />
                </div>
                <span className="text-xs font-bold w-6">{m.sets}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Muscle Distribution Pie */}
      {musclePieData.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-sm mb-3">Muscle Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={musclePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, pct }) => `${name} ${pct}%`} labelLine={{ strokeWidth: 1 }}>
                {musclePieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Volume Over Time */}
      {volumeData.length > 1 && (
        <div className="card">
          <h3 className="font-bold text-sm mb-3">Volume Over Time</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #e5e7eb)" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Line type="monotone" dataKey="volume" stroke="#1f7af5" strokeWidth={2} dot={{ fill: '#1f7af5', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Personal Records */}
      {topPRs.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-sm mb-3">Personal Records</h3>
          <div className="space-y-2">
            {topPRs.map((pr) => (
              <button
                key={pr.exerciseId}
                onClick={() => navigate(`/exercise/${pr.exerciseId}`)}
                className="w-full flex items-center justify-between py-2 px-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                id={`pr-${pr.exerciseId}`}
              >
                <div>
                  <div className="text-sm font-medium">{pr.name}</div>
                  <div className="text-xs text-gray-400">
                    Est. 1RM: {pr.max1RM?.toFixed(1)} {settings.unit}
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
