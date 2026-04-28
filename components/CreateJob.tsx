import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../services/jobService';
import Spinner from './Spinner';
import { useAuth } from '../contexts/AuthContext';
import type { Job } from '../types';

const CreateJob: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<Job['type']>('Job');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role !== 'hr' || !user.companyId || !user.companyName) {
        setError("You are not authorized to create jobs.");
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await createJob({
        title,
        description,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        experience,
        location,
        companyId: user.companyId,
        companyName: user.companyName,
        type,
      });
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create job. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Post a New Opportunity</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">Opportunity Type</label>
            <div className="mt-2 flex space-x-6">
                <label className="flex items-center">
                    <input type="radio" name="type" value="Job" checked={type === 'Job'} onChange={() => setType('Job')} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" />
                    <span className="ml-2 text-sm text-slate-700">Job</span>
                </label>
                <label className="flex items-center">
                    <input type="radio" name="type" value="Internship" checked={type === 'Internship'} onChange={() => setType('Internship')} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" />
                    <span className="ml-2 text-sm text-slate-700">Internship</span>
                </label>
            </div>
          </div>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700">Title</label>
            <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-slate-700">Location</label>
            <input type="text" id="location" value={location} onChange={e => setLocation(e.target.value)} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
          <div>
            <label htmlFor="experience" className="block text-sm font-medium text-slate-700">Experience Required</label>
            <input type="text" id="experience" value={experience} onChange={e => setExperience(e.target.value)} required placeholder="e.g., 5+ years" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={5} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-slate-700">Required Skills</label>
            <input type="text" id="skills" value={skills} onChange={e => setSkills(e.target.value)} required placeholder="Enter skills separated by commas" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300">
              {isLoading ? <Spinner /> : 'Post Opportunity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJob;