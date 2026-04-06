// ── ID Generation ──
export function uid(prefix = '') {
  return `${prefix}${prefix ? '_' : ''}${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ── Date/Time Formatting ──
export function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

export function fmtTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function fmtDuration(seconds) {
  if (!seconds || seconds < 0) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function fmtClock(seconds) {
  if (!seconds || seconds < 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n) => String(n).padStart(2, '0');
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${m}:${pad(s)}`;
}

// ── Date Helpers ──
export function startOfDay(d) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function startOfWeek(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday as start
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

// ── Calculations ──
export function epley1RM(weight, reps) {
  if (!weight || !reps || reps <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

export function setVolume(set) {
  if (!set || !set.weight || !set.reps) return 0;
  return set.weight * set.reps;
}

export function calculateWarmupSets(workingWeight, barWeight = 45) {
  if (workingWeight <= barWeight) return [{ weight: barWeight, reps: 10 }];
  const sets = [
    { pct: 0, reps: 10, label: 'Bar' },
    { pct: 0.4, reps: 10, label: '40%' },
    { pct: 0.6, reps: 8, label: '60%' },
    { pct: 0.8, reps: 5, label: '80%' },
  ];
  return sets.map(({ pct, reps, label }) => ({
    weight: pct === 0 ? barWeight : Math.round((workingWeight * pct) / 5) * 5,
    reps,
    label,
  }));
}

export function calculatePlates(targetWeight, barWeight = 45, availablePlates = null) {
  const defaultPlatesLb = [45, 35, 25, 10, 5, 2.5];
  const defaultPlatesKg = [25, 20, 15, 10, 5, 2.5, 1.25];
  const plates = availablePlates || defaultPlatesLb;
  const perSide = (targetWeight - barWeight) / 2;
  if (perSide <= 0) return [];
  const result = [];
  let remaining = perSide;
  for (const plate of plates) {
    while (remaining >= plate) {
      result.push(plate);
      remaining -= plate;
    }
  }
  return result;
}

export function calculateStreak(workouts) {
  if (!workouts || workouts.length === 0) return 0;
  const today = startOfDay(new Date());
  const sortedDays = [...new Set(
    workouts.map((w) => startOfDay(new Date(w.completedAt || w.startedAt)).getTime())
  )].sort((a, b) => b - a);

  if (sortedDays.length === 0) return 0;
  const lastDay = sortedDays[0];
  const diffFromToday = (today.getTime() - lastDay) / (1000 * 60 * 60 * 24);
  if (diffFromToday > 1) return 0;

  let streak = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const diff = (sortedDays[i - 1] - sortedDays[i]) / (1000 * 60 * 60 * 24);
    if (diff <= 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function downloadJSON(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Constants ──
export const SET_TYPES = {
  normal: { label: 'Normal', short: 'N', colorClass: 'bg-brand-500 text-white' },
  warmup: { label: 'Warm Up', short: 'W', colorClass: 'bg-amber-500 text-white' },
  dropset: { label: 'Drop Set', short: 'D', colorClass: 'bg-purple-500 text-white' },
  failure: { label: 'Failure', short: 'F', colorClass: 'bg-red-500 text-white' },
};

export const SET_TYPE_ORDER = ['normal', 'warmup', 'dropset', 'failure'];

export const STANDARD_PLATES_LB = [45, 35, 25, 10, 5, 2.5];
export const STANDARD_PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25];

export const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms',
  'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Abs', 'Traps',
  'Lats', 'Full Body', 'Cardio', 'Other',
];

export const EQUIPMENT_TYPES = [
  'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight',
  'Kettlebell', 'Band', 'Smith Machine', 'Other',
];

export const PLATE_COLORS = {
  45: 'bg-red-500',
  35: 'bg-blue-500',
  25: 'bg-yellow-500',
  20: 'bg-blue-500',
  15: 'bg-yellow-400',
  10: 'bg-green-500',
  5: 'bg-slate-400',
  2.5: 'bg-slate-300',
  1.25: 'bg-slate-200',
};
