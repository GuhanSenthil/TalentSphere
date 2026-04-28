
import React, { useState } from 'react';
import { analyzeResumeAgainstJobDescription } from '../services/geminiService';
import type { ResumeAnalysisResult } from '../types';
import Spinner from './Spinner';
import { CheckCircleIcon, XCircleIcon, SparklesIcon, DocumentMagnifyingGlassIcon } from './IconComponents';
import FileUpload from './FileUpload';

const ResultDisplay: React.FC<{ result: ResumeAnalysisResult }> = ({ result }) => {
    const { score, matched_skills, missing_skills, summary, suggestions, ats_friendly_resume } = result;
    const scoreColor = score >= 75 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500';
    const [activeTab, setActiveTab] = useState('suggestions');

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border animate-fade-in space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 text-center">Analysis Complete</h2>

            <div className={`text-center py-4 rounded-lg bg-slate-50 border`}>
                <div className={`text-6xl font-bold ${scoreColor}`}>{score}<span className="text-2xl">%</span></div>
                <p className="text-lg font-semibold text-slate-600 mt-1">ATS Compatibility Score</p>
            </div>
            
            <div className="text-center bg-slate-50 p-4 rounded-lg border">
                <h3 className="font-semibold text-slate-700 mb-1">AI Summary</h3>
                <p className="text-slate-600 italic">"{summary}"</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                    <h3 className="font-semibold text-slate-700 mb-2">Matched Skills</h3>
                    <ul className="space-y-1.5">
                        {matched_skills.map(skill => (
                            <li key={skill} className="flex items-center"><CheckCircleIcon className="h-4 w-4 mr-2 text-green-500"/>{skill}</li>
                        ))}
                         {matched_skills.length === 0 && <li className="text-slate-500">No skills matched.</li>}
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold text-slate-700 mb-2">Missing Skills</h3>
                    <ul className="space-y-1.5">
                        {missing_skills.map(skill => (
                            <li key={skill} className="flex items-center"><XCircleIcon className="h-4 w-4 mr-2 text-red-500"/>{skill}</li>
                        ))}
                        {missing_skills.length === 0 && <li className="text-slate-500">No required skills missing!</li>}
                    </ul>
                </div>
            </div>

            <div>
                 <div className="flex justify-center space-x-1 bg-slate-100 p-1 rounded-lg mb-4">
                    <button onClick={() => setActiveTab('suggestions')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors w-full ${activeTab === 'suggestions' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:bg-slate-200'}`}>
                        AI Suggestions
                    </button>
                    <button onClick={() => setActiveTab('optimized')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors w-full ${activeTab === 'optimized' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:bg-slate-200'}`}>
                        Optimized Resume
                    </button>
                </div>

                {activeTab === 'suggestions' && (
                    <div className="prose prose-sm max-w-none p-4 bg-slate-50 rounded-lg border" dangerouslySetInnerHTML={{ __html: suggestions.replace(/\n/g, '<br />') }}></div>
                )}

                {activeTab === 'optimized' && (
                     <pre className="text-slate-600 whitespace-pre-wrap font-sans text-sm bg-slate-50 p-4 rounded-md border max-h-[60vh] overflow-y-auto">
                        {ats_friendly_resume}
                    </pre>
                )}
            </div>
        </div>
    );
};


const ResumeAnalyzer: React.FC = () => {
    const [resumeText, setResumeText] = useState('');
    const [jobDescText, setJobDescText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
    const [showPasteMessage, setShowPasteMessage] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resumeText || !jobDescText) {
            setError('Please provide both your resume and the job description.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const analysisResult = await analyzeResumeAgainstJobDescription(resumeText, jobDescText);
            setResult(analysisResult);
        } catch (err) {
            console.error(err);
            setError('Failed to analyze resume. The AI service may be temporarily unavailable.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-800">AI Resume Analyzer</h1>
                <p className="text-slate-500 mt-2 max-w-2xl mx-auto">Get instant feedback on your resume. Paste your resume and a job description to see your ATS score and get tips for improvement.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
                    <div>
                        <label htmlFor="resume" className="block text-lg font-medium text-slate-700">Your Resume</label>
                        <p className="text-sm text-slate-500 mb-2">Upload or paste the full text of your resume here.</p>
                        <FileUpload onFileSelect={() => setShowPasteMessage(true)} />
                         {showPasteMessage && (
                          <div className="mt-2 p-2 bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs rounded-lg">
                            <strong>File selected!</strong> Now, please paste the text from your document into the text area below.
                          </div>
                        )}
                        <textarea
                            id="resume"
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                            rows={10}
                            className="mt-2 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Paste resume text..."
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="job-desc" className="block text-lg font-medium text-slate-700">Job Description</label>
                        <p className="text-sm text-slate-500 mb-2">Paste the complete job description you're targeting.</p>
                        <textarea
                            id="job-desc"
                            value={jobDescText}
                            onChange={(e) => setJobDescText(e.target.value)}
                            rows={10}
                            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Paste job description..."
                            required
                        />
                    </div>
                     {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                    >
                        {isLoading ? <Spinner /> : (<><SparklesIcon className="h-5 w-5 mr-2" /> Analyze My Resume</>)}
                    </button>
                </form>

                <div className="sticky top-24">
                    {isLoading && (
                         <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                            <Spinner />
                            <p className="mt-4 text-slate-600 font-medium">Analyzing... This may take a moment.</p>
                         </div>
                    )}
                    {result && <ResultDisplay result={result} />}
                    {!isLoading && !result && (
                         <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                            <DocumentMagnifyingGlassIcon className="mx-auto h-16 w-16 text-slate-300" />
                            <p className="mt-4 text-slate-500">Your analysis results will appear here.</p>
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResumeAnalyzer;