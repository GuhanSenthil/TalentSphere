import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../services/userService';
import type { CandidateProfile, WorkExperience, Education } from '../types';
import Spinner from './Spinner';

const EditProfilePage: React.FC = () => {
    const { profile, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<CandidateProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [skillsInput, setSkillsInput] = useState('');

    useEffect(() => {
        if (profile) {
            setFormData(profile);
            setSkillsInput(profile.skills.join(', '));
        }
    }, [profile]);

    const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!formData) return;
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSkillsInput(e.target.value);
        if (!formData) return;
        setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) });
    };

    const handleWorkExpChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!formData) return;
        const newWorkExp = [...formData.workExperience];
        newWorkExp[index] = { ...newWorkExp[index], [e.target.name]: e.target.value };
        setFormData({ ...formData, workExperience: newWorkExp });
    };
    
    const addWorkExp = () => {
        if (!formData) return;
        const newWorkExp: WorkExperience = { id: crypto.randomUUID(), title: '', company: '', startDate: '', endDate: '', description: ''};
        setFormData({ ...formData, workExperience: [...formData.workExperience, newWorkExp] });
    };

    const removeWorkExp = (index: number) => {
        if (!formData) return;
        const newWorkExp = formData.workExperience.filter((_, i) => i !== index);
        setFormData({ ...formData, workExperience: newWorkExp });
    };
    
    const handleEducationChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (!formData) return;
        const newEducation = [...formData.education];
        newEducation[index] = { ...newEducation[index], [e.target.name]: e.target.value };
        setFormData({ ...formData, education: newEducation });
    };
    
    const addEducation = () => {
        if (!formData) return;
        const newEdu: Education = { id: crypto.randomUUID(), institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '' };
        setFormData({ ...formData, education: [...formData.education, newEdu] });
    };

    const removeEducation = (index: number) => {
        if (!formData) return;
        const newEducation = formData.education.filter((_, i) => i !== index);
        setFormData({ ...formData, education: newEducation });
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;
        setIsLoading(true);
        setError(null);
        try {
            await updateProfile(formData);
            await refreshProfile();
            navigate('/profile');
        } catch (err) {
            setError('Failed to save profile.');
            setIsLoading(false);
        }
    };

    if (!formData) {
        return <div className="text-center p-10"><Spinner /></div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h1 className="text-2xl font-bold text-slate-800 mb-4">Edit Your Profile</h1>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Full Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleBasicChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Headline</label>
                            <input type="text" name="headline" placeholder="e.g., Senior Software Engineer" value={formData.headline} onChange={handleBasicChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Summary</label>
                            <textarea name="summary" rows={4} value={formData.summary} onChange={handleBasicChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Skills</label>
                            <input type="text" name="skills" placeholder="Enter skills, separated by commas" value={skillsInput} onChange={handleSkillsChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Work Experience</h2>
                    {formData.workExperience.map((exp, index) => (
                        <div key={exp.id} className="space-y-3 border-b pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Job Title</label>
                                    <input type="text" name="title" value={exp.title} onChange={e => handleWorkExpChange(index, e)} className="mt-1 block w-full rounded-md border-slate-300" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Company</label>
                                    <input type="text" name="company" value={exp.company} onChange={e => handleWorkExpChange(index, e)} className="mt-1 block w-full rounded-md border-slate-300" />
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-slate-700">Start Date</label>
                                    <input type="text" name="startDate" placeholder="e.g., Jan 2020" value={exp.startDate} onChange={e => handleWorkExpChange(index, e)} className="mt-1 block w-full rounded-md border-slate-300" />
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-slate-700">End Date</label>
                                    <input type="text" name="endDate" placeholder="e.g., Present" value={exp.endDate} onChange={e => handleWorkExpChange(index, e)} className="mt-1 block w-full rounded-md border-slate-300" />
                                </div>
                           </div>
                           <div>
                                <label className="block text-sm font-medium text-slate-700">Description</label>
                                <textarea name="description" rows={3} value={exp.description} onChange={e => handleWorkExpChange(index, e)} className="mt-1 block w-full rounded-md border-slate-300"></textarea>
                           </div>
                           <button type="button" onClick={() => removeWorkExp(index)} className="text-red-600 text-sm font-medium">Remove Experience</button>
                        </div>
                    ))}
                    <button type="button" onClick={addWorkExp} className="mt-4 text-indigo-600 font-semibold">Add Experience</button>
                </div>
                
                 <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Education</h2>
                    {formData.education.map((edu, index) => (
                        <div key={edu.id} className="space-y-3 border-b pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Institution</label>
                                    <input type="text" name="institution" value={edu.institution} onChange={e => handleEducationChange(index, e)} className="mt-1 block w-full rounded-md border-slate-300" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Degree</label>
                                    <input type="text" name="degree" value={edu.degree} onChange={e => handleEducationChange(index, e)} className="mt-1 block w-full rounded-md border-slate-300" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Field of Study</label>
                                    <input type="text" name="fieldOfStudy" value={edu.fieldOfStudy} onChange={e => handleEducationChange(index, e)} className="mt-1 block w-full rounded-md border-slate-300" />
                                </div>
                                  <div>
                                    <label className="block text-sm font-medium text-slate-700">Start Year</label>
                                    <input type="text" name="startDate" value={edu.startDate} onChange={e => handleEducationChange(index, e)} className="mt-1 block w-full rounded-md border-slate-300" />
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-slate-700">End Year</label>
                                    <input type="text" name="endDate" value={edu.endDate} onChange={e => handleEducationChange(index, e)} className="mt-1 block w-full rounded-md border-slate-300" />
                                </div>
                           </div>
                           <button type="button" onClick={() => removeEducation(index)} className="text-red-600 text-sm font-medium">Remove Education</button>
                        </div>
                    ))}
                    <button type="button" onClick={addEducation} className="mt-4 text-indigo-600 font-semibold">Add Education</button>
                </div>

                <div className="flex justify-end space-x-4">
                    <button type="button" onClick={() => navigate('/profile')} className="bg-slate-100 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-200">Cancel</button>
                    <button type="submit" disabled={isLoading} className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400">
                        {isLoading ? <Spinner /> : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProfilePage;
