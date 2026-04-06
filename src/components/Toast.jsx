import React, { useState, useEffect } from 'react';
import { CheckCircle2, Trophy, Flame } from 'lucide-react';

export default function Toast({ message, type = 'success', duration = 4000, onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDone?.(), 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDone]);

  const icons = {
    success: <CheckCircle2 size={18} />,
    pr: <Trophy size={18} />,
    streak: <Flame size={18} />,
  };

  const bgColors = {
    success: 'bg-green-500',
    pr: 'bg-amber-500',
    streak: 'bg-orange-500',
  };

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[120] ${bgColors[type]} text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 font-semibold text-sm transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
    >
      {icons[type]} {message}
    </div>
  );
}
