// No longer using firebase, so Timestamp is a standard Date object.

export type Timestamp = Date;

export interface Company {
  id: string;
  name: string;
  description: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  skills: string[];
  experience: string;
  location: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  type: 'Job' | 'Internship';
}

export interface ATSResult {
  score: number;
  matched_skills: string[];
  missing_skills: string[];
  summary: string;
}

export interface ResumeAnalysisResult extends ATSResult {
  suggestions: string; // Detailed feedback for improvement as a markdown string
  ats_friendly_resume: string; // A revised version of the resume text
}


export type ApplicationStatus = 'Submitted' | 'Under Review' | 'Shortlisted' | 'Rejected';

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  candidateId: string;
  candidateName: string;
  profileSnapshot: CandidateProfile;
  resumeText: string;
  atsResult: ATSResult;
  status: ApplicationStatus;
  appliedAt: Timestamp;
}

export interface MatchedJob extends Job {
  matchScore: number;
  reason: string;
}

export interface SuggestedCandidate {
  candidateId: string;
  candidateName: string;
  candidateHeadline: string;
  matchReason: string;
  matchScore: number;
}

// --- New Profile and User Types ---

export interface WorkExperience {
  id:string;
  title: string;
  company: string;
  startDate: string;
  endDate: string; // 'Present' or a date
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
}

export interface CandidateProfile {
  userId: string;
  name: string;
  email: string;
  headline: string;
  summary: string;
  skills: string[];
  workExperience: WorkExperience[];
  education: Education[];
}


// --- New Social Networking Types ---

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorHeadline: string;
  content: string;
  createdAt: Timestamp;
}

export type NotificationType = 'CONNECTION_REQUEST' | 'CONNECTION_ACCEPTED' | 'NEW_POST_SHARED';

export interface Notification {
  id: string;
  recipientId: string;
  senderId: string;
  senderName: string;
  type: NotificationType;
  read: boolean;
  createdAt: Timestamp;
  relatedEntityId?: string; // e.g., postId
}

export interface ConnectionRequest {
    fromUserId: string;
    fromUserName: string;
}

export interface UserCredentials {
  id: string;
  email: string;
  name: string;
  role: 'candidate' | 'hr';
  companyId?: string; // Only for HR
  companyName?: string; // Only for HR
  connections: string[]; // Array of user IDs
  connectionRequests: ConnectionRequest[]; // Incoming connection requests
}