import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PensumProvider } from './context/PensumContext';
import Layout from './components/layout/Layout';

import Welcome from './pages/Welcome/Welcome';
import AuthContainer from './pages/Auth/AuthContainer';
import Onboarding from './pages/Auth/Onboarding';
import Dashboard from './pages/Dashboard/Dashboard';
import Enrollment from './pages/Enrollment/Enrollment';
import Schedule from './pages/Schedule/Schedule';
import Classroom from './pages/Classroom/Classroom';
import AdminPanel from './pages/Admin/AdminPanel';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
    return (
    <ThemeProvider>
        <AuthProvider>
            <PensumProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<Welcome />} />
                        <Route path="/auth" element={<AuthContainer />} />
                        <Route path="/onboarding" element={<Onboarding />} />

                        <Route path="/app" element={<Layout />}>
                            <Route index element={<Dashboard />} />
                            <Route path="inscripciones" element={<Enrollment />} />
                            <Route path="horario" element={<Schedule />} />
                            <Route path="aula-virtual" element={<Classroom />} />
                            <Route path="admin-panel" element={<AdminPanel />} />
                        </Route>

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </PensumProvider>
        </AuthProvider>
    </ThemeProvider>
    );
}

export default App;