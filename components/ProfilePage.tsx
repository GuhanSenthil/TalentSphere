


import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Spinner from './Spinner';
import type { WorkExperience, Education } from '../types';
// FIX: Import DocumentTextIcon to resolve usage error.
import { DocumentMagnifyingGlassIcon, BriefcaseIcon, AcademicCapIcon, SparklesIcon, DocumentTextIcon } from './IconComponents';

const ProfileSection: React.FC<{title: string; icon: React.ReactNode; children: React.ReactNode; editLink?: string}> = ({ title, icon, editLink, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-3">
            <div className="flex items-center">
                {icon}
                <h2 className="text-xl font-bold text-slate-800">{title}</h2>
            </div>
            {editLink && <Link to={editLink} className="text-sm font-medium text-indigo-600 hover:underline">Edit</Link>}
        </div>
        {children}
    </div>
);

const WorkExperienceCard: React.FC<{exp: WorkExperience}> = ({exp}) => (
    <div className="border-t border-slate-200 py-4 first:border-t-0 first:pt-0 last:pb-0">
        <h3 className="font-semibold text-slate-800">{exp.title}</h3>
        <p className="text-sm text-slate-600">{exp.company}</p>
        <p className="text-xs text-slate-500">{exp.startDate} - {exp.endDate}</p>
        <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{exp.description}</p>
    </div>
);

const EducationCard: React.FC<{edu: Education}> = ({edu}) => (
    <div className="border-t border-slate-200 py-4 first:border-t-0 first:pt-0 last:pb-0">
        <h3 className="font-semibold text-slate-800">{edu.institution}</h3>
        <p className="text-sm text-slate-600">{edu.degree}, {edu.fieldOfStudy}</p>
        <p className="text-xs text-slate-500">{edu.startDate} - {edu.endDate}</p>
    </div>
);

const ProfilePage: React.FC = () => {
    const { profile, loading } = useAuth();

    if (loading) {
        return <div className="text-center p-10"><Spinner /></div>;
    }

    if (!profile) {
        return <div className="text-center p-10 text-red-500">Could not load profile.</div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start">
                    <div className="mb-4 sm:mb-0">
                        <h1 className="text-3xl font-bold text-slate-800">{profile.name}</h1>
                        <p className="text-slate-600 mt-1 text-lg">{profile.headline}</p>
                        <p className="text-sm text-slate-500">{profile.email}</p>
                    </div>
                    <Link to="/profile/edit" className="w-full sm:w-auto text-center shrink-0 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-all shadow-sm">
                        Edit Profile
                    </Link>
                </div>
            </div>

            <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center">
                         <DocumentMagnifyingGlassIcon className="h-10 w-10 text-indigo-500 mr-4 shrink-0" />
                        <div>
                           <h2 className="text-lg font-bold text-indigo-900">Improve Your Resume Score</h2>
                           <p className="text-sm text-indigo-700 mt-1">Use our AI tool to analyze and optimize your resume against a job description before you apply.</p>
                        </div>
                    </div>
                    <Link to="/resume-analyzer" className="w-full sm:w-auto text-center shrink-0 bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-sm">
                        Analyze Resume
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                     <ProfileSection title="Work Experience" editLink="/profile/edit" icon={<BriefcaseIcon className="h-6 w-6 mr-3 text-slate-500" />}>
                         {profile.workExperience.length > 0 ? (
                            profile.workExperience.map(exp => <WorkExperienceCard key={exp.id} exp={exp} />)
                        ) : <p className="text-slate-500">No work experience added.</p>}
                    </ProfileSection>
                    
                    <ProfileSection title="Education" editLink="/profile/edit" icon={<AcademicCapIcon className="h-6 w-6 mr-3 text-slate-500" />}>
                         {profile.education.length > 0 ? (
                            profile.education.map(edu => <EducationCard key={edu.id} edu={edu} />)
                        ) : <p className="text-slate-500">No education history added.</p>}
                    </ProfileSection>
                </div>
                <div className="space-y-6">
                    <ProfileSection title="Summary" editLink="/profile/edit" icon={<DocumentTextIcon className="h-6 w-6 mr-3 text-slate-500" />}>
                        <p className="text-slate-600 whitespace-pre-wrap text-sm">{profile.summary || 'No summary provided.'}</p>
                    </ProfileSection>
                    <ProfileSection title="Skills" editLink="/profile/edit" icon={<SparklesIcon className="h-6 w-6 mr-3 text-slate-500" />}>
                        {profile.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map(skill => (
                                    <span key={skill} className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1.5 rounded-full">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        ) : <p className="text-slate-500">No skills added.</p>}
                    </ProfileSection>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;