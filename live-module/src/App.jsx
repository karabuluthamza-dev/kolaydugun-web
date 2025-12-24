import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DJDashboard from './pages/DJDashboard';
import LiveFeed from './pages/LiveFeed';
import GuestPage from './pages/GuestPage';
import LoginPage from './pages/LoginPage';

function App() {
    return (
        <Router>
            <div className="min-h-screen">
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    {/* DJ Routes */}
                    <Route path="/dashboard" element={<DJDashboard />} />
                    <Route path="/live/:eventId" element={<LiveFeed />} />

                    {/* Guest Route */}
                    <Route path="/e/:slug" element={<GuestPage />} />

                    {/* Fallback */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
