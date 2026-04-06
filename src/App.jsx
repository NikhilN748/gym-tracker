import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Routines from './pages/Routines';
import RoutineEditor from './pages/RoutineEditor';
import ActiveWorkout from './pages/ActiveWorkout';
import History from './pages/History';
import WorkoutDetail from './pages/WorkoutDetail';
import Progress from './pages/Progress';
import ExerciseProgress from './pages/ExerciseProgress';
import Measurements from './pages/Measurements';
import Photos from './pages/Photos';
import YearReview from './pages/YearReview';
import Profile from './pages/Profile';

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Layout>
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
        </Layout>
      </HashRouter>
    </AppProvider>
  );
}
