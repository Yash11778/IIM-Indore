import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, BarChart2, Shield, Play } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="font-inter bg-white text-gray-900 overflow-x-hidden">
            {/* Navbar */}
            <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">O</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight text-gray-900">OaaS Engine</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                        <a href="#features" className="hover:text-indigo-600 transition">Solutions</a>
                        <a href="#methodology" className="hover:text-indigo-600 transition">Methodology</a>
                        <a href="#pricing" className="hover:text-indigo-600 transition">Enterprise</a>
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition"
                    >
                        Partner Login
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-6 border border-indigo-100 uppercase tracking-wide">
                            <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
                            The Future of Assessment
                        </div>
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
                            Stop Hiring on <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Memory.</span> <br />
                            Start Hiring on <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">Instinct.</span>
                        </h1>
                        <p className="text-lg text-gray-500 mb-8 leading-relaxed max-w-xl">
                            The first Behavioral & Technical Readiness Audit (B-TRA) engine. We simulate "Day 1" crises to measure the only metric that matters:
                            <strong className="text-gray-900"> Outcome Delivery.</strong>
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                            >
                                Start Audit <ArrowRight size={18} />
                            </button>
                            <button className="flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition">
                                <Play size={18} className="fill-current text-gray-400" /> Watch Demo
                            </button>
                        </div>

                        <div className="mt-12 flex items-center gap-6 text-sm text-gray-400 font-medium">
                            <span>Trusted by innovative hiring teams at:</span>
                            <div className="flex gap-4 grayscale opacity-60">
                                {/* Placeholders for logos */}
                                <span className="font-bold text-gray-600">ACME Corp</span>
                                <span className="font-bold text-gray-600">Globex</span>
                                <span className="font-bold text-gray-600">Soylent</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        {/* Abstract visual */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50"></div>

                        {/* Card Visual */}
                        <div className="relative bg-white/60 backdrop-blur-xl border border-gray-100 rounded-3xl p-8 shadow-2xl">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xl">
                                    92
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Ready to Deploy</h3>
                                    <p className="text-xs text-gray-500">Candidate Readiness Score</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Metric label="Technical Logic" score={88} color="bg-blue-500" />
                                <Metric label="Crisis Communication" score={94} color="bg-indigo-500" />
                                <Metric label="Ethical Alignment" score={100} color="bg-green-500" />
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <p className="text-xs text-center text-gray-400 uppercase tracking-widest">Live Audit In Progress</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Section */}
            <section className="py-24 bg-gray-50" id="methodology">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">The "Outcome-as-a-Service" Engine</h2>
                        <p className="text-gray-600">
                            Traditional exams measure what you memorize. We measure what you do.
                            Our Agentic AI creates dynamic, high-pressure work simulations.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Play className="text-indigo-600" />}
                            title="Day-in-the-Life Sim"
                            desc="Drop candidates into a simulated Slack/Teams environment where they must solve real business problems, not LeetCode puzzles."
                        />
                        <FeatureCard
                            icon={<BarChart2 className="text-purple-600" />}
                            title="Behavioral Metadata"
                            desc="We track anxiety levels, response latency, and tone shifts to build a psychological profile of the candidate under pressure."
                        />
                        <FeatureCard
                            icon={<Shield className="text-blue-600" />}
                            title="Risk-Free Hiring"
                            desc="Eliminate the 'completion-outcome dissonance'. Don't just verify they took the course, verify they can do the job."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <h4 className="text-xl font-bold mb-4">OaaS Engine</h4>
                        <p className="text-gray-400 max-w-sm">
                            Helping EdTech platforms bridge the
                            gap between certification and employability.
                        </p>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
                    &copy; 2026 Outcome-as-a-Service Engine. IIM Indore Hackathon Project.
                </div>
            </footer>
        </div>
    );
};

// Components
const Metric = ({ label, score, color }) => (
    <div>
        <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-gray-600">{label}</span>
            <span className="font-bold text-gray-900">{score}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full`} style={{ width: `${score}%` }}></div>
        </div>
    </div>
);

const FeatureCard = ({ icon, title, desc }) => (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
        <div className="h-12 w-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-500 leading-relaxed">
            {desc}
        </p>
    </div>
);

export default LandingPage;
