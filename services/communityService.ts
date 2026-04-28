import { mockPosts, mockNotifications } from '../data/mockData';
import type { Post, Notification } from '../types';
import { getProfileByUserId } from './userService';

// --- Post Functions ---

export const getPosts = async (): Promise<Post[]> => {
    // Return a copy sorted by date
    return [...mockPosts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const createPost = async (authorId: string, content: string): Promise<Post> => {
    const authorProfile = await getProfileByUserId(authorId);
    if (!authorProfile) throw new Error("Author profile not found");

    const newPost: Post = {
        id: `post-mock-${crypto.randomUUID()}`,
        authorId,
        authorName: authorProfile.name,
        authorHeadline: authorProfile.headline,
        content,
        createdAt: new Date(),
    };
    
    mockPosts.push(newPost);
    return newPost;
};

// --- Notification Functions ---

export const getNotifications = async (userId: string): Promise<Notification[]> => {
    const userNotifications = mockNotifications.filter(n => n.recipientId === userId);
    return userNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const createNotification = async (
    data: Omit<Notification, 'id' | 'createdAt' | 'read'>
): Promise<Notification> => {
    const newNotification: Notification = {
        id: `noti-mock-${crypto.randomUUID()}`,
        ...data,
        read: false,
        createdAt: new Date(),
    };
    mockNotifications.push(newNotification);
    return newNotification;
};

export const markNotificationsAsRead = async (userId: string): Promise<void> => {
    mockNotifications.forEach(n => {
        if (n.recipientId === userId && !n.read) {
            n.read = true;
        }
    });
};