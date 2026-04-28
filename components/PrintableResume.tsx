import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PrintableResume: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { resumeText, title } = location.state || { resumeText: '', title: 'Optimized Resume' };

    useEffect(() => {
        if (!resumeText) {
            // If there's no resume text, redirect back to the home page.
            navigate('/');
            return;
        }

        // Trigger the print dialog once the component mounts
        setTimeout(() => {
            window.print();
        }, 500); // A small delay to ensure content is rendered

    }, [resumeText, navigate]);

    if (!resumeText) {
        return null; // Render nothing while redirecting
    }

    return (
        <div className="print-container font-serif bg-white p-8 md:p-12 max-w-4xl mx-auto my-8 shadow-lg border">
            <h1 className="text-3xl font-bold text-center mb-6">{title}</h1>
            <pre className="whitespace-pre-wrap text-base leading-relaxed font-sans">
                {resumeText}
            </pre>
            <div className="no-print text-center mt-8 space-x-4">
                <button 
                    onClick={() => window.print()}
                    className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700"
                >
                    Print / Save as PDF
                </button>
                 <button 
                    onClick={() => window.history.back()}
                    className="bg-slate-200 text-slate-800 font-semibold py-2 px-6 rounded-lg hover:bg-slate-300"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
};

export default PrintableResume;
