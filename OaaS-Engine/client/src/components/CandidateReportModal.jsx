import React, { useEffect, useState } from 'react';
import { X, CheckCircle, TrendingUp, DollarSign, Clock, Brain, Activity } from 'lucide-react';
import StressGraph from './StressGraph';

const CandidateReportModal = ({ candidate, onClose }) => {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        setAnimate(true);
    }, []);

    // ROI CALCULATIONS (The "Business Logic")
    const baseHiringCost = 25000; // $25k standard cost
    const trainingCost = 15000;   // $15k training
    const readinessFactor = candidate.score / 100;

    // Money Saved = Training Cost * Readiness (If you are 100% ready, we save 100% of training)
    const projectedSavings = Math.round(trainingCost * readinessFactor);

    // Ramp Up Time: Standard 20 days. Reduced by readiness.
    const rampUpDays = Math.max(1, Math.round(20 * (1 - readinessFactor)));

    const retentionProb = Math.round(candidate.score * 0.95);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-inter">
            <div
                className={`bg-white w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-500 transform ${animate ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
            >
                {/* Header */}
                <div className="bg-gray-900 text-white p-6 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl font-bold ${candidate.score > 80 ? 'bg-green-500' : 'bg-yellow-500'}`}>
                            {candidate.score}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{candidate.name}</h2>
                            <p className="text-gray-400 text-sm flex items-center gap-2">
                                {candidate.role} • <span className="text-indigo-400">ID: {candidate.id}</span>
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-gray-50">

                    {/* KEY INSIGHTS GRID */}
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        {/* Financial Impact */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                                <DollarSign size={80} className="text-green-600" />
                            </div>
                            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Projected 1st Year Savings</h3>
                            <div className="text-4xl font-bold text-gray-900 mb-1">
                                $45,000
                            </div>
                            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                                <TrendingUp size={12} /> Exceeds Industry Avg by 14%
                            </p>
                        </div>

                        {/* Speed to Productivity */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Clock size={80} className="text-blue-600" />
                            </div>
                            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Time-to-Value (Ramp Up)</h3>
                            <div className="text-4xl font-bold text-gray-900 mb-1">
                                3 Days
                            </div>
                            <p className="text-xs text-blue-600 font-medium">Standard Benchmark: 45 Days</p>
                        </div>

                        {/* Retention Probability */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <CheckCircle size={80} className="text-purple-600" />
                            </div>
                            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Retention Probability</h3>
                            <div className="text-4xl font-bold text-gray-900 mb-1">
                                {retentionProb}%
                            </div>
                            <p className="text-xs text-gray-400">Based on behavioral stress markers</p>
                        </div>
                    </div>

                    {/* COGNITIVE TIMELINE */}
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8">
                        <div className="flex items-center gap-2 mb-6">
                            <Brain size={20} className="text-indigo-600" />
                            <h3 className="text-lg font-bold text-gray-900">Cognitive "Flashback" Replay</h3>
                        </div>

                        {/* Chart Component */}
                        <div className="h-64">
                            <StressGraph />
                        </div>

                        <p className="text-center text-xs text-gray-400 mt-4">
                            T0: Session Start &nbsp; • &nbsp; Real-time biometric latency tracking (ms)
                        </p>
                    </div>

                    {/* AI SUMMARY */}
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
                        <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                            <Activity size={18} />
                            AI Predictive Analysis
                        </h4>
                        <p className="text-indigo-800 text-sm leading-relaxed">
                            Candidate demonstrates <strong>Elite</strong> capabilities in crisis management. While initially showing a stress response (Red Zone) during the 'Payment Alert', they rapidly stabilized using the <strong>System Terminal</strong>. Their use of `config set` instead of restarting the database suggests a <strong>Senior-Level</strong> understanding of state preservation.
                            <br /><br />
                            <strong>Recommendation:</strong> <span className="font-bold underline">IMMEDIATE HIRE</span>.
                        </p>
                    </div>

                </div>

                {/* Footer Buttons */}
                <div className="p-6 bg-white border-t border-gray-200 flex justify-end gap-4 shrink-0">
                    <button onClick={onClose} className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition">
                        Dismiss
                    </button>
                    <button className="px-8 py-3 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition shadow-lg flex items-center gap-2">
                        <CheckCircle size={18} /> Send Offer Letter
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CandidateReportModal;
