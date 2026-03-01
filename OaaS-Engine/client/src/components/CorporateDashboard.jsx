import React from 'react';
import { Users, TrendingUp, AlertTriangle, CheckCircle, Search, Filter, Download } from 'lucide-react';
import CandidateReportModal from './CandidateReportModal';

const CorporateDashboard = () => {
    const [candidates, setCandidates] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedCandidate, setSelectedCandidate] = React.useState(null);

    React.useEffect(() => {
        fetch('http://localhost:5002/api/simulation/results')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setCandidates(data);
                } else {
                    console.error("API returned non-array:", data);
                    setCandidates([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load results", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 font-inter text-gray-800">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xl text-gray-900">
                    <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <span className="text-white">O</span>
                    </div>
                    Recruiter Portal
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">Acme Corp Inc.</span>
                    <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto p-8">

                {/* Header Stats */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Talent Pipeline Overview</h1>
                    <p className="text-gray-500">Real-time audit results from Proven.io.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard label="Total Audited" value={candidates.length} icon={<Users size={20} className="text-blue-600" />} />
                    <StatCard label="Hiring Ready" value={candidates.filter(c => c.status === 'Hired').length} icon={<CheckCircle size={20} className="text-green-600" />} />
                    <StatCard label="Avg. Score" value={Math.round(candidates.reduce((acc, c) => acc + c.score, 0) / (candidates.length || 1)) + "%"} icon={<ShieldIcon size={20} className="text-indigo-600" />} />
                    <StatCard label="Active Sessions" value={candidates.filter(c => c.status === 'In Progress').length} icon={<TrendingUp size={20} className="text-purple-600" />} />
                </div>

                {/* Main Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-lg">Recent Candidates</h3>
                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                                <Filter size={16} /> Filter
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 shadow-sm">
                                <Download size={16} /> Export Report
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-gray-500">Loading pipeline data...</div>
                    ) : candidates.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="inline-flex h-12 w-12 bg-gray-100 rounded-full items-center justify-center mb-4 text-gray-400">
                                <Users size={24} />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No Audits Found</h3>
                            <p className="text-gray-500">Run a simulation on the Candidate Dashboard to see results here.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Candidate ID</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Readiness Score</th>
                                    <th className="px-6 py-4">Behavioral Risk</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {candidates.map(c => (
                                    <tr key={c.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-medium text-gray-900">{c.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{c.role}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`font - bold ${getScoreColor(c.score)} `}>{c.score}%</span>
                                                <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className={`h - full ${getScoreBg(c.score)} `} style={{ width: `${c.score}% ` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline - flex items - center gap - 1.5 px - 2.5 py - 1 rounded - full text - xs font - semibold ${getRiskStyle(c.risk)} `}>
                                                {c.risk === 'High' && <AlertTriangle size={12} />}
                                                {c.risk}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">{c.time}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px - 3 py - 1 rounded text - xs font - medium ${getStatusStyle(c.status)} `}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setSelectedCandidate(c)}
                                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                            >
                                                View Report
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* ANALYTICS MODAL */}
                {selectedCandidate && (
                    <CandidateReportModal
                        candidate={selectedCandidate}
                        onClose={() => setSelectedCandidate(null)}
                    />
                )}

            </div>
        </div>
    );
};

// Utilities & Components
const StatCard = ({ label, value, icon }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
        <div>
            <p className="text-gray-500 text-sm mb-1">{label}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
    </div>
);

const ShieldIcon = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const getScoreColor = (score) => score >= 90 ? 'text-green-600' : score >= 70 ? 'text-yellow-600' : 'text-red-600';
const getScoreBg = (score) => score >= 90 ? 'bg-green-500' : score >= 70 ? 'bg-yellow-500' : 'bg-red-500';

const getRiskStyle = (risk) => {
    switch (risk) {
        case 'Low': return 'bg-green-50 text-green-700 border border-green-100';
        case 'Medium': return 'bg-yellow-50 text-yellow-700 border border-yellow-100';
        case 'High': return 'bg-red-50 text-red-700 border border-red-100';
        default: return 'bg-gray-100';
    }
};

const getStatusStyle = (status) => {
    switch (status) {
        case 'Hired': return 'bg-indigo-50 text-indigo-700';
        case 'Rejected': return 'bg-gray-100 text-gray-500';
        case 'Interviewing': return 'bg-blue-50 text-blue-700';
        default: return 'bg-gray-50 text-gray-600';
    }
}

export default CorporateDashboard;
