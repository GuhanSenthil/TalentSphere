import { mockUsers, mockProfiles, mockCompanies } from '../data/mockData';
import type { UserCredentials, CandidateProfile, SuggestedCandidate, Company } from '../types';
import { createNotification } from './communityService';
import { getCandidateSuggestions } from './geminiService';
import { getJobs } from './jobService';

// Simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export interface RegisterData {
    name: string;
    email: string;
    pass: string;
    role: 'candidate' | 'hr';
    companyName?: string;
    companyNeeds?: string;
}

export const createInitialCandidateProfile = async (userId: string, name: string, email: string): Promise<void> => {
    const newUser: UserCredentials = {
        id: userId,
        name,
        email,
        role: 'candidate',
        connections: [],
        connectionRequests: [],
    };
    const newProfile: CandidateProfile = {
        userId: userId,
        name: name,
        email: email,
        headline: '',
        summary: '',
        skills: [],
        workExperience: [],
        education: []
    };
    
    mockUsers.push(newUser);
    mockProfiles.push(newProfile);
}

export const createCompanyAndHrUser = async (userId: string, name: string, email: string, companyName: string, companyNeeds?: string): Promise<void> => {
    // Create company first
    const companyId = `comp-mock-${crypto.randomUUID()}`;
    const newCompany: Company = {
        id: companyId,
        name: companyName,
        description: companyNeeds || ''
    };
    mockCompanies.push(newCompany);

    // Then create HR user linked to that company
    const newUser: UserCredentials = {
        id: userId,
        name,
        email,
        role: 'hr',
        companyId: companyId,
        companyName: companyName,
        connections: [],
        connectionRequests: [],
    };
    mockUsers.push(newUser);
}


export const getProfileByUserId = async (userId: string): Promise<CandidateProfile | null> => {
    await delay(50);
    const profile = mockProfiles.find(p => p.userId === userId);
    return profile || null;
};


export const updateProfile = async (updatedProfile: CandidateProfile): Promise<CandidateProfile> => {
    await delay(200);
    const profileIndex = mockProfiles.findIndex(p => p.userId === updatedProfile.userId);
    if (profileIndex !== -1) {
        mockProfiles[profileIndex] = updatedProfile;
    } else {
        // If profile doesn't exist, create it.
        mockProfiles.push(updatedProfile);
    }
    return updatedProfile;
};

export const getAllCandidateProfiles = async (): Promise<CandidateProfile[]> => {
    await delay(100);
    return [...mockProfiles];
};

// --- Connection Functions ---

export const getUserById = async (userId: string): Promise<UserCredentials | undefined> => {
    await delay(50);
    return mockUsers.find(u => u.id === userId);
}

export const sendConnectionRequest = async (senderId: string, recipientId: string): Promise<void> => {
    const sender = await getUserById(senderId);
    if (!sender) throw new Error("Sender not found");

    const recipientIndex = mockUsers.findIndex(u => u.id === recipientId);
    if (recipientIndex === -1) throw new Error("Recipient not found");

    // Add request if not already present
    if (!mockUsers[recipientIndex].connectionRequests.some(req => req.fromUserId === senderId)) {
        mockUsers[recipientIndex].connectionRequests.push({ fromUserId: senderId, fromUserName: sender.name });
    }

    // Create a notification for the recipient
    await createNotification({
        recipientId,
        senderId,
        senderName: sender.name,
        type: 'CONNECTION_REQUEST',
    });
};

export const handleConnectionRequest = async (recipientId: string, senderId: string, action: 'accept' | 'reject'): Promise<void> => {
    const recipientIndex = mockUsers.findIndex(u => u.id === recipientId);
    const senderIndex = mockUsers.findIndex(u => u.id === senderId);

    if (recipientIndex === -1 || senderIndex === -1) throw new Error("User not found");

    const recipient = mockUsers[recipientIndex];
    const sender = mockUsers[senderIndex];

    // Remove the request from the recipient's list
    recipient.connectionRequests = recipient.connectionRequests.filter(req => req.fromUserId !== senderId);

    if (action === 'accept') {
        // Add each other to connections lists if not already connected
        if (!recipient.connections.includes(senderId)) {
            recipient.connections.push(senderId);
        }
        if (!sender.connections.includes(recipientId)) {
            sender.connections.push(recipientId);
        }

        // Notify sender that their request was accepted
        await createNotification({
            recipientId: senderId,
            senderId: recipientId,
            senderName: recipient.name,
            type: 'CONNECTION_ACCEPTED',
        });
    }
};


// --- Suggestion Functions ---

export const getSuggestedCandidatesForCompany = async (companyId: string): Promise<SuggestedCandidate[]> => {
    await delay(1500); // Simulate AI delay
    const companyJobs = await getJobs(companyId);
    if (companyJobs.length === 0) return [];
    
    const allCandidates = await getAllCandidateProfiles();
    if (allCandidates.length === 0) return [];
    
    try {
        const suggestionsFromAI = await getCandidateSuggestions(companyJobs, allCandidates);

        const suggestedCandidates: SuggestedCandidate[] = suggestionsFromAI.map(suggestion => {
            const candidateProfile = allCandidates.find(c => c.userId === suggestion.candidateId);
            if (candidateProfile) {
                return {
                    candidateId: candidateProfile.userId,
                    candidateName: candidateProfile.name,
                    candidateHeadline: candidateProfile.headline,
                    matchReason: suggestion.matchReason,
                    matchScore: suggestion.matchScore,
                };
            }
            return null;
        }).filter((c): c is SuggestedCandidate => c !== null)
        .sort((a,b) => b.matchScore - a.matchScore);

        return suggestedCandidates;
    } catch(e) {
        console.error("Error getting candidate suggestions:", e);
        return [];
    }
};

export const getSuggestedConnections = async (userId: string): Promise<UserCredentials[]> => {
    await delay(300);
    const currentUser = await getUserById(userId);
    if (!currentUser || currentUser.role !== 'candidate') return [];
    
    // Suggest all HR users to candidates that they aren't connected to.
    const hrUsers = mockUsers.filter(u => u.role === 'hr');
    
    return hrUsers.filter(hr => !currentUser.connections.includes(hr.id));
};