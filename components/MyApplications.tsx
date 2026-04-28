import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getApplicationsByCandidate } from '../services/jobService';
import type { Application, ApplicationStatus } from '../types';
import Spinner from './Spinner';
import { BriefcaseIcon } from './IconComponents';
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


const MyApplications: React.FC = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user || user.role !== 'candidate') {
            setError('You must be logged in as a candidate to view applications.');
            setLoading(false);
            return;
        }

        const fetchApps = async () => {
            try {
                setLoading(true);
                const fetchedApps = await getApplicationsByCandidate(user.id);
                setApplications(fetchedApps.sort((a,b) => b.appliedAt.getTime() - a.appliedAt.getTime()));
            } catch (err) {
                setError('Failed to load your applications.');
            } finally {
                setLoading(false);
            }
        };
        fetchApps();
    }, [user]);

    if (loading) {
        return <div className="text-center p-10"><Spinner /></div>;
    }

    if (error) {
        return <div className="text-center text-red-500 p-10">{error}</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">My Applications</h1>
            {applications.length === 0 ? (
                <div className="text-center bg-white p-12 rounded-lg shadow-sm border">
                    <BriefcaseIcon className="mx-auto h-20 w-20 text-slate-300" />
                    <h2 className="text-xl font-medium text-slate-700 mt-4">You haven't applied to any jobs yet.</h2>
                    <p className="text-slate-500 mt-2">Your submitted applications will appear here.</p>
                    <Link to="/" className="mt-6 inline-block bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-sm">
                        Find Jobs
                    </Link>
                </div>
            ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <ul className="divide-y divide-slate-200">
                        {applications.map((app) => (
                            <li key={app.id} className="p-6 hover:bg-slate-50/70">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                                    <div className="flex-1 mb-4 md:mb-0">
                                        <Link to={`/job/${app.jobId}`} className="block">
                                            <h2 className="text-xl font-semibold text-indigo-600 hover:underline">{app.jobTitle}</h2>
                                        </Link>
                                        <p className="text-sm text-slate-600 mt-1">{app.companyName}</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Applied on: {app.appliedAt.toLocaleDateString()}
                                        </p>
                                        <div className="mt-3 flex items-center space-x-2">
                                            <ScoreBadge score={app.atsResult.score} />
                                            <StatusBadge status={app.status} />
                                        </div>
                                    </div>
                                    <div className="w-full md:w-auto">
                                        <Link
                                            to={`/job/${app.jobId}`}
                                            className="w-full md:w-auto text-center inline-block bg-slate-100 text-slate-700 font-semibold py-2 px-6 rounded-lg hover:bg-slate-200 transition-colors duration-200"
                                        >
                                            View Job
                                        </Link>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default MyApplications;