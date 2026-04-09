import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext';
import { epley1RM, fmtDate } from '../lib/utils';

export default function ExerciseProgress() {
  const { id } = useParams();
  const { workouts, personalRecords, getAllExercises } = useApp();
  const navigate = useNavigate();
  const allExercises = getAllExercises();
  const exMap = Object.fromEntries(allExercises.map((exercise) => [exercise.id, exercise]));
  const exercise = exMap[id];
  const pr = personalRecords[id] || {};
  const [metric, setMetric] = useState('1rm');

  const history = useMemo(() => {
    const entries = [];
    [...workouts].reverse().forEach((workout) => {
      workout.exercises.forEach((exerciseEntry) => {
        if (exerciseEntry.exerciseId !== id) return;
        exerciseEntry.sets.forEach((set) => {
          if (set.weight && set.reps) {
            entries.push({
              date: fmtDate(workout.completedAt || workout.startedAt),
              weight: Number(set.weight),
              reps: Number(set.reps),
              est1RM: epley1RM(Number(set.weight), Number(set.reps)),
              volume: Number(set.weight) * Number(set.reps),
              rpe: set.rpe,
            });
          }
        });
      });
    });
    return entries;
  }, [workouts, id]);

  const chartData = useMemo(() => {
    const grouped = {};
    history.forEach((entry) => {
      if (!grouped[entry.date]) grouped[entry.date] = { date: entry.date, value: 0 };
      const value = metric === '1rm' ? entry.est1RM : metric === 'weight' ? entry.weight : entry.volume;
      grouped[entry.date].value = Math.max(grouped[entry.date].value, value);
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
          <p className="text-xs text-gray-500">{exercise?.muscle} • {exercise?.equipment}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <div className="text-lg font-bold">{pr.maxWeight || '-'}</div>
          <div className="text-[11px] text-gray-500">Max Weight</div>
        </div>
        <div className="card text-center">
          <div className="text-lg font-bold">{pr.max1RM?.toFixed(1) || '-'}</div>
          <div className="text-[11px] text-gray-500">Est. 1RM</div>
        </div>
        <div className="card text-center">
          <div className="text-lg font-bold">{pr.maxVolume || '-'}</div>
          <div className="text-[11px] text-gray-500">Best Volume</div>
        </div>
      </div>

      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
        {[
          { key: '1rm', label: 'Est. 1RM' },
          { key: 'weight', label: 'Top Weight' },
          { key: 'volume', label: 'Volume' },
        ].map((option) => (
          <button
            key={option.key}
            onClick={() => setMetric(option.key)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              metric === option.key ? 'bg-brand-500 text-white shadow-md' : 'text-gray-500'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

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
          {history.map((entry, index) => (
            <div key={index} className="grid grid-cols-[80px_1fr_1fr_1fr_1fr] gap-2 items-center py-1 text-sm">
              <span className="text-xs text-gray-500 truncate">{entry.date}</span>
              <span className="font-medium">{entry.weight}</span>
              <span>{entry.reps}</span>
              <span className="text-gray-400">{entry.est1RM.toFixed(1)}</span>
              <span className="text-gray-400">{entry.rpe || '-'}</span>
            </div>
          ))}
          {history.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No data yet</p>}
        </div>
      </div>
    </div>
  );
}
