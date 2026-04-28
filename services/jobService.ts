import { mockJobs, mockApplications } from '../data/mockData';
import type { Job, Application, ApplicationStatus, MatchedJob, CandidateProfile } from '../types';
import { calculateAI_ATSScore, getJobSuggestions } from './geminiService';


// Simulate network delay for non-Firestore operations
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));


export const getJobs = async (companyId?: string): Promise<Job[]> => {
  await delay(200);
  if (companyId) {
    return mockJobs.filter(j => j.companyId === companyId);
  }
  return [...mockJobs];
};

export const getJobById = async (id: string): Promise<Job | undefined> => {
  await delay(50);
  return mockJobs.find(job => job.id === id);
};

export const createJob = async (jobData: Omit<Job, 'id'>): Promise<Job> => {
  await delay(300);
  const newJob: Job = { id: `job-mock-${crypto.randomUUID()}`, ...jobData };
  mockJobs.push(newJob);
  return newJob;
};

export const applyForJob = async (jobId: string, candidateProfile: CandidateProfile, resumeText: string): Promise<Application> => {
  await delay(1000); // Delay for AI call simulation
  const job = await getJobById(jobId);
  if (!job) {
    throw new Error('Job not found');
  }

  const atsResult = await calculateAI_ATSScore(job, candidateProfile, resumeText);

  const newApplication: Application = {
    id: `app-mock-${crypto.randomUUID()}`,
    jobId,
    jobTitle: job.title,
    companyId: job.companyId,
    companyName: job.companyName,
    candidateId: candidateProfile.userId,
    candidateName: candidateProfile.name,
    profileSnapshot: candidateProfile,
    resumeText,
    atsResult,
    status: 'Submitted' as ApplicationStatus,
    appliedAt: new Date(),
  };

  mockApplications.push(newApplication);
  
  return newApplication;
};

export const getApplicationsByCompany = async (companyId: string): Promise<Application[]> => {
  await delay(200);
  return mockApplications.filter(app => app.companyId === companyId);
};

export const getApplicationsByCandidate = async (candidateId: string): Promise<Application[]> => {
  await delay(200);
  return mockApplications.filter(app => app.candidateId === candidateId);
}

export const getApplicationById = async (id: string): Promise<Application | undefined> => {
    await delay(50);
    return mockApplications.find(app => app.id === id);
}

export const updateApplicationStatus = async (applicationId: string, status: ApplicationStatus): Promise<Application> => {
    await delay(100);
    const appIndex = mockApplications.findIndex(app => app.id === applicationId);
    if (appIndex === -1) throw new Error("Application not found");
    
    mockApplications[appIndex].status = status;
    return mockApplications[appIndex];
};

export const getSuggestedJobsForCandidate = async (profile: CandidateProfile): Promise<MatchedJob[]> => {
  await delay(1000); // simulate AI delay
  const allJobs = await getJobs();
  if (!profile.skills || profile.skills.length === 0) return [];

  try {
    const suggestedJobResults = await getJobSuggestions(profile, allJobs);
    
    if (suggestedJobResults.length === 0) return [];
    
    const suggestedJobIds = new Set(suggestedJobResults.map(s => s.jobId));
    const foundJobs = mockJobs.filter(j => suggestedJobIds.has(j.id));
    
    const matchedJobs: MatchedJob[] = suggestedJobResults
        .map(suggestion => {
            const job = foundJobs.find(j => j.id === suggestion.jobId);
            if (job) {
                return {
                    ...job,
                    matchScore: suggestion.matchScore,
                    reason: suggestion.reason,
                };
            }
            return null;
        })
        .filter((j): j is MatchedJob => j !== null)
        .sort((a, b) => b.matchScore - a.matchScore);
        
    return matchedJobs;
  } catch(e) {
    console.error("Error getting job suggestions:", e);
    return []; // return empty on error
  }
};