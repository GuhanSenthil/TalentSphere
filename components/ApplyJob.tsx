
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getJobById, applyForJob } from '../services/jobService';
import type { Job, Application, CandidateProfile } from '../types';
import Spinner from './Spinner';
import { CheckCircleIcon, XCircleIcon } from './IconComponents';
import { useAuth } from '../contexts/AuthContext';
import FileUpload from './FileUpload';

const ATSResultCard: React.FC<{ application: Application }> = ({ application }) => {
    const { score, matched_skills, missing_skills, summary } = application.atsResult;
    const scoreColor = score >= 75 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 animate-fade-in max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Application Analysis Complete</h2>
            <p className="text-center text-slate-500 mb-6">Here is the AI-powered analysis of your profile for the <strong>{application.jobTitle}</strong> role.</p>
            
            <div className="flex justify-center items-center mb-8">
                <div className={`text-6xl font-bold ${scoreColor}`}>{score}<span className="text-3xl">%</span></div>
                <div className="ml-4">
                    <div className="text-xl font-semibold text-slate-700">Compatibility Score</div>
                    <p className="text-slate-500">Based on your professional profile.</p>
                </div>
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-700 mb-3">AI Summary</h3>
                <p className="text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200">{summary}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-3">Matched Skills</h3>
                    <ul className="space-y-2">
                        {matched_skills.map(skill => (
                            <li key={skill} className="flex items-center text-slate-600">
                                <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500"/>
                                {skill}
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-3">Missing Skills</h3>
                    <ul className="space-y-2">
                         {missing_skills.map(skill => (
                            <li key={skill} className="flex items-center text-slate-600">
                                <XCircleIcon className="h-5 w-5 mr-2 text-red-500"/>
                                {skill}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
             <div className="mt-8 text-center space-x-6">
                <Link to="/my-applications" className="text-indigo-600 hover:underline font-medium">
                    View My Applications
                </Link>
                <Link to="/" className="text-indigo-600 hover:underline font-medium">
                    &larr; Back to all jobs
                </Link>
            </div>
        </div>
    );
};

const ProfileSnapshot: React.FC<{profile: CandidateProfile}> = ({ profile }) => (
    <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
        <div>
            <h3 className="font-semibold text-slate-700">{profile.name}</h3>
            <p className="text-sm text-slate-500">{profile.headline}</p>
        </div>
        <div className="text-sm text-slate-600">
            <p className="font-medium">Skills:</p>
            <div className="flex flex-wrap gap-1 mt-1">
                {profile.skills.slice(0, 7).map(s => <span key={s} className="bg-slate-200 text-slate-700 text-xs font-medium px-2 py-0.5 rounded-full">{s}</span>)}
                {profile.skills.length > 7 && <span className="text-xs font-medium text-slate-500 py-0.5">+{profile.skills.length-7} more</span>}
            </div>
        </div>
         <div className="text-sm text-slate-600">
            <p className="font-medium">Recent Experience:</p>
            <p>{profile.workExperience[0]?.title} at {profile.workExperience[0]?.company}</p>
        </div>
        <div className="text-center text-xs text-slate-400 pt-2">This is a snapshot of your profile.</div>
    </div>
)


const ApplyJob: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applicationResult, setApplicationResult] = useState<Application | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [showPasteMessage, setShowPasteMessage] = useState(false);
  
  useEffect(() => {
    if (!jobId) {
        setError('Job not found.');
        setIsLoading(false);
        return;
    }
    if (user?.role !== 'candidate' || !profile) {
        setError('You must be logged in with a complete profile to apply.');
        setIsLoading(false);
        return;
    }
      const fetchJob = async () => {
        setIsLoading(true);
        const fetchedJob = await getJobById(jobId);
        if (fetchedJob) {
          setJob(fetchedJob);
        } else {
          setError('Job not found.');
        }
        setIsLoading(false);
      };
      fetchJob();
  }, [jobId, user, profile]);

  const handleFileSelect = () => {
    // In a real app, you would parse the file here.
    // For this simulation, we'll just prompt the user to paste the text.
    setShowPasteMessage(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId || !profile || !resumeText) return;
    
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await applyForJob(jobId, profile, resumeText);
      setApplicationResult(result);
    } catch (err) {
      setError('An error occurred while submitting your application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-10"><Spinner /></div>;
  }
  
  if (error || !job) {
    return <div className="text-center p-10 text-red-500">{error || 'Could not load job details.'}</div>;
  }
  
  if (applicationResult) {
      return <ATSResultCard application={applicationResult} />;
  }

  return (
    <div className="max-w-2xl mx-auto">
        <div className="mb-4">
            <Link to={`/job/${jobId}`} className="text-indigo-600 hover:underline font-medium text-sm">
                &larr; Back to Job Details
            </Link>
        </div>
      <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-800">Apply for {job.title}</h1>
        <p className="text-slate-500 mt-2">at {job.companyName}</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
                <label className="block text-lg font-medium text-slate-700 mb-2">
                Your Professional Profile
                </label>
                <p className="text-sm text-slate-600">Your application will be submitted using your saved profile. You can <Link to="/profile/edit" className="text-indigo-600 underline">edit your profile</Link> before applying.</p>
                {profile && <ProfileSnapshot profile={profile} />}
            </div>
            
            <div>
                <label htmlFor="resume" className="block text-lg font-medium text-slate-700 mb-2">
                    Submit Your Resume
                </label>
                <p className="text-sm text-slate-600 mb-3">Upload your resume or paste the text below for AI analysis.</p>

                <FileUpload onFileSelect={handleFileSelect} />

                {showPasteMessage && (
                  <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 text-indigo-800 text-sm rounded-lg">
                    <strong>File selected!</strong> Now, please paste the full text from your document into the text area below to continue.
                  </div>
                )}

                <textarea
                    id="resume"
                    rows={12}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    required
                    className="mt-4 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Paste your resume text here..."
                />
            </div>
          
          <div>
            <button
              type="submit"
              disabled={isSubmitting || !resumeText}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Spinner /> : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyJob;