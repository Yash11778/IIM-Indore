import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import LandingPage from './components/LandingPage'
import LoginPage from './components/LoginPage'
import CorporateDashboard from './components/CorporateDashboard'

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/corporate" element={<CorporateDashboard />} />
                </Routes>
            </div>
        </Router>
    )
}

export default App
