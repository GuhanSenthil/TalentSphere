import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getApplicationsByCompany } from '../services/jobService';
import type { Application, ApplicationStatus } from '../types';
import Spinner from './Spinner';
import { StarIcon } from './IconComponents';
import { useAuth } from '../contexts/AuthContext';


const NoApplicationsIcon = () => (
    <svg className="mx-auto h-20 w-20 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

const StatusBadge: React.FC<{status: ApplicationStatus}> = ({status}) => {
    const styles = {
        Submitted: 'bg-blue-100 text-blue-800',
        'Under Review': 'bg-yellow-100 text-yellow-800',
        Shortlisted: 'bg-purple-100 text-purple-800',
        Rejected: 'bg-gray-100 text-gray-800',
    };
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>
            {status}
        </span>
    );
}

const ViewApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const [filterJobId, setFilterJobId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score_desc' | 'score_asc' | 'date_desc'>('score_desc');

  useEffect(() => {
    const fetchApplications = async () => {
      if (user?.role !== 'hr' || !user.companyId) {
        setError('Unauthorized');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const fetchedApplications = await getApplicationsByCompany(user.companyId);
        setApplications(fetchedApplications);
      } catch (err) {
        setError('Failed to load applications.');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [user]);

  const uniqueJobs = useMemo(() => {
    const jobMap = new Map<string, string>();
    applications.forEach(app => {
        if (!jobMap.has(app.jobId)) {
            jobMap.set(app.jobId, app.jobTitle);
        }
    });
    return Array.from(jobMap.entries());
  }, [applications]);

  const filteredAndSortedApps = useMemo(() => {
    return applications
        .filter(app => filterJobId === 'all' || app.jobId === filterJobId)
        .sort((a, b) => {
            switch (sortBy) {
                case 'score_asc':
                    return a.atsResult.score - b.atsResult.score;
                case 'date_desc':
                     return b.appliedAt.getTime() - a.appliedAt.getTime();
                case 'score_desc':
                default:
                    return b.atsResult.score - a.atsResult.score;
            }
        });
  }, [applications, filterJobId, sortBy]);
  
  const ScoreBadge: React.FC<{score: number}> = ({score}) => {
    const getScoreColorClasses = () => {
        if (score >= 75) return 'bg-green-100 text-green-800';
        if (score >= 50) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    }
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getScoreColorClasses()}`}>
            {score}% Match
        </span>
    );
  };

  if (loading) {
    return <div className="text-center p-10"><Spinner /></div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-10">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Candidate Applications</h1>

       {applications.length > 0 && (
        <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-slate-50 border rounded-lg">
            <div className="flex-1">
                <label htmlFor="filter-job" className="block text-sm font-medium text-slate-700">Filter by Job</label>
                <select id="filter-job" value={filterJobId} onChange={e => setFilterJobId(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    <option value="all">All Jobs</option>
                    {uniqueJobs.map(([jobId, jobTitle]) => (
                        <option key={jobId} value={jobId}>{jobTitle}</option>
                    ))}
                </select>
            </div>
            <div className="flex-1">
                <label htmlFor="sort-by" className="block text-sm font-medium text-slate-700">Sort By</label>
                <select id="sort-by" value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    <option value="score_desc">Score: High to Low</option>
                    <option value="score_asc">Score: Low to High</option>
                    <option value="date_desc">Newest First</option>
                </select>
            </div>
        </div>
      )}

      {filteredAndSortedApps.length === 0 ? (
        <div className="text-center bg-white p-12 rounded-lg shadow-sm border">
            <NoApplicationsIcon />
            <h2 className="text-xl font-medium text-slate-700 mt-4">
              {filterJobId === 'all' ? 'No Applications Yet' : 'No Applications for this Job'}
            </h2>
            <p className="text-slate-500 mt-2">
              {filterJobId === 'all' ? 'When candidates apply, their submissions will appear here.' : 'Try selecting another job.'}
            </p>
            {filterJobId === 'all' && (
                <Link to="/create-job" className="mt-6 inline-block bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-sm">
                    Post Your First Job
                </Link>
            )}
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <ul className="divide-y divide-slate-200">
            {filteredAndSortedApps.map((app) => (
              <li key={app.id} className="p-6 hover:bg-slate-50/70">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="mb-4 md:mb-0">
                    <p className="text-lg text-slate-800 font-semibold">{app.candidateName}</p>
                    <p className="text-sm text-slate-500">Applied for: <span className="text-indigo-600 font-medium">{app.jobTitle}</span></p>
                    <div className="mt-2 flex items-center space-x-2">
                        <ScoreBadge score={app.atsResult.score} />
                        <StatusBadge status={app.status} />
                        {app.atsResult.score >= 85 && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800 items-center">
                            <StarIcon className="h-3 w-3 mr-1" />
                            Top Candidate
                          </span>
                        )}
                    </div>
                  </div>
                  <Link 
                    to={`/application/${app.id}`}
                    className="bg-slate-100 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-200 transition-colors duration-200 text-sm w-full md:w-auto">
                    View Profile & Details
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ViewApplications;