import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';

const Home = lazy(() => import('./pages/Home'));
const Routines = lazy(() => import('./pages/Routines'));
const RoutineEditor = lazy(() => import('./pages/RoutineEditor'));
const ActiveWorkout = lazy(() => import('./pages/ActiveWorkout'));
const History = lazy(() => import('./pages/History'));
const WorkoutDetail = lazy(() => import('./pages/WorkoutDetail'));
const Progress = lazy(() => import('./pages/Progress'));
const ExerciseProgress = lazy(() => import('./pages/ExerciseProgress'));
const Measurements = lazy(() => import('./pages/Measurements'));
const Photos = lazy(() => import('./pages/Photos'));
const YearReview = lazy(() => import('./pages/YearReview'));
const Profile = lazy(() => import('./pages/Profile'));

function PageFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="card text-center max-w-sm">
        <div className="w-10 h-10 mx-auto rounded-full border-4 border-brand-100 border-t-brand-500 animate-spin mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading your training data...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Layout>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/routines" element={<Routines />} />
              <Route path="/routine/:id" element={<RoutineEditor />} />
              <Route path="/active-workout" element={<ActiveWorkout />} />
              <Route path="/history" element={<History />} />
              <Route path="/workout/:id" element={<WorkoutDetail />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/exercise/:id" element={<ExerciseProgress />} />
              <Route path="/measurements" element={<Measurements />} />
              <Route path="/photos" element={<Photos />} />
              <Route path="/year-review" element={<YearReview />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Suspense>
        </Layout>
      </HashRouter>
    </AppProvider>
  );
}
