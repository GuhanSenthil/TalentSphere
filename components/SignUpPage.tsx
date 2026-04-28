

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BriefcaseIcon } from './IconComponents';
import Spinner from './Spinner';

const SignUpPage: React.FC = () => {
    const { signup } = useAuth();
    const navigate = useNavigate();
    
    // FIX: Changed state type from 'recruiter' to 'hr' to match UserCredentials type.
    const [activeTab, setActiveTab] = useState<'candidate' | 'hr'>('candidate');
    
    // Common fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Recruiter-specific fields
    const [companyName, setCompanyName] = useState('');
    const [companyNeeds, setCompanyNeeds] = useState('');
    
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            await signup({
                name,
                email,
                pass: password,
                // FIX: Pass 'hr' instead of 'recruiter' to match the expected role type.
                role: activeTab,
                companyName: activeTab === 'hr' ? companyName : undefined,
                companyNeeds: activeTab === 'hr' ? companyNeeds : undefined,
            });
            
            // Redirect based on role
            if (activeTab === 'hr') {
                navigate('/dashboard');
            } else {
                navigate('/profile/edit'); // Redirect to edit profile to fill it out
            }
        } catch (err: any) {
            setError(err.message || 'Sign up failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // FIX: Updated TabButton props to use 'hr' type.
    const TabButton: React.FC<{tab: 'candidate' | 'hr'; label: string}> = ({tab, label}) => {
        const isActive = activeTab === tab;
        return (
            <button
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`w-full py-2.5 text-sm font-semibold rounded-md focus:outline-none transition-colors ${
                    isActive ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:bg-slate-100'
                }`}
            >
                {label}
            </button>
        )
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-slate-200">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center justify-center space-x-2">
                        <BriefcaseIcon className="h-10 w-10 text-indigo-600" />
                        <h1 className="text-3xl font-bold text-slate-800">TalentSphere</h1>
                    </Link>
                    <p className="text-slate-500 mt-2">Create your account</p>
                </div>

                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg mb-6">
                    <TabButton tab="candidate" label="I'm a Candidate" />
                    {/* FIX: Use 'hr' for the tab value while keeping the label as 'Recruiter'. */}
                    <TabButton tab="hr" label="I'm a Recruiter" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Common Fields */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="email-signup" className="block text-sm font-medium text-slate-700">Email address</label>
                        <input type="email" id="email-signup" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    </div>
                    
                    {/* Recruiter Fields */}
                    {/* FIX: Check for 'hr' role to display recruiter-specific fields. */}
                    {activeTab === 'hr' && (
                        <>
                            <div>
                                <label htmlFor="companyName" className="block text-sm font-medium text-slate-700">Company Name</label>
                                <input type="text" id="companyName" value={companyName} onChange={e => setCompanyName(e.target.value)} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                            </div>
                             <div>
                                <label htmlFor="companyNeeds" className="block text-sm font-medium text-slate-700">Company Needs / Description <span className="text-slate-400">(Optional)</span></label>
                                <textarea id="companyNeeds" value={companyNeeds} onChange={e => setCompanyNeeds(e.target.value)} rows={3} placeholder="e.g., We're a fast-growing startup in the AI space..." className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                            </div>
                        </>
                    )}

                    {/* Common Fields Continued */}
                    <div>
                        <label htmlFor="password-signup" className="block text-sm font-medium text-slate-700">Password</label>
                        <input type="password" id="password-signup" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700">Confirm Password</label>
                        <input type="password" id="confirm-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    </div>
                    
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    
                    <div>
                        <button type="submit" disabled={isLoading} className="w-full mt-2 flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
                            {isLoading ? <Spinner /> : 'Create Account'}
                        </button>
                    </div>
                </form>
                
                <p className="mt-6 text-center text-sm text-slate-500">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignUpPage;