import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine if role was explicitly passed (Fixed Mode)
    const initialRole = location.state?.role;
    const [role, setRole] = useState(initialRole || 'candidate');
    const [isRoleFixed] = useState(!!initialRole);

    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isSignUp) {
                // --- SIGN UP FLOW ---
                if (role === 'candidate') {
                    // Clean up name/email
                    const userData = { name: name || 'New Candidate', email: email, role };

                    await fetch('http://localhost:5002/api/simulation/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(userData)
                    });

                    localStorage.setItem('candidateName', userData.name);
                    localStorage.setItem('candidateEmail', userData.email);
                    navigate('/candidate/dashboard');
                } else {
                    // Recruiter Registration (Mock for demo)
                    localStorage.setItem('recruiterName', name || 'Hiring Manager');
                    localStorage.setItem('companyName', company || 'Tech Corp');
                    navigate('/recruiter');
                }
            } else {
                // --- SIGN IN FLOW ---
                if (role === 'candidate') {
                    // Verify user exists in LocalDB
                    const res = await fetch('http://localhost:5002/api/simulation/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email })
                    });

                    const data = await res.json();

                    if (res.ok) {
                        localStorage.setItem('candidateName', data.user.name);
                        localStorage.setItem('candidateEmail', data.user.email);
                        navigate('/candidate/dashboard');
                    } else {
                        alert(data.error || "Login Failed");
                    }
                } else if (role === 'admin') {
                    navigate('/admin');
                } else {
                    // Recruiter Logic (Open access for demo corporate partners)
                    navigate('/recruiter');
                }
            }
        } catch (err) {
            console.error("Login Error:", err);
            alert("Connection Error. Ensure Server is Running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center font-inter p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-900 animate-spin-slow opacity-50"></div>
                <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden relative z-10 transition-all hover:border-indigo-500/30">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg ${role === 'candidate' ? 'bg-indigo-600' : 'bg-purple-600'} transition-all duration-300`}>
                            <ShieldCheck className="text-white" size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">
                            {isSignUp ? 'Create Account' : (isRoleFixed ? `${role.charAt(0).toUpperCase() + role.slice(1)} Portal` : 'Welcome Back')}
                        </h2>
                        <p className="text-slate-400 mt-2 text-sm">
                            {isSignUp ? `Access strict simulation credentials` : 'Secure authentication gateway'}
                        </p>
                    </div>

                    {/* Role Toggle */}
                    {!isRoleFixed && (
                        <div className="flex bg-slate-900/50 p-1 rounded-lg mb-6 border border-slate-700/50">
                            <button
                                type="button"
                                onClick={() => setRole('candidate')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'candidate' ? 'bg-slate-700 text-white shadow-sm ring-1 ring-slate-600' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                Candidate
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('recruiter')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'recruiter' ? 'bg-purple-900/50 text-purple-200 shadow-sm ring-1 ring-purple-800' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                Recruiter
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="space-y-5">
                        {(isSignUp || role === 'candidate') && (
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-900/50 rounded-lg border border-slate-700 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required={role === 'candidate'}
                                    />
                                </div>
                            </div>
                        )}

                        {isSignUp && role === 'recruiter' && (
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Company</label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-purple-400 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-900/50 rounded-lg border border-slate-700 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                                        placeholder="Acme Corp"
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Email Access ID</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                <input
                                    type="email"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 rounded-lg border border-slate-700 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">{isSignUp ? 'Set Passkey' : 'Passkey'}</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                <input
                                    type="password"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 rounded-lg border border-slate-700 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono"
                                    placeholder="••••••••"
                                    defaultValue={isSignUp ? "" : "password"}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3.5 rounded-lg font-bold hover:from-indigo-500 hover:to-indigo-600 active:scale-[0.98] transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>{isSignUp ? 'Initialize Account' : 'Authenticate'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
                        <div className="flex justify-center items-center gap-2 text-xs text-slate-500 mb-4">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            System Operational
                        </div>
                        <p className="text-sm text-slate-400">
                            {isSignUp ? 'Already authenticated?' : "Need access credentials?"} <button onClick={() => setIsSignUp(!isSignUp)} className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors ml-1">{isSignUp ? 'Sign In' : 'Request Access'}</button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
