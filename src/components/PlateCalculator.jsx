import React, { useState } from 'react';
import Modal from './Modal';
import { calculatePlates, PLATE_COLORS, STANDARD_PLATES_LB, STANDARD_PLATES_KG } from '../lib/utils';
import { useApp } from '../context/AppContext';

export default function PlateCalculator({ isOpen, onClose }) {
  const { settings } = useApp();
  const [target, setTarget] = useState('');
  const isKg = settings.unit === 'kg';
  const barWeight = isKg ? (settings.barWeightKg || 20) : (settings.barWeight || 45);
  const plates = isKg ? STANDARD_PLATES_KG : STANDARD_PLATES_LB;

  const targetNum = Number(target);
  const perSide = targetNum > barWeight ? calculatePlates(targetNum, barWeight, plates) : [];
  const loadedWeight = barWeight + perSide.reduce((s, p) => s + p, 0) * 2;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Plate Calculator" size="sm">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Target Weight ({isKg ? 'kg' : 'lb'})</label>
          <input
            type="number"
            className="input text-center text-xl font-bold"
            placeholder={`e.g. ${isKg ? 100 : 225}`}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            id="plate-calc-target"
          />
          <p className="text-xs text-gray-400 mt-1 text-center">Bar: {barWeight}{isKg ? 'kg' : 'lb'}</p>
        </div>

        {targetNum > barWeight && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Per side:</h4>
            <div className="flex flex-wrap gap-2 justify-center">
              {perSide.length === 0 ? (
                <p className="text-sm text-gray-400">Just the bar</p>
              ) : (
                perSide.map((plate, i) => (
                  <span
                    key={i}
                    className={`${PLATE_COLORS[plate] || 'bg-gray-400'} text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-md`}
                  >
                    {plate}
                  </span>
                ))
              )}
            </div>
            {loadedWeight !== targetNum && (
              <p className="text-xs text-amber-500 text-center mt-2">
                Closest loadable: {loadedWeight}{isKg ? 'kg' : 'lb'}
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
