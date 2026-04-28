

import { GoogleGenAI, Type } from "@google/genai";
import type { Job, ATSResult, CandidateProfile, ResumeAnalysisResult, SuggestedCandidate } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const atsSchema = {
  type: Type.OBJECT,
  properties: {
    score: {
      type: Type.INTEGER,
      description: "A similarity score from 0-100 based on how well the candidate's resume and profile match the job requirements."
    },
    matched_skills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Skills from the job description that are also present in the candidate's resume."
    },
    missing_skills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Skills from the job description that are not found in the candidate's resume."
    },
    summary: {
      type: Type.STRING,
      description: "A short, one or two-sentence summary of the candidate's suitability, considering their experience and skills from the resume."
    }
  },
  required: ["score", "matched_skills", "missing_skills", "summary"],
};


const resumeAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    ...atsSchema.properties,
    suggestions: {
      type: Type.STRING,
      description: "Provide a detailed, actionable list of suggestions to improve the resume's ATS score and overall impact as a markdown-formatted string. Focus on incorporating missing keywords, using stronger action verbs, and improving clarity and formatting."
    },
    ats_friendly_resume: {
      type: Type.STRING,
      description: "Rewrite the provided resume to be more ATS-friendly based on your suggestions, incorporating keywords from the job description naturally. Maintain a professional tone. Output the full resume text."
    }
  },
  required: [...(atsSchema.required as string[]), "suggestions", "ats_friendly_resume"]
};

const formatProfileForAI = (profile: CandidateProfile): string => {
  let profileText = `
Candidate Name: ${profile.name}
Headline: ${profile.headline}
Summary: ${profile.summary}
Skills: ${profile.skills.join(', ')}
Work Experience:
${profile.workExperience.map(exp => `- ${exp.title} at ${exp.company}`).join('\n')}
Education:
${profile.education.map(edu => `- ${edu.degree} in ${edu.fieldOfStudy} from ${edu.institution}`).join('\n')}
  `;
  return profileText.trim();
};


export const calculateAI_ATSScore = async (job: Job, profile: CandidateProfile, resumeText: string): Promise<ATSResult> => {
  const jobDescription = `
    Job Title: ${job.title}
    Company: ${job.companyName}
    Location: ${job.location}
    Required Experience: ${job.experience}
    Required Skills: ${job.skills.join(', ')}
    Job Description: ${job.description}
  `;

  const candidateProfileText = formatProfileForAI(profile);

  const prompt = `
    You are a highly sophisticated ATS (Applicant Tracking System). Your task is to analyze a candidate's resume and structured profile against a job description and provide a detailed, structured analysis in JSON format. The resume is the primary source of truth.

    Carefully compare the following Job Description with the provided Candidate's Resume and their structured Profile.
    - Analyze the candidate's work experience, skills, and education primarily from the resume. Use the structured profile for additional context if needed.
    - Calculate a similarity score between 0 and 100 representing how well the candidate's overall profile matches the job requirements.
    - Identify which of the required skills are present in the candidate's resume ('matched_skills').
    - Identify which of the required skills are missing from the candidate's resume ('missing_skills').
    - Provide a concise, professional summary of the candidate's suitability for the role based on their resume.

    Job Description:
    ---
    ${jobDescription}
    ---

    Candidate's Resume:
    ---
    ${resumeText}
    ---

    Candidate's Structured Profile (for context):
    ---
    ${candidateProfileText}
    ---
    
    Now, provide your analysis in the specified JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: atsSchema,
      },
    });
    
    const jsonString = response.text;
    const result: ATSResult = JSON.parse(jsonString);
    return result;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Fallback to a simple keyword match if AI fails
    return calculateSimpleATSScore(job, resumeText);
  }
};

const calculateSimpleATSScore = (job: Job, resumeText: string): ATSResult => {
    const resumeTextLower = resumeText.toLowerCase();
    const jobSkillsLower = job.skills.map(s => s.toLowerCase());
    let matchedCount = 0;
    const matched_skills: string[] = [];
    const missing_skills: string[] = [];

    job.skills.forEach((skill, index) => {
        const skillRegex = new RegExp(`\\b${jobSkillsLower[index].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
        if (skillRegex.test(resumeTextLower)) {
            matchedCount++;
            matched_skills.push(skill);
        } else {
            missing_skills.push(skill);
        }
    });

    const score = job.skills.length > 0 ? Math.round((matchedCount / job.skills.length) * 100) : 0;
    
    return {
        score,
        matched_skills,
        missing_skills,
        summary: "AI analysis failed. This is a fallback score based on simple keyword matching of skills in the provided resume. Review profile manually."
    };
};

export const analyzeResumeAgainstJobDescription = async (resumeText: string, jobDescriptionText: string): Promise<ResumeAnalysisResult> => {
    const prompt = `
    You are an expert career coach and resume writer specializing in optimizing resumes for Applicant Tracking Systems (ATS). Your task is to analyze the provided resume against the job description and provide a comprehensive analysis in a structured JSON format.

    Here is the job description:
    ---
    ${jobDescriptionText}
    ---

    Here is the candidate's resume:
    ---
    ${resumeText}
    ---

    Please provide your analysis based on the following criteria:
    1.  **score**: An integer from 0-100 representing how well the resume matches the job description.
    2.  **matched_skills**: An array of skills from the job description found in the resume.
    3.  **missing_skills**: An array of skills from the job description NOT found in the resume.
    4.  **summary**: A one or two-sentence professional summary of the candidate's suitability.
    5.  **suggestions**: A markdown-formatted string with a detailed, actionable list of suggestions to improve the resume's ATS score and overall impact. Focus on incorporating missing keywords, using stronger action verbs, and improving clarity.
    6.  **ats_friendly_resume**: Rewrite the entire resume to be more ATS-friendly based on your suggestions. Incorporate keywords from the job description naturally and maintain a professional tone.
    
    Now, provide your complete analysis in the specified JSON format.
  `;

  const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: resumeAnalysisSchema,
      },
    });

    const jsonString = response.text;
    const result: ResumeAnalysisResult = JSON.parse(jsonString);
    return result;
}

// --- New Suggestion Functions ---

const jobSuggestionsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            jobId: { type: Type.STRING },
            matchScore: { type: Type.INTEGER, description: 'A score from 0-100 indicating the match quality.' },
            reason: { type: Type.STRING, description: 'A short, one-sentence reason for the suggestion.' }
        },
        required: ["jobId", "matchScore", "reason"]
    }
};

export const getJobSuggestions = async (profile: CandidateProfile, allJobs: Job[]): Promise<{jobId: string, matchScore: number, reason: string}[]> => {
    const prompt = `
    You are an expert AI recruitment assistant. Your task is to analyze a candidate's profile and suggest the most relevant jobs from a provided list.

    Candidate Profile:
    ---
    ${formatProfileForAI(profile)}
    ---

    Available Jobs:
    ---
    ${allJobs.map(job => `Job ID: ${job.id}\nTitle: ${job.title}\nDescription: ${job.description}\nSkills: ${job.skills.join(', ')}`).join('\n---\n')}
    ---

    Based on the candidate's skills and experience, provide a list of up to the top 3 most suitable jobs. For each suggestion, include the job ID, a match score from 0-100, and a brief, one-sentence reason for the recommendation. Provide the output in the specified JSON format.
  `;
  const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: jobSuggestionsSchema,
      },
  });
  const jsonString = response.text;
  return JSON.parse(jsonString);
};

const candidateSuggestionsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            candidateId: { type: Type.STRING },
            matchScore: { type: Type.INTEGER, description: 'A score from 0-100 indicating the match quality.' },
            matchReason: { type: Type.STRING, description: 'A short, one-sentence reason explaining why this candidate is a good fit for one of the open roles.' }
        },
        required: ["candidateId", "matchScore", "matchReason"]
    }
};

export const getCandidateSuggestions = async (companyJobs: Job[], allCandidates: CandidateProfile[]): Promise<Omit<SuggestedCandidate, 'candidateName' | 'candidateHeadline'>[]> => {
    const prompt = `
    You are an expert AI talent sourcer for a tech company. Your task is to analyze a list of open job positions and a pool of potential candidates, then recommend the best candidates.

    Our Open Positions:
    ---
    ${companyJobs.map(job => `Job ID: ${job.id}\nTitle: ${job.title}\nDescription: ${job.description}\nRequired Skills: ${job.skills.join(', ')}`).join('\n---\n')}
    ---

    Available Candidates:
    ---
    ${allCandidates.map(p => `Candidate ID: ${p.userId}\nName: ${p.name}\nHeadline: ${p.headline}\nSummary: ${p.summary}\nSkills: ${p.skills.join(', ')}`).join('\n---\n')}
    ---

    Based on our open roles, identify up to the top 4 candidates from the pool who would be a strong fit. For each candidate, provide their ID, a match score from 0-100, and a concise, one-sentence reason explaining why they are a good match for one of our open roles. Provide the output in the specified JSON format.
  `;
   const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: candidateSuggestionsSchema,
      },
  });
  const jsonString = response.text;
  return JSON.parse(jsonString);
};