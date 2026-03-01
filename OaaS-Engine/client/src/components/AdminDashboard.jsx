import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    Users,
    BookOpen,
    Building,
    ArrowUpRight,
    MapPin
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';

const AdminDashboard = () => {

    const [metrics, setMetrics] = useState({
        activeStudents: 0,
        placementRate: 0,
        avgRisk: 0,
        hiredCount: 0
    });
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAdminData = async () => {
        try {
            const res = await fetch('http://localhost:5002/api/simulation/candidates');
            const data = await res.json();

            if (Array.isArray(data)) {
                setCandidates(data);

                // CALCULATE METRICS
                const total = data.length;
                const hired = data.filter(c => c.status === 'HIRE').length;
                const totalRisk = data.reduce((acc, c) => acc + (c.riskScore || 0), 0);

                setMetrics({
                    activeStudents: total,
                    placementRate: total > 0 ? Math.round((hired / total) * 100) : 0,
                    avgRisk: total > 0 ? Math.round(totalRisk / total) : 0,
                    hiredCount: hired
                });
            }
            setLoading(false);
        } catch (err) {
            console.error("Admin Fetch Error:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
        const interval = setInterval(fetchAdminData, 5000); // Live poll
        return () => clearInterval(interval);
    }, []);

    // DYNAMIC CHART DATA: Risk Distribution
    const cohortData = [
        { name: 'Day-1 Ready', count: candidates.filter(c => c.riskScore < 30).length, fill: '#10b981' }, // Green
        { name: 'Upskill Needed', count: candidates.filter(c => c.riskScore >= 30 && c.riskScore < 70).length, fill: '#f59e0b' }, // Yellow
        { name: 'High Risk', count: candidates.filter(c => c.riskScore >= 70).length, fill: '#ef4444' }, // Red
    ];

    // TOP PERFORMERS
    const topPlacements = candidates
        .filter(c => c.status === 'HIRE')
        .sort((a, b) => a.riskScore - b.riskScore) // Best scores first
        .slice(0, 5);

    return (
        <div className="min-h-screen bg-gray-50 font-inter text-slate-800">
            {/* Header */}
            <header className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex justify-between items-center text-white sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold">
                        ROI
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">ROI Command Center</h1>
                        <p className="text-xs text-slate-400">University Admin Portal • IIM Indore</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button className="px-4 py-2 bg-slate-800 rounded-lg text-sm border border-slate-700 hover:bg-slate-700">Export Report</button>
                    <button className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-500">Manage Cohorts</button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-8">

                {/* STATUS CARDS */}
                <div className="grid grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={<Users size={20} className="text-blue-600" />}
                        label="Active Students"
                        value={metrics.activeStudents}
                        delta="Live"
                        color="bg-blue-50"
                    />
                    <StatCard
                        icon={<Building size={20} className="text-purple-600" />}
                        label="Hired Candidates"
                        value={metrics.hiredCount}
                        delta="Verified"
                        color="bg-purple-50"
                    />
                    <StatCard
                        icon={<TrendingUp size={20} className="text-green-600" />}
                        label="Placement Rate"
                        value={`${metrics.placementRate}%`}
                        delta={metrics.placementRate > 50 ? "High" : "Build Pipeline"}
                        color="bg-green-50"
                    />
                    <StatCard
                        icon={<BookOpen size={20} className="text-orange-600" />}
                        label="Avg Batch Risk"
                        value={`${metrics.avgRisk}/100`}
                        delta={metrics.avgRisk < 40 ? "Excellent" : "Needs Trng"}
                        color="bg-orange-50"
                        desc="Lower is Better"
                    />
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* CHART: COHORT DISTRIBUTION (Replaces Placement Velocity with something more relevant to current data) */}
                    <div className="col-span-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-gray-800">Real-Time Cohort Risk Analysis</h3>
                        </div>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={cohortData} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#374151', fontSize: 13, fontWeight: 600 }} width={100} />
                                    <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px' }} />
                                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={40}>
                                        {
                                            cohortData.map((entry, index) => (
                                                <cell key={`cell-${index}`} fill={entry.fill} />
                                            ))
                                        }
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* CURRICULUM OPTIMIZER (Static for now as it needs deep logs, but contextually useful) */}
                    <div className="col-span-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                            <TrendingUp className="text-orange-500" /> Curriculum Insights
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Based on {metrics.activeStudents} candidate simulations, we recommend:
                        </p>

                        <div className="space-y-4">
                            <Recommendation
                                topic="Database Locking"
                                reason="45% failed simulation due to deadlock handling."
                                urgency="High"
                            />
                            <Recommendation
                                topic="Async/Await in JS"
                                reason="Latency spikes observed in 30% of candidates."
                                urgency="Medium"
                            />
                        </div>
                    </div>
                </div>

                {/* BOTTOM: LIVE FEED */}
                <div className="mt-8 grid grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-lg text-gray-800 mb-6">Live Leaderboard (Top 5)</h3>
                        <div className="space-y-4">
                            {topPlacements.length > 0 ? (
                                topPlacements.map(c => (
                                    <PlacementItem
                                        key={c.id}
                                        name={c.name}
                                        role={c.role}
                                        company="Placement Pending" // Placeholder until "Placed" logic
                                        pkg={`${c.techScore}% Tech`}
                                        photo={c.photo}
                                    />
                                ))
                            ) : (
                                <p className="text-gray-400 italic">No candidates passed threshold yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Placements (Mock/Historical Mixed) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 opacity-70">
                        <h3 className="font-bold text-lg text-gray-800 mb-4">Past Placements (Historical)</h3>
                        <div className="space-y-4">
                            <PlacementItem name="Rahul V." role="SDE-1" company="Microsoft" pkg="₹24 LPA" />
                            <PlacementItem name="Sneha K." role="Frontend Eng" company="Zomato" pkg="₹18 LPA" />
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

const StatCard = ({ icon, label, value, delta, color, desc }) => (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm transition hover:shadow-md">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-lg ${color} bg-opacity-50`}>{icon}</div>
            <span className={`text-xs font-bold px-2 py-1 rounded bg-gray-100 ${delta.includes('+') ? 'text-green-600' : 'text-red-500'}`}>{delta}</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        <p className="text-sm text-gray-500">{label}</p>
        {desc && <p className="text-xs text-indigo-500 mt-1">{desc}</p>}
    </div>
);

const Recommendation = ({ topic, reason, urgency }) => (
    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
        <div className="flex justify-between items-center mb-1">
            <h4 className="font-bold text-sm text-gray-800">{topic}</h4>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${urgency === 'High' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>{urgency} Priority</span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">{reason}</p>
    </div>
);

const PlacementItem = ({ name, role, company, pkg, photo }) => (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition border border-transparent hover:border-gray-100 cursor-default">
        <div className="flex items-center gap-3">
            {photo ? (
                <img src={photo} alt={name} className="h-8 w-8 rounded-full object-cover border border-indigo-100" />
            ) : (
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                    {name.charAt(0)}
                </div>
            )}
            <div>
                <p className="font-bold text-sm text-gray-800">{name}</p>
                <p className="text-xs text-gray-500">{role} @ {company}</p>
            </div>
        </div>
        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">{pkg}</span>
    </div>
);

export default AdminDashboard;
