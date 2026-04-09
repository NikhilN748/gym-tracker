import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { fmtClock } from '../lib/utils';
import { useApp } from '../context/AppContext';

export default function RestTimer({ isOpen, onClose, defaultSeconds = 90 }) {
  const { settings } = useApp();
  const [remaining, setRemaining] = useState(defaultSeconds);
  const [total, setTotal] = useState(defaultSeconds);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const secs = defaultSeconds || settings.defaultRestSeconds || 90;
      setRemaining(secs);
      setTotal(secs);
      setRunning(true);
    }
  }, [isOpen, defaultSeconds, settings.defaultRestSeconds]);

  useEffect(() => {
    if (!isOpen || !running || remaining <= 0) return;
    const iv = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(iv);
          // Vibrate on completion
          if (settings.vibrateOnRest && navigator.vibrate) {
            try {
              navigator.vibrate([200, 100, 200]);
            } catch (error) {
              console.warn('Vibration failed:', error);
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [isOpen, running, remaining, settings.vibrateOnRest]);

  const adjust = useCallback((delta) => {
    setRemaining((prev) => Math.max(0, prev + delta));
    setTotal((prev) => Math.max(0, prev + delta));
  }, []);

  if (!isOpen) return null;

  const progress = total > 0 ? ((total - remaining) / total) * 100 : 100;
  const isDone = remaining <= 0;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md" onClick={onClose}>
      <div className="relative w-72 text-center" onClick={(e) => e.stopPropagation()}>
        {/* Circle progress */}
        <div className="relative w-52 h-52 mx-auto mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-white/10" strokeWidth="4" />
            <circle
              cx="50" cy="50" r="45" fill="none"
              stroke={isDone ? '#22c55e' : '#1f7af5'}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <span className="text-4xl font-bold font-mono">{fmtClock(remaining)}</span>
            <span className="text-sm text-white/60 mt-1">{isDone ? 'Rest complete!' : 'Rest timer'}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => adjust(-15)} className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors" id="rest-timer-minus">
            <Minus size={18} />
            <span className="text-[10px] absolute mt-8">-15s</span>
          </button>
          <button onClick={onClose} className="w-14 h-14 rounded-full bg-white text-gray-900 flex items-center justify-center font-bold text-sm hover:bg-gray-200 transition-colors" id="rest-timer-dismiss">
            <X size={22} />
          </button>
          <button onClick={() => adjust(15)} className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors" id="rest-timer-plus">
            <Plus size={18} />
            <span className="text-[10px] absolute mt-8">+15s</span>
          </button>
        </div>
      </div>
    </div>
  );
}
