import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Dumbbell, TrendingUp, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fmtClock } from '../lib/utils';

const tabs = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/routines', icon: Dumbbell, label: 'Workout' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Layout({ children }) {
  const { activeWorkout } = useApp();
  const location = useLocation();
  const isActiveWorkoutPage = location.pathname === '/active-workout';
  const [elapsed, setElapsed] = React.useState(0);

  React.useEffect(() => {
    if (!activeWorkout) return;
    const update = () => {
      setElapsed(Math.floor((Date.now() - new Date(activeWorkout.startedAt).getTime()) / 1000));
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [activeWorkout]);

  return (
    <div className="min-h-screen pb-20 max-w-3xl mx-auto relative">
      <main className="px-4 pt-4">{children}</main>

      {/* Persistent workout banner */}
      {activeWorkout && !isActiveWorkoutPage && (
        <NavLink
          to="/active-workout"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-brand-500 text-white px-5 py-2.5 rounded-full shadow-xl shadow-brand-500/30 flex items-center gap-2 text-sm font-semibold animate-pulse hover:bg-brand-600 transition-colors"
        >
          <Dumbbell size={16} />
          <span>Workout in progress</span>
          <span className="bg-white/20 rounded-md px-2 py-0.5 text-xs font-mono">{fmtClock(elapsed)}</span>
        </NavLink>
      )}

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 safe-bottom">
        <div className="max-w-3xl mx-auto flex justify-around items-center h-16">
          {tabs.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-brand-500 scale-105'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`
              }
            >
              <Icon size={20} strokeWidth={isActiveWorkoutPage && to === '/routines' ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
