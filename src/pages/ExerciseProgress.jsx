import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext';
import { epley1RM, setVolume, fmtDate, SET_TYPES } from '../lib/utils';

export default function ExerciseProgress() {
  const { id } = useParams();
  const { workouts, personalRecords, settings, getAllExercises } = useApp();
  const navigate = useNavigate();
  const allExercises = getAllExercises();
  const exMap = Object.fromEntries(allExercises.map((e) => [e.id, e]));
  const exercise = exMap[id];
  const pr = personalRecords[id] || {};
  const [metric, setMetric] = useState('1rm');

  // Gather all sets for this exercise
  const history = useMemo(() => {
    const entries = [];
    [...workouts].reverse().forEach((w) => {
      w.exercises.forEach((ex) => {
        if (ex.exerciseId !== id) return;
        ex.sets.forEach((s) => {
          if (s.weight && s.reps) {
            entries.push({
              date: fmtDate(w.completedAt || w.startedAt),
              weight: Number(s.weight),
              reps: Number(s.reps),
              est1RM: epley1RM(Number(s.weight), Number(s.reps)),
              volume: Number(s.weight) * Number(s.reps),
              type: s.type,
              rpe: s.rpe,
            });
          }
        });
      });
    });
    return entries;
  }, [workouts, id]);

  const chartData = useMemo(() => {
    const grouped = {};
    history.forEach((h) => {
      if (!grouped[h.date]) grouped[h.date] = { date: h.date, value: 0 };
      const val = metric === '1rm' ? h.est1RM : metric === 'weight' ? h.weight : h.volume;
      grouped[h.date].value = Math.max(grouped[h.date].value, val);
    });
    return Object.values(grouped);
  }, [history, metric]);

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center gap-3 pt-2">
        <button onClick={() => navigate('/progress')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" id="exercise-progress-back">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold">{exercise?.name || 'Unknown'}</h1>
          <p className="text-xs text-gray-500">{exercise?.muscle} · {exercise?.equipment}</p>
        </div>
      </div>

      {/* PR Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <div className="text-lg font-bold">{pr.maxWeight || '—'}</div>
          <div className="text-[11px] text-gray-500">Max Weight</div>
        </div>
        <div className="card text-center">
          <div className="text-lg font-bold">{pr.max1RM?.toFixed(1) || '—'}</div>
          <div className="text-[11px] text-gray-500">Est. 1RM</div>
        </div>
        <div className="card text-center">
          <div className="text-lg font-bold">{pr.maxVolume || '—'}</div>
          <div className="text-[11px] text-gray-500">Best Volume</div>
        </div>
      </div>

      {/* Metric Toggle */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
        {[
          { key: '1rm', label: 'Est. 1RM' },
          { key: 'weight', label: 'Top Weight' },
          { key: 'volume', label: 'Volume' },
        ].map((m) => (
          <button
            key={m.key}
            onClick={() => setMetric(m.key)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              metric === m.key ? 'bg-brand-500 text-white shadow-md' : 'text-gray-500'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="card">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Line type="monotone" dataKey="value" stroke="#1f7af5" strokeWidth={2} dot={{ fill: '#1f7af5', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Full History */}
      <div className="card">
        <h3 className="font-bold text-sm mb-2">Set History</h3>
        <div className="space-y-1 max-h-80 overflow-y-auto">
          <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr] gap-2 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
            <span>Date</span>
            <span>Weight</span>
            <span>Reps</span>
            <span>1RM</span>
            <span>RPE</span>
          </div>
          {history.map((h, i) => {
            const typeInfo = SET_TYPES[h.type] || SET_TYPES.normal;
            return (
              <div key={i} className="grid grid-cols-[80px_1fr_1fr_1fr_1fr] gap-2 items-center py-1 text-sm">
                <span className="text-xs text-gray-500 truncate">{h.date}</span>
                <span className="font-medium">{h.weight}</span>
                <span>{h.reps}</span>
                <span className="text-gray-400">{h.est1RM.toFixed(1)}</span>
                <span className="text-gray-400">{h.rpe || '—'}</span>
              </div>
            );
          })}
          {history.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No data yet</p>}
        </div>
      </div>
    </div>
  );
}
