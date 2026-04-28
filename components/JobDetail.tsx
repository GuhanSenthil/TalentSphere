
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJobById } from '../services/jobService';
import type { Job } from '../types';
import Spinner from './Spinner';
import { BriefcaseIcon, MapPinIcon, AcademicCapIcon } from './IconComponents';
import { useAuth } from '../contexts/AuthContext';
import ResumeOptimizer from './ResumeOptimizer';

const JobDetail: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!jobId) {
      setError("Job ID is missing.");
      setLoading(false);
      return;
    }

    const fetchJob = async () => {
      try {
        setLoading(true);
        const fetchedJob = await getJobById(jobId);
        if (fetchedJob) {
          setJob(fetchedJob);
        } else {
          setError('Job not found.');
        }
      } catch (err) {
        setError('Failed to load job details.');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  if (loading) {
    return <div className="text-center p-10"><Spinner /></div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-10">{error}</div>;
  }

  if (!job) {
    return <div className="text-center text-slate-500 p-10">No job details available.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <Link to="/" className="text-indigo-600 hover:underline font-medium text-sm">
          &larr; Back to all jobs
        </Link>
      </div>
      <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between md:items-start">
            <div className='mb-4 md:mb-0'>
                <h1 className="text-3xl font-bold text-slate-800">{job.title}</h1>
                <p className="text-lg font-medium text-slate-600 mt-1">{job.companyName}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-500 text-sm mt-3">
                    <span className="flex items-center">
                      {job.type === 'Job' 
                        ? <BriefcaseIcon className="h-4 w-4 mr-1.5"/> 
                        : <AcademicCapIcon className="h-4 w-4 mr-1.5"/>
                      }
                      {job.type}
                    </span>
                    <span className="flex items-center"><BriefcaseIcon className="h-4 w-4 mr-1.5"/>{job.experience}</span>
                    <span className="flex items-center"><MapPinIcon className="h-4 w-4 mr-1.5"/>{job.location}</span>
                </div>
            </div>
            {user?.role === 'candidate' && (
                 <Link
                    to={`/apply/${job.id}`}
                    className="w-full md:w-auto text-center shrink-0 bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
                  >
                    Easy Apply
                  </Link>
            )}
        </div>

        <hr className="my-6 border-slate-200" />
        
        <div>
            <h2 className="text-xl font-semibold text-slate-700 mb-3">Job Description</h2>
            <p className="text-slate-600 whitespace-pre-wrap">{job.description}</p>
        </div>

        <div className="mt-8">
            <h2 className="text-xl font-semibold text-slate-700 mb-3">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
                {job.skills.map(skill => (
                    <span key={skill} className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1.5 rounded-full">
                    {skill}
                    </span>
                ))}
            </div>
        </div>

        {user?.role === 'candidate' && (
          <ResumeOptimizer job={job} />
        )}

      </div>
    </div>
  );
};

export default JobDetail;