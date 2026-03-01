import React from 'react';
import { motion } from 'framer-motion';
import { Code, Briefcase, BarChart3, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white text-gray-900 font-inter selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden relative">
            {/* Background Grid - Subtle on Light */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

            {/* Navbar */}
            <nav className="border-b border-gray-100 backdrop-blur-md sticky top-0 z-50 bg-white/80">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 font-bold text-xl tracking-tight">
                        <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
                            <ShieldCheck className="text-white" size={24} />
                        </div>
                        <span className="text-gray-900">
                            Proven<span className="text-indigo-600">.io</span>
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            Systems Online
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                        </span>
                        Live Simulation Environment v2.4
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-tight text-gray-900">
                        Hire Beyond <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600">
                            The Resume.
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-16 leading-relaxed font-light">
                        The world's first <span className="text-gray-900 font-medium">Operating System for Talent Assessment</span>.
                        Evaluate engineering candidates in a hyper-realistic outage simulation.
                    </p>
                </motion.div>

                {/* Portal Cards */}
                <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto perspective-1000">
                    {/* Candidate */}
                    <PortalCard
                        icon={<Code size={32} className="text-cyan-600" />}
                        title="Candidate OS"
                        subtitle="The Sandbox"
                        desc="Prove your skills in a live production environment. Fix bugs, deploy code, and save the system."
                        gradient="from-cyan-50 to-white"
                        border="hover:border-cyan-300"
                        shadow="hover:shadow-[0_20px_40px_-15px_rgba(6,182,212,0.2)]"
                        delay={0.1}
                        action="Launch Terminal"
                        buttonColor="text-cyan-600"
                        onClick={() => navigate('/login', { state: { role: 'candidate' } })}
                    />

                    {/* Recruiter */}
                    <PortalCard
                        icon={<Briefcase size={32} className="text-purple-600" />}
                        title="Recruiter Intel"
                        subtitle="The Command Center"
                        desc="Watch candidates solve problems in real-time. Get hiring risk scores and behavioral analytics."
                        gradient="from-purple-50 to-white"
                        border="hover:border-purple-300"
                        shadow="hover:shadow-[0_20px_40px_-15px_rgba(147,51,234,0.2)]"
                        delay={0.2}
                        action="Access Dashboard"
                        buttonColor="text-purple-600"
                        onClick={() => navigate('/login', { state: { role: 'recruiter' } })}
                    />

                    {/* Admin */}
                    <PortalCard
                        icon={<BarChart3 size={32} className="text-emerald-600" />}
                        title="Admin Console"
                        subtitle="Institution View"
                        desc="Track cohort performance, placement metrics, and curriculum gaps across all candidates."
                        gradient="from-emerald-50 to-white"
                        border="hover:border-emerald-300"
                        shadow="hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.2)]"
                        delay={0.3}
                        action="View Reports"
                        buttonColor="text-emerald-600"
                        onClick={() => navigate('/login', { state: { role: 'admin' } })}
                    />
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-gray-200 bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-gray-500">
                    <p className="text-sm">© 2026 Proven.io. Built for High-Performance Hiring.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <span className="text-sm font-mono">Status: ALL SYSTEMS GO</span>
                        <span className="text-sm font-mono">Latency: 12ms</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const PortalCard = ({ icon, title, subtitle, desc, gradient, border, shadow, delay, action, buttonColor, onClick }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay, duration: 0.5 }}
        onClick={onClick}
        className={`group relative p-1 rounded-2xl bg-white cursor-pointer overflow-hidden transition-all duration-500 hover:-translate-y-2`}
    >
        {/* Card Background & Border */}
        <div className={`relative h-full bg-white rounded-xl p-8 border border-gray-100 ${border} shadow-sm ${shadow} transition-all duration-300 flex flex-col items-start text-left`}>

            <div className={`mb-6 p-4 rounded-2xl bg-gray-50 border border-gray-100 group-hover:bg-white group-hover:shadow-md transition-all`}>
                {icon}
            </div>

            <span className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">{subtitle}</span>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
            <p className="text-gray-600 leading-relaxed mb-8 text-sm">{desc}</p>

            <div className={`mt-auto w-full pt-6 border-t border-gray-50 flex items-center justify-between text-gray-400 group-hover:${buttonColor} transition-colors`}>
                <span className="font-semibold text-sm">{action}</span>
                <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
    </motion.div>
);

export default LandingPage;
