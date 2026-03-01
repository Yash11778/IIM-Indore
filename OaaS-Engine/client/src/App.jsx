import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard'
import RecruiterDashboard from './components/RecruiterDashboard'
import AdminDashboard from './components/AdminDashboard'
import LoginPage from './components/LoginPage'

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<LandingPage />} />

                    {/* Candidate Portal */}
                    <Route path="/candidate/dashboard" element={<Dashboard />} />
                    <Route path="/candidate" element={<Dashboard />} /> {/* Fallback */}
                    <Route path="/candidate/login" element={<LoginPage />} />

                    {/* Corporate Portal */}
                    <Route path="/recruiter" element={<RecruiterDashboard />} />

                    {/* Admin Portal */}
                    <Route path="/admin" element={<AdminDashboard />} />

                    {/* Legacy / Direct Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
            </div>
        </Router>
    )
}

export default App
