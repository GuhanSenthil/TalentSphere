import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getApplicationById, updateApplicationStatus } from '../services/jobService';
import { getUserById, sendConnectionRequest } from '../services/userService';
import type { Application, ApplicationStatus, CandidateProfile, WorkExperience, Education } from '../types';
import Spinner from './Spinner';
import { CheckCircleIcon, XCircleIcon, StarIcon, BriefcaseIcon, UserPlusIcon, CheckIcon } from './IconComponents';
import { useAuth } from '../contexts/AuthContext';

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
};

const ProfileSection: React.FC<{title: string; children: React.ReactNode}> = ({ title, children }) => (
    <div>
        <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 mb-3">{title}</h3>
        {children}
    </div>
);

const WorkExperienceCard: React.FC<{exp: WorkExperience}> = ({exp}) => (
    <div className="mb-4">
        <h4 className="font-semibold text-slate-800">{exp.title}</h4>
        <p className="text-sm text-slate-600">{exp.company}</p>
        <p className="text-xs text-slate-500">{exp.startDate} - {exp.endDate}</p>
        <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{exp.description}</p>
    </div>
);

const EducationCard: React.FC<{edu: Education}> = ({edu}) => (
    <div className="mb-3">
        <h4 className="font-semibold text-slate-800">{edu.institution}</h4>
        <p className="text-sm text-slate-600">{edu.degree}, {edu.fieldOfStudy}</p>
        <p className="text-xs text-slate-500">{edu.startDate} - {edu.endDate}</p>
    </div>
);


const CandidateProfileView: React.FC<{profile: CandidateProfile}> = ({profile}) => (
    <div className="space-y-6">
        <ProfileSection title="Summary">
            <p className="text-slate-600 whitespace-pre-wrap">{profile.summary}</p>
        </ProfileSection>
        <ProfileSection title="Skills">
            <div className="flex flex-wrap gap-2">
                {profile.skills.map(skill => (
                    <span key={skill} className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-1 rounded-full">{skill}</span>
                ))}
            </div>
        </ProfileSection>
        <ProfileSection title="Work Experience">
            {profile.workExperience.map(exp => <WorkExperienceCard key={exp.id} exp={exp} />)}
        </ProfileSection>
        <ProfileSection title="Education">
            {profile.education.map(edu => <EducationCard key={edu.id} edu={edu} />)}
        </ProfileSection>
    </div>
);


const ApplicationDetail: React.FC = () => {
    const { appId } = useParams<{ appId: string }>();
    const { user } = useAuth();
    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'profile' | 'resume'>('profile');
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connected' | 'pending' | 'loading'>('loading');

    useEffect(() => {
        if (!appId) {
            setError("Application ID is missing.");
            setLoading(false);
            return;
        }

        const fetchApp = async () => {
            try {
                setLoading(true);
                const fetchedApp = await getApplicationById(appId);
                if (fetchedApp) {
                    setApplication(fetchedApp);
                    // Check connection status
                    if (user && user.role === 'hr') {
                        const candidateUser = await getUserById(fetchedApp.candidateId);
                        if (user.connections.includes(fetchedApp.candidateId)) {
                            setConnectionStatus('connected');
                        } else if (candidateUser?.connectionRequests.some(req => req.fromUserId === user.id)) {
                            setConnectionStatus('pending');
                        } else {
                            setConnectionStatus('idle');
                        }
                    }
                } else {
                    setError('Application not found.');
                }
            } catch (err) {
                setError('Failed to load application details.');
            } finally {
                setLoading(false);
            }
        };
        fetchApp();
    }, [appId, user]);
    
    const handleStatusChange = async (newStatus: ApplicationStatus) => {
        if (!application) return;
        try {
          const updatedApp = await updateApplicationStatus(application.id, newStatus);
          setApplication(updatedApp);
        } catch (err) {
          console.error("Failed to update status:", err);
        }
    };

    const handleConnect = async () => {
        if (!user || !application || connectionStatus !== 'idle') return;
        setConnectionStatus('loading');
        try {
            await sendConnectionRequest(user.id, application.candidateId);
            setConnectionStatus('pending');
        } catch (err) {
            console.error("Failed to send connection request:", err);
            setConnectionStatus('idle'); // Revert on error
        }
    };

    const ConnectButton: React.FC = () => {
        switch(connectionStatus) {
            case 'connected':
                return <button disabled className="flex items-center bg-green-100 text-green-800 font-semibold py-2 px-4 rounded-lg text-sm"><CheckIcon className="h-5 w-5 mr-2" /> Connected</button>;
            case 'pending':
                return <button disabled className="flex items-center bg-slate-100 text-slate-500 font-semibold py-2 px-4 rounded-lg text-sm">Pending</button>;
            case 'loading':
                return <button disabled className="bg-slate-100 text-slate-700 font-semibold py-2 px-4 rounded-lg text-sm w-28"><Spinner /></button>;
            case 'idle':
                return <button onClick={handleConnect} className="flex items-center bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 text-sm"><UserPlusIcon className="h-5 w-5 mr-2" /> Connect</button>;
            default:
                return null;
        }
    };


    if (loading) {
        return <div className="text-center p-10"><Spinner /></div>;
    }

    if (error || !application) {
        return <div className="text-center text-red-500 p-10">{error || 'Application not found.'}</div>;
    }
    
    const { score, matched_skills, missing_skills, summary } = application.atsResult;
    const scoreColor = score >= 75 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <Link to="/applications" className="text-indigo-600 hover:underline font-medium text-sm">
                    &larr; Back to all applications
                </Link>
            </div>
             <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{application.candidateName}</h1>
                        <p className="text-slate-600">Applied for <Link to={`/job/${application.jobId}`} className="text-indigo-600 hover:underline font-semibold">{application.jobTitle}</Link></p>
                    </div>
                    {user?.role === 'hr' && <ConnectButton />}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-slate-800">Candidate Information</h2>
                         <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
                            <button onClick={() => setActiveTab('profile')} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${activeTab === 'profile' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:bg-slate-200'}`}>Profile</button>
                            <button onClick={() => setActiveTab('resume')} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${activeTab === 'resume' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:bg-slate-200'}`}>Resume</button>
                        </div>
                    </div>
                    
                    {activeTab === 'profile' && <CandidateProfileView profile={application.profileSnapshot} />}
                    {activeTab === 'resume' && (
                         <div className="space-y-6">
                            <ProfileSection title="Submitted Resume">
                                <pre className="text-slate-600 whitespace-pre-wrap font-sans text-sm bg-slate-50 p-4 rounded-md border max-h-[60vh] overflow-y-auto">
                                    {application.resumeText}
                                </pre>
                            </ProfileSection>
                        </div>
                    )}
                </div>
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">AI Analysis</h3>
                        
                        <div className={`text-center py-4 mb-4 rounded-lg bg-slate-50 border`}>
                            <div className={`text-5xl font-bold ${scoreColor}`}>{score}<span className="text-2xl">%</span></div>
                            <p className="text-sm font-semibold text-slate-600 mt-1">Compatibility Score</p>
                            {score >= 85 && (
                                <span className="mt-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800 items-center">
                                    <StarIcon className="h-3 w-3 mr-1" />
                                    Top Candidate
                                </span>
                            )}
                        </div>

                        <div className="space-y-4 text-sm">
                             <div>
                                <h4 className="font-semibold text-slate-700 mb-1">Summary</h4>
                                <p className="text-slate-600 italic">"{summary}"</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-700 mb-2">Matched Skills</h4>
                                <ul className="space-y-1.5">
                                    {matched_skills.map(skill => (
                                        <li key={skill} className="flex items-center text-slate-600"><CheckCircleIcon className="h-4 w-4 mr-2 text-green-500"/>{skill}</li>
                                    ))}
                                </ul>
                            </div>
                             <div>
                                <h4 className="font-semibold text-slate-700 mb-2">Missing Skills</h4>
                                <ul className="space-y-1.5">
                                    {missing_skills.map(skill => (
                                        <li key={skill} className="flex items-center text-slate-600"><XCircleIcon className="h-4 w-4 mr-2 text-red-500"/>{skill}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
                        <h3 className="text-xl font-bold text-slate-800 mb-1">Actions</h3>
                         <div className="flex items-center space-x-2 text-sm mb-4">
                            <span className="text-slate-500">Current Status:</span> <StatusBadge status={application.status} />
                         </div>
                        <label htmlFor="status-update" className="block text-sm font-medium text-slate-700 mb-1">Update Status</label>
                         <select 
                            id="status-update" 
                            value={application.status} 
                            onChange={(e) => handleStatusChange(e.target.value as ApplicationStatus)}
                            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                         >
                            <option>Submitted</option>
                            <option>Under Review</option>
                            <option>Shortlisted</option>
                            <option>Rejected</option>
                         </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationDetail;