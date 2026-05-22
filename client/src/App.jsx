import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Companion from './components/Companion';
import Hero3D from './pages/Hero3D';
import Dashboard from './pages/Dashboard';
import AITutor from './pages/AITutor';
import StudyPlanner from './pages/StudyPlanner';
import CareerRoadmap from './pages/CareerRoadmap';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import AdaptiveLearning from './pages/AdaptiveLearning';
import Login from './pages/Login';
import MockInterview from './pages/MockInterview';
import { useStore } from './store';

function App() {
  const { token, user, setUser } = useStore();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }
  }, []);

  return (
    <BrowserRouter>
      <div style={{
        background: 'hsl(var(--background))',
        color: 'hsl(var(--foreground))',
        minHeight: '100vh'
      }}>
        {token && <Navbar />}
        <Routes>
          <Route path="/" element={token ? <Dashboard /> : <Hero3D />} />
          <Route path="/login" element={<Login />} />
          <Route path="/tutor" element={token ? <AITutor /> : <Navigate to="/" />} />
          <Route path="/adaptive-learning" element={token ? <AdaptiveLearning /> : <Navigate to="/" />} />
          <Route path="/study-planner" element={token ? <StudyPlanner /> : <Navigate to="/" />} />
          <Route path="/career-roadmap" element={token ? <CareerRoadmap /> : <Navigate to="/" />} />
          <Route path="/resume-analyzer" element={token ? <ResumeAnalyzer /> : <Navigate to="/" />} />
          <Route path="/mock-interview" element={token ? <MockInterview /> : <Navigate to="/" />} />
        </Routes>
        {token && <Companion />}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }
          }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
