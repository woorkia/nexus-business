
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import { DataProvider } from './context/DataContext';

import Dashboard from './pages/Dashboard';
import Agenda from './pages/Agenda';
import Tasks from './pages/Tasks';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Login from './pages/Login';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // { id: 'samuel', name: 'Samuel', role: 'Founder' }

  if (!isAuthenticated) {
    return <Login onLogin={(user) => {
      setIsAuthenticated(true);
      setCurrentUser(user);
    }} />;
  }

  return (
    <DataProvider currentUser={currentUser}>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="agenda" element={<Agenda />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
          </Route>
        </Routes>
      </Router>
    </DataProvider>
  );
}

export default App;
