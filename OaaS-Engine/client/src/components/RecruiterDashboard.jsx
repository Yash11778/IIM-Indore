import React, { useState, useEffect } from 'react';
import {
    Users,
    AlertTriangle,
    CheckCircle,
    PlayCircle,
    Search,
    Filter,
    Trash2 // NEW ICON
} from 'lucide-react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip
} from 'recharts';

import CandidateReportModal from './CandidateReportModal';

const RecruiterDashboard = () => {
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    const fetchCandidates = async () => {
        try {
            const res = await fetch('http://localhost:5002/api/simulation/candidates');
            const data = await res.json();
            if (Array.isArray(data)) {
                // Sort by Risk Score (Low Risk First)
                setCandidates(data.sort((a, b) => a.riskScore - b.riskScore));
            }
        } catch (err) {
            console.error("Failed to fetch candidates", err);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation(); // Prevent row click
        if (window.confirm("Are you sure you want to remove this candidate? This action cannot be undone.")) {
            try {
                await fetch(`http://localhost:5002/api/simulation/session/${id}`, { method: 'DELETE' });
                setCandidates(prev => prev.filter(c => c.id !== id)); // Optimistic UI Update
            } catch (err) {
                console.error("Failed to delete", err);
                alert("Failed to delete candidate");
            }
        }
    };

    useEffect(() => {
        fetchCandidates();
        const interval = setInterval(fetchCandidates, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);





    const spiderData = [
        { subject: 'Technical', A: 90, B: 65, fullMark: 100 },
        { subject: 'Debugging', A: 95, B: 50, fullMark: 100 },
        { subject: 'Communication', A: 85, B: 40, fullMark: 100 },
        { subject: 'Resilience', A: 80, B: 30, fullMark: 100 },
        { subject: 'Focus', A: 98, B: 60, fullMark: 100 },
        { subject: 'Git Flow', A: 90, B: 70, fullMark: 100 },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-inter text-slate-900">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        TI
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Talent Intelligence Suite</h1>
                        <p className="text-xs text-gray-500">Corporate Portal • Google Inc.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-lg text-sm font-semibold">
                        Day-1 Ready: <span className="text-2xl">{candidates.filter(c => c.status === 'HIRE').length}</span> Candidates
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Recruiter" alt="Profile" />
                    </div>
                </div>
            </header>

            {/* Show Modal if Candidate Selected */}
            {selectedCandidate && (
                <CandidateReportModal
                    candidate={selectedCandidate}
                    onClose={() => setSelectedCandidate(null)}
                />
            )}

            <main className="max-w-7xl mx-auto p-8 grid grid-cols-1 md:grid-cols-12 gap-8">

                {/* LEFT COL: LEADERBOARD */}
                <div className="col-span-8 space-y-6">
                    {/* Filters */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input type="text" placeholder="Search candidates..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                        <button
                            onClick={fetchCandidates}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"
                        >
                            <Filter size={18} /> Refresh Data
                        </button>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg">Top Candidates (Live Batch)</h3>
                            <span className="text-xs font-mono text-gray-400 uppercase">Real-Time Sync</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold">
                                    <tr>
                                        <th className="px-6 py-4">Candidate</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4">Hiring Risk</th>
                                        <th className="px-6 py-4">Focus Score</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {candidates.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-gray-400 italic">
                                                Waiting for data stream... (Start validation in Candidate Portal)
                                            </td>
                                        </tr>
                                    )}
                                    {candidates.map((c) => (
                                        <tr key={c.id} className="hover:bg-gray-50 transition group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {c.photo ? (
                                                        <img src={c.photo} alt={c.name} className="h-10 w-10 rounded-full object-cover border border-gray-200" />
                                                    ) : (
                                                        <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                                                            {c.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-bold text-gray-900">{c.name}</div>
                                                        <div className="text-xs text-gray-500">{c.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">{c.role}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div className={`h-full ${c.riskScore < 30 ? 'bg-green-500' : c.riskScore < 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.min(c.riskScore, 100)}%` }}></div>
                                                    </div>
                                                    <span className="text-xs font-bold">{c.riskScore}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {c.focus}%
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${c.status === 'HIRE' ? 'bg-green-100 text-green-700' :
                                                    c.status === 'REJECT' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 flex gap-4">
                                                <button
                                                    onClick={() => setSelectedCandidate(c)}
                                                    className="text-purple-600 hover:text-purple-800 font-medium text-sm hover:underline"
                                                >
                                                    View Report
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(c.id, e)}
                                                    className="text-red-400 hover:text-red-600 transition"
                                                    title="Remove Candidate"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* RIGHT COL: ANALYTICS */}
                <div className="col-span-4 space-y-6">
                    {/* Selected Candidate Deep Dive */}
                    {selectedCandidate ? (
                        <>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <div className="flex items-center gap-4 mb-6">
                                    {selectedCandidate.photo ? (
                                        <img src={selectedCandidate.photo} alt={selectedCandidate.name} className="h-16 w-16 rounded-full object-cover border-2 border-indigo-100" />
                                    ) : (
                                        <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl">
                                            {selectedCandidate.name.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">{selectedCandidate.name}</h3>
                                        <p className={`text-xs font-bold ${selectedCandidate.status === 'HIRE' ? 'text-green-600' : 'text-yellow-600'}`}>
                                            {selectedCandidate.techScore}% MATCH • {selectedCandidate.status === 'HIRE' ? 'SUPERIOR' : 'REVIEW'}
                                        </p>
                                    </div>
                                </div>


                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={spiderData}>
                                            <PolarGrid stroke="#e5e7eb" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 10 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#e5e7eb" />
                                            <Radar name={selectedCandidate.name.split(' ')[0]} dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                            <Radar name="Avg" dataKey="B" stroke="#cbd5e1" fill="#cbd5e1" fillOpacity={0.3} />
                                            <Tooltip />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Forensic Playback */}
                            <div className="bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-800 text-white">
                                <h3 className="font-bold mb-2 flex items-center gap-2">
                                    <PlayCircle size={18} className="text-green-400" /> Forensic Playback
                                </h3>
                                <p className="text-xs text-slate-400 mb-4">Watch {selectedCandidate.name.split(' ')[0]}'s decision logic during the "Database Outage" simulation (4x Speed).</p>

                                <div className="aspect-video bg-black rounded-lg relative flex items-center justify-center group cursor-pointer border border-slate-700" onClick={() => setSelectedCandidate(selectedCandidate)}>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-end">
                                        <div className="w-full">
                                            <div className="h-1 bg-gray-700 rounded-full overflow-hidden mb-2">
                                                <div className="h-full bg-green-500 w-[45%]"></div>
                                            </div>
                                            <div className="flex justify-between text-[10px] text-gray-400">
                                                <span>04:12</span>
                                                <span>Bug Identified</span>
                                            </div>
                                        </div>
                                    </div>
                                    <PlayCircle size={48} className="text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition">
                                    Open Full Session Reporting
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center text-gray-500">
                            <Filter size={48} className="mx-auto text-gray-300 mb-4" />
                            <p>Select a candidate to view detailed analytics and forensic playback.</p>
                        </div>
                    )}
                </div>

            </main >
        </div >
    );
};

export default RecruiterDashboard;
