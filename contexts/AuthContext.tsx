import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { UserCredentials, CandidateProfile } from '../types';
import { getProfileByUserId, RegisterData, createInitialCandidateProfile, createCompanyAndHrUser, getUserById } from '../services/userService';
import { mockUsers } from '../data/mockData';

interface AuthContextType {
  user: UserCredentials | null;
  profile: CandidateProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<UserCredentials>;
  signup: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserCredentials | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserFromSession = async () => {
        const loggedInUserId = sessionStorage.getItem('loggedInUserId');
        if (loggedInUserId) {
            const user = await getUserById(loggedInUserId);
            if (user) {
                setUser(user);
                if (user.role === 'candidate') {
                    const userProfile = await getProfileByUserId(user.id);
                    setProfile(userProfile);
                }
            }
        }
        setLoading(false);
    };
    loadUserFromSession();
  }, []);

  const login = async (email: string, pass: string): Promise<UserCredentials> => {
    // NOTE: In this mock implementation, we are ignoring the password.
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser) {
        sessionStorage.setItem('loggedInUserId', foundUser.id);
        setUser(foundUser);
        if (foundUser.role === 'candidate') {
            const userProfile = await getProfileByUserId(foundUser.id);
            setProfile(userProfile);
        }
        return foundUser;
    } else {
        throw new Error("Invalid credentials. Hint: try candidate@test.com or hr@test.com");
    }
  };

  const signup = async (data: RegisterData) => {
    const existingUser = mockUsers.find(u => u.email === data.email);
    if (existingUser) {
        throw new Error("Email is already in use.");
    }

    const userId = `user-mock-${crypto.randomUUID()}`;
    let newUser: UserCredentials | undefined;

    if (data.role === 'candidate') {
        await createInitialCandidateProfile(userId, data.name, data.email);
        newUser = await getUserById(userId);
    } else if (data.role === 'hr') {
        if (!data.companyName) throw new Error("Company name is required for recruiters.");
        await createCompanyAndHrUser(userId, data.name, data.email, data.companyName, data.companyNeeds);
        newUser = await getUserById(userId);
    }

    if (newUser) {
        sessionStorage.setItem('loggedInUserId', newUser.id);
        setUser(newUser);
        if (newUser.role === 'candidate') {
            const newProfile = await getProfileByUserId(newUser.id);
            setProfile(newProfile);
        }
    } else {
        throw new Error("Failed to create and log in user.");
    }
  };

  const logout = async () => {
    sessionStorage.removeItem('loggedInUserId');
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user && user.role === 'candidate') {
        const freshProfile = await getProfileByUserId(user.id);
        setProfile(freshProfile);
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, signup, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};