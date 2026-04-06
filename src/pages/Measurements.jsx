import React, { useState } from 'react';
import { ArrowLeft, Trash2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext';
import { fmtDate } from '../lib/utils';

const FIELDS = [
  { key: 'bodyWeight', label: 'Body Weight', unit: 'weight' },
  { key: 'bodyFat', label: 'Body Fat %', unit: '%' },
  { key: 'chest', label: 'Chest', unit: 'in' },
  { key: 'waist', label: 'Waist', unit: 'in' },
  { key: 'hips', label: 'Hips', unit: 'in' },
  { key: 'leftBicep', label: 'L Bicep', unit: 'in' },
  { key: 'rightBicep', label: 'R Bicep', unit: 'in' },
  { key: 'leftThigh', label: 'L Thigh', unit: 'in' },
  { key: 'rightThigh', label: 'R Thigh', unit: 'in' },
  { key: 'leftCalf', label: 'L Calf', unit: 'in' },
  { key: 'rightCalf', label: 'R Calf', unit: 'in' },
  { key: 'neck', label: 'Neck', unit: 'in' },
  { key: 'shoulders', label: 'Shoulders', unit: 'in' },
];

export default function Measurements() {
  const { measurements, addMeasurement, deleteMeasurement, settings } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = () => {
    const hasData = Object.values(form).some((v) => v !== '' && v !== undefined);
    if (!hasData) return;
    const numericForm = {};
    Object.entries(form).forEach(([k, v]) => {
      numericForm[k] = v ? Number(v) : null;
    });
    addMeasurement(numericForm);
    setForm({});
    setShowForm(false);
  };

  const weightData = [...measurements]
    .reverse()
    .filter((m) => m.bodyWeight)
    .map((m) => ({
      date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: m.bodyWeight,
    }));

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/progress')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" id="measurements-back">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">Measurements</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary" id="add-measurement-btn">
          <Plus size={16} />
        </button>
      </div>

      {/* Weight chart */}
      {weightData.length > 1 && (
        <div className="card">
          <h3 className="font-bold text-sm mb-2">Body Weight ({settings.unit === 'kg' ? 'kg' : 'lb'})</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Line type="monotone" dataKey="weight" stroke="#1f7af5" strokeWidth={2} dot={{ fill: '#1f7af5', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="card space-y-3">
          <h3 className="font-bold text-sm">New Entry</h3>
          <div className="grid grid-cols-2 gap-3">
            {FIELDS.map((f) => (
              <div key={f.key}>
                <label className="text-[10px] text-gray-500 font-medium block mb-0.5">
                  {f.label} {f.unit === 'weight' ? `(${settings.unit})` : `(${f.unit})`}
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="input-sm w-full"
                  value={form[f.key] || ''}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  id={`measurement-${f.key}`}
                />
              </div>
            ))}
          </div>
          <button onClick={handleSubmit} className="btn-primary w-full" id="save-measurement-btn">Save Entry</button>
        </div>
      )}

      {/* History */}
      <div className="space-y-2">
        {measurements.map((m) => (
          <div key={m.id} className="card flex items-start justify-between">
            <div>
              <div className="text-xs text-gray-500 mb-1">{fmtDate(m.date)}</div>
              <div className="flex flex-wrap gap-2 text-xs">
                {FIELDS.map((f) => {
                  if (!m[f.key]) return null;
                  return (
                    <span key={f.key} className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                      {f.label}: {m[f.key]}
                    </span>
                  );
                })}
              </div>
            </div>
            <button onClick={() => deleteMeasurement(m.id)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
              <Trash2 size={14} className="text-gray-300 hover:text-red-500" />
            </button>
          </div>
        ))}
        {measurements.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">No measurements recorded yet</p>
        )}
      </div>
    </div>
  );
}
