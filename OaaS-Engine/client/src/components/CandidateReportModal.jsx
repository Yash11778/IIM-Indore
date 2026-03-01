import React, { useEffect, useState } from 'react';
import { X, CheckCircle, TrendingUp, DollarSign, Clock, Brain, Activity, Printer } from 'lucide-react';
import StressGraph from './StressGraph';

const CandidateReportModal = ({ candidate, onClose }) => {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        setAnimate(true);
    }, []);

    // ROI CALCULATIONS (Formatted for Indian Context)
    const baseHiringCost = 500000; // ₹5 Lakhs
    const trainingCost = 200000;   // ₹2 Lakhs
    const readinessFactor = candidate.riskScore ? (100 - candidate.riskScore) / 100 : 0.5;
    const projectedSavings = Math.round(trainingCost * readinessFactor);
    const retentionProb = Math.round((candidate.behaviorScore || 80) * 0.95);

    // Count Stress Events from Logs if not provided directly
    const stressCount = (candidate.logs || []).filter(l => l.metadata?.stressLevelDetected === 'High').length;

    // Tab Switches (Focus Loss events OR In-App Navigation)
    const focusLapses = (candidate.logs || []).filter(l =>
        l.content && (l.content.includes("Focus Loss") || l.content.includes("switched view"))
    ).length;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-inter print:bg-white print:p-0">
            <div
                className={`bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-500 transform ${animate ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} print:h-auto print:shadow-none print:w-full print:max-w-none print:scale-100 print:opacity-100`}
            >
                {/* Header */}
                <div className="bg-gray-900 text-white p-6 flex justify-between items-center shrink-0 print:bg-white print:text-black print:border-b-2 print:border-black">
                    <div className="flex items-center gap-4">
                        {candidate.photo && (
                            <img src={candidate.photo} alt={candidate.name} className="h-16 w-16 rounded-xl object-cover border-2 border-white/20 shadow-lg" />
                        )}
                        <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl font-bold ${candidate.riskScore < 30 ? 'bg-green-500' : 'bg-yellow-500'} print:border print:border-black print:bg-transparent print:text-black`}>
                                {Math.round(100 - (candidate.riskScore || 0))}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{candidate.name}</h2>
                                <p className="text-gray-400 text-sm flex items-center gap-2 print:text-gray-600">
                                    {candidate.role} • <span className="text-indigo-400 print:text-black">ID: {candidate.id || 'N/A'}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition print:hidden">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-gray-50 print:bg-white print:overflow-visible print:h-auto">
                    {/* KEY INSIGHTS GRID */}
                    <div className="grid md:grid-cols-3 gap-6 mb-8 print:grid-cols-3">
                        {/* Financial Impact */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden print:border-black print:shadow-none">
                            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Projected 1st Year Savings</h3>
                            <div className="text-4xl font-bold text-gray-900 mb-1">
                                ₹{(projectedSavings + 300000).toLocaleString('en-IN')}
                            </div>
                            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                                <TrendingUp size={12} /> High Efficiency
                            </p>
                        </div>

                        {/* Focus Integrity */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden print:border-black print:shadow-none">
                            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Focus Integrity</h3>
                            <div className="text-4xl font-bold text-gray-900 mb-1">
                                {candidate.focus}%
                            </div>
                            <p className="text-xs text-red-500 font-medium">
                                Detected {focusLapses} tab switches
                            </p>
                        </div>

                        {/* Retention Probability */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden print:border-black print:shadow-none">
                            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Retention Probability</h3>
                            <div className="text-4xl font-bold text-gray-900 mb-1">
                                {retentionProb}%
                            </div>
                            <p className="text-xs text-gray-400">Based on behavioral stress markers</p>
                        </div>
                    </div>

                    {/* AI SUMMARY */}
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 mb-8 print:bg-white print:border-black">
                        <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2 print:text-black">
                            <Activity size={18} />
                            AI Candidate Assessment
                        </h4>
                        <p className="text-indigo-800 text-sm leading-relaxed print:text-black">
                            Candidate <strong>{candidate.name}</strong> has demonstrated {candidate.riskScore < 30 ? 'exceptional' : 'moderate'} technical proficiency.
                            During the simulation, they encountered {stressCount} high-stress triggers.
                            Their code quality pass rate aligns with a <strong>{candidate.riskScore < 30 ? 'Senior' : 'Mid-Level'}</strong> Engineer.
                            <br /><br />
                            <strong>Final Verdict:</strong> <span className="font-bold underline">{candidate.status}</span>.
                        </p>
                    </div>

                    {/* DETAILED ACTIVITY LOGS */}
                    <div className="mt-8">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Activity size={18} /> Session Forensic Log
                        </h4>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden text-sm print:border-black">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200 print:bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-3">Time</th>
                                        <th className="px-4 py-3">Actor</th>
                                        <th className="px-4 py-3">Event/Message</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 print:divide-gray-300">
                                    {(candidate.logs || []).map((log, i) => (
                                        <tr key={i} className={log.role === 'system' ? 'bg-red-50/50' : ''}>
                                            <td className="px-4 py-2 text-gray-400 font-mono text-xs print:text-black">
                                                {new Date(log.timestamp).toLocaleTimeString()}
                                            </td>
                                            <td className="px-4 py-2 uppercase text-xs font-bold text-gray-500 print:text-black">
                                                {log.role}
                                            </td>
                                            <td className={`px-4 py-2 ${log.role === 'model' ? 'text-indigo-600 font-medium' : 'text-gray-800'} print:text-black`}>
                                                {log.content}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!candidate.logs || candidate.logs.length === 0) && (
                                        <tr>
                                            <td colSpan="3" className="px-4 py-8 text-center text-gray-400">
                                                Waiting for session data...
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 bg-white border-t border-gray-200 flex justify-end gap-4 shrink-0 print:hidden">
                    <button onClick={onClose} className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition">
                        Dismiss
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="px-8 py-3 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition shadow-lg flex items-center gap-2"
                    >
                        <Printer size={18} /> Download Compliance PDF
                    </button>
                </div>

                {/* Print Helper Styles */}
                <style>{`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .fixed, .fixed * {
                            visibility: visible;
                            position: static !important;
                        }
                        .fixed {
                            position: absolute !important;
                            left: 0;
                            top: 0;
                            width: 100%;
                            height: 100%;
                            background: white;
                            padding: 0;
                            margin: 0;
                            z-index: 9999;
                        }
                        /* Hide things marked print:hidden explicitly */
                        .print\\:hidden {
                            display: none !important;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default CandidateReportModal;
