import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BriefcaseIcon } from './IconComponents';
import Spinner from './Spinner';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'candidate' | 'recruiter'>('candidate');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const user = await login(email, password);
      const from = location.state?.from?.pathname || (user.role === 'hr' ? '/dashboard' : '/');
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const TabButton: React.FC<{tab: 'candidate' | 'recruiter'; label: string}> = ({tab, label}) => {
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
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-slate-200">
        <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center justify-center space-x-2">
              <BriefcaseIcon className="h-10 w-10 text-indigo-600" />
              <h1 className="text-3xl font-bold text-slate-800">TalentSphere</h1>
            </Link>
            <p className="text-slate-500 mt-2">Sign in to your account</p>
        </div>

        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg mb-6">
            <TabButton tab="candidate" label="Candidate" />
            <TabButton tab="recruiter" label="Recruiter" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email address</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email" 
              required 
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password" 
              required 
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
            />
          </div>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          
          <div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isLoading ? <Spinner /> : 'Sign In'}
            </button>
          </div>
        </form>
        
        {activeTab === 'candidate' && (
             <p className="mt-6 text-center text-sm text-slate-500">
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Sign up
                </Link>
            </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
