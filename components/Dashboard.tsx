import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getJobs, getApplicationsByCompany } from '../services/jobService';
import { getSuggestedCandidatesForCompany } from '../services/userService';
import type { Job, Application, ApplicationStatus, SuggestedCandidate } from '../types';
import Spinner from './Spinner';
import { BriefcaseIcon, DocumentPlusIcon, EyeIcon, ClockIcon, StarIcon, CheckBadgeIcon, XCircleIcon, LightBulbIcon, UserCircleIcon } from './IconComponents';
import { useAuth } from '../contexts/AuthContext';


const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex items-center border-t-4 border-t-indigo-500">
    <div className="bg-indigo-100 rounded-full p-3 mr-4">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [suggestedCandidates, setSuggestedCandidates] = useState<SuggestedCandidate[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.role !== 'hr' || !user.companyId) {
        setLoading(false);
        return;
      }
      try {
        const [fetchedJobs, fetchedApplications] = await Promise.all([
          getJobs(user.companyId),
          getApplicationsByCompany(user.companyId)
        ]);
        setJobs(fetchedJobs);
        setApplications(fetchedApplications.sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime()));
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchSuggestions = async () => {
      if (user?.role === 'hr' && user.companyId) {
        setLoadingSuggestions(true);
        try {
          const suggestions = await getSuggestedCandidatesForCompany(user.companyId);
          setSuggestedCandidates(suggestions.slice(0, 4)); // top 4
        } catch (error) {
          console.error("Failed to fetch candidate suggestions", error);
        } finally {
          setLoadingSuggestions(false);
        }
      }
    };

    fetchData();
    fetchSuggestions();
  }, [user]);

  const statusCounts = useMemo(() => {
    return applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
    }, {} as Record<ApplicationStatus, number>);
  }, [applications]);

  if (loading) {
    return <div className="text-center p-10"><Spinner /></div>;
  }
  
  const recentApplications = applications.slice(0, 5);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-800">HR Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title="Open Positions" value={jobs.length} icon={<BriefcaseIcon className="h-6 w-6 text-indigo-600" />} />
        <StatCard title="Total Applications" value={applications.length} icon={<EyeIcon className="h-6 w-6 text-indigo-600" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">Recent Applications</h2>
            <Link to="/applications" className="text-sm font-medium text-indigo-600 hover:underline">View All</Link>
          </div>
          {recentApplications.length > 0 ? (
            <ul className="divide-y divide-slate-200">
              {recentApplications.map(app => (
                <li key={app.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-700">{app.candidateName}</p>
                    <p className="text-sm text-slate-500">Applied for {app.jobTitle}</p>
                  </div>
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${app.status === 'Shortlisted' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                    {app.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-center py-8">No applications received yet.</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
           <h2 className="text-xl font-bold text-slate-800 mb-2">Application Pipeline</h2>
           <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center text-slate-600"><CheckBadgeIcon className="h-5 w-5 mr-2 text-blue-500" /> Submitted</span>
                  <span className="font-bold text-slate-800">{statusCounts.Submitted || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center text-slate-600"><ClockIcon className="h-5 w-5 mr-2 text-yellow-500" /> Under Review</span>
                  <span className="font-bold text-slate-800">{statusCounts['Under Review'] || 0}</span>
              </div>
               <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center text-slate-600"><StarIcon className="h-5 w-5 mr-2 text-purple-500" /> Shortlisted</span>
                  <span className="font-bold text-slate-800">{statusCounts.Shortlisted || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center text-slate-600"><XCircleIcon className="h-5 w-5 mr-2 text-gray-500" /> Rejected</span>
                  <span className="font-bold text-slate-800">{statusCounts.Rejected || 0}</span>
              </div>
           </div>
        </div>
      </div>

       <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
           <h2 className="text-xl font-bold text-slate-800 mb-4">Quick Actions</h2>
           <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/create-job" className="flex-1 flex items-center justify-center bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-shadow shadow-sm">
                    <DocumentPlusIcon className="h-5 w-5 mr-2" />
                    Post New Job
                </Link>
                <Link to="/applications" className="flex-1 flex items-center justify-center bg-slate-100 text-slate-700 font-semibold py-3 px-4 rounded-lg hover:bg-slate-200 transition-shadow shadow-sm">
                    <EyeIcon className="h-5 w-5 mr-2" />
                    View All Applications
                </Link>
           </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center">
            <LightBulbIcon className="h-6 w-6 mr-3 text-indigo-500" />
            AI-Powered Candidate Suggestions
          </h2>
           <p className="text-sm text-slate-500 mb-4">
            Discover untapped potential. Our AI suggests candidates from the entire talent pool who could be a great fit for your open roles.
          </p>
          {loadingSuggestions ? <div className="flex justify-center py-8"><Spinner/></div> : (
            suggestedCandidates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestedCandidates.map(candidate => (
                  <div key={candidate.candidateId} className="bg-slate-50/70 border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <UserCircleIcon className="h-10 w-10 text-slate-400 mr-3 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-800">{candidate.candidateName}</p>
                        <p className="text-xs text-slate-500 truncate">{candidate.candidateHeadline}</p>
                         <span className={`mt-2 inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${candidate.matchScore >= 75 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                           {candidate.matchScore}% Match
                         </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mt-2 italic border-l-2 border-indigo-200 pl-3">"{candidate.matchReason}"</p>
                  </div>
                ))}
              </div>
            ) : <p className="text-slate-500 text-center py-8">No candidate suggestions available right now. Check back later!</p>
          )}
        </div>

    </div>
  );
};

export default Dashboard;