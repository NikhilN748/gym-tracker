import React, { useState } from 'react';
import Modal from './Modal';
import { calculateWarmupSets } from '../lib/utils';
import { useApp } from '../context/AppContext';

export default function WarmupCalculator({ isOpen, onClose }) {
  const { settings } = useApp();
  const [workingWeight, setWorkingWeight] = useState('');
  const isKg = settings.unit === 'kg';
  const barWeight = isKg ? (settings.barWeightKg || 20) : (settings.barWeight || 45);

  const weightNum = Number(workingWeight);
  const warmupSets = weightNum > 0 ? calculateWarmupSets(weightNum, barWeight) : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Warmup Calculator" size="sm">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Working Weight ({isKg ? 'kg' : 'lb'})</label>
          <input
            type="number"
            className="input text-center text-xl font-bold"
            placeholder={`e.g. ${isKg ? 100 : 225}`}
            value={workingWeight}
            onChange={(e) => setWorkingWeight(e.target.value)}
            id="warmup-calc-weight"
          />
        </div>

        {warmupSets.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Warmup Sets:</h4>
            {warmupSets.map((set, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-amber-500 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                    {set.label || `Set ${i + 1}`}
                  </span>
                  <span className="font-semibold">{set.weight} {isKg ? 'kg' : 'lb'}</span>
                </div>
                <span className="text-sm text-gray-500">× {set.reps} reps</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
