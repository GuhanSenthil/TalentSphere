import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getJobs, getSuggestedJobsForCandidate } from '../services/jobService';
import type { Job, MatchedJob } from '../types';
import { BriefcaseIcon, MapPinIcon, LightBulbIcon, SparklesIcon } from './IconComponents';
import { useAuth } from '../contexts/AuthContext';

const JobListItemSkeleton: React.FC = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between animate-pulse">
          <div className="flex-1 mb-4 md:mb-0 w-full">
              <div className="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
               <div className="h-4 bg-slate-200 rounded w-1/3 mb-3"></div>
              <div className="flex items-center space-x-4">
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                  <div className="h-5 bg-slate-200 rounded-full w-20"></div>
                  <div className="h-5 bg-slate-200 rounded-full w-24"></div>
                  <div className="h-5 bg-slate-200 rounded-full w-16"></div>
              </div>
          </div>
          <div className="w-full md:w-auto">
              <div className="h-10 bg-slate-200 rounded-lg w-full md:w-32"></div>
          </div>
      </div>
  </div>
);

const FilterButton: React.FC<{label: string; isActive: boolean; onClick: () => void;}> = ({label, isActive, onClick}) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-md focus:outline-none transition-colors ${
            isActive ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
        }`}
    >
        {label}
    </button>
);


const JobList: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();
  const [suggestedJobs, setSuggestedJobs] = useState<MatchedJob[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [filter, setFilter] = useState<'All' | 'Job' | 'Internship'>('All');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const fetchedJobs = await getJobs();
        setJobs(fetchedJobs);
      } catch (err) {
        setError('Failed to load jobs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    const fetchSuggestions = async () => {
      if (user?.role === 'candidate' && profile && (profile.skills.length > 0 || profile.summary)) {
        setLoadingSuggestions(true);
        try {
          const suggestions = await getSuggestedJobsForCandidate(profile);
          setSuggestedJobs(suggestions.slice(0, 3));
        } catch (err) {
          console.error('Failed to load suggested jobs.');
        } finally {
          setLoadingSuggestions(false);
        }
      }
    };

    fetchJobs();
    fetchSuggestions();
  }, [user, profile]);

  const filteredJobs = useMemo(() => {
    if (filter === 'All') return jobs;
    return jobs.filter(job => job.type === filter);
  }, [jobs, filter]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-9 bg-slate-200 rounded w-1/3 animate-pulse mb-6"></div>
        <div className="space-y-4">
            <JobListItemSkeleton />
            <JobListItemSkeleton />
            <JobListItemSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 p-10">{error}</div>;
  }

  return (
    <div className="space-y-8">
       {user?.role === 'candidate' && (loadingSuggestions || suggestedJobs.length > 0) && (
        <div className="mb-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
              <LightBulbIcon className="h-6 w-6 mr-3 text-amber-500" />
              Jobs You Might Like
            </h2>
          {loadingSuggestions ? (
            <div className="space-y-4">
              <JobListItemSkeleton/>
              <JobListItemSkeleton/>
            </div>
          ) : (
            <ul className="space-y-4">
              {suggestedJobs.map((job) => (
                <li key={`sugg-${job.id}`} className="bg-white p-6 rounded-lg shadow-sm border-2 border-indigo-200 bg-indigo-50/30">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                    <div className="flex-1 mb-4 md:mb-0">
                      <Link to={`/job/${job.id}`} className="block">
                        <div className="flex items-center gap-3">
                           <h2 className="text-xl font-semibold text-indigo-600 hover:underline">{job.title}</h2>
                           <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${job.type === 'Internship' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                {job.type}
                           </span>
                        </div>
                      </Link>
                      <p className="text-sm font-medium text-slate-600 mt-1">{job.companyName}</p>
                       <div className="flex items-center space-x-1 text-sm text-green-700 font-semibold mt-2 bg-green-100/80 rounded-full px-2 py-1 w-fit">
                            <SparklesIcon className="h-4 w-4 mr-1"/>
                            <span>{job.matchScore}% Match:</span>
                            <span className="font-normal text-green-800 italic ml-1">"{job.reason}"</span>
                        </div>
                    </div>
                    <div className="w-full md:w-auto">
                      <Link
                        to={`/job/${job.id}`}
                        className="w-full md:w-auto text-center inline-block bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-slate-800">All Open Positions</h1>
        <div className="flex space-x-2 mt-4 bg-slate-100 p-1 rounded-lg w-fit">
            <FilterButton label="All" isActive={filter === 'All'} onClick={() => setFilter('All')} />
            <FilterButton label="Jobs" isActive={filter === 'Job'} onClick={() => setFilter('Job')} />
            <FilterButton label="Internships" isActive={filter === 'Internship'} onClick={() => setFilter('Internship')} />
        </div>
      </div>

       <ul className="space-y-4">
          {filteredJobs.map((job) => (
            <li key={job.id} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-300 transition-all duration-200">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div className="flex-1 mb-4 md:mb-0">
                  <Link to={`/job/${job.id}`} className="block">
                     <div className="flex items-center gap-3">
                        <h2 className="text-xl font-semibold text-indigo-600 hover:underline">{job.title}</h2>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${job.type === 'Internship' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                            {job.type}
                        </span>
                    </div>
                  </Link>
                  <p className="text-sm font-medium text-slate-600 mt-1">{job.companyName}</p>
                  <div className="flex items-center space-x-4 text-slate-500 text-sm mt-2">
                    <span className="flex items-center">
                        <BriefcaseIcon className="h-4 w-4 mr-1.5"/>
                        {job.experience}
                    </span>
                    <span className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-1.5"/>
                        {job.location}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.skills.slice(0, 5).map(skill => (
                      <span key={skill} className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-1 rounded-full">
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 5 && (
                      <span className="bg-slate-100 text-slate-800 text-xs font-medium px-2.5 py-1 rounded-full">
                        +{job.skills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full md:w-auto">
                   <Link
                    to={`/job/${job.id}`}
                    className="w-full md:w-auto text-center inline-block bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {filteredJobs.length === 0 && (
          <div className="text-center bg-white p-12 rounded-lg shadow-sm border">
            <h2 className="text-xl font-medium text-slate-700 mt-4">No {filter}s Found</h2>
            <p className="text-slate-500 mt-2">There are currently no open {filter.toLowerCase()} positions. Try another category!</p>
          </div>
        )}
    </div>
  );
};

export default JobList;