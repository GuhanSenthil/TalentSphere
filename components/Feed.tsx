import React, { useState, useEffect } from 'react';
import { getPosts, createPost } from '../services/communityService';
import { getSuggestedConnections, sendConnectionRequest } from '../services/userService';
import type { Post, UserCredentials } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Spinner from './Spinner';
import { UserCircleIcon, UserPlusIcon } from './IconComponents';

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
    return (
        <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center mb-4">
                <UserCircleIcon className="h-10 w-10 text-slate-400 mr-3" />
                <div>
                    <p className="font-bold text-slate-800">{post.authorName}</p>
                    <p className="text-xs text-slate-500">{post.authorHeadline}</p>
                </div>
            </div>
            <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
            <p className="text-xs text-slate-400 mt-4 text-right pt-3 border-t">
                {post.createdAt.toLocaleString()}
            </p>
        </div>
    );
};

const CreatePost: React.FC<{ onPostCreated: (newPost: Post) => void }> = ({ onPostCreated }) => {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !user) return;
        setIsLoading(true);
        try {
            const newPost = await createPost(user.id, content);
            onPostCreated(newPost);
            setContent('');
        } catch (error) {
            console.error("Failed to create post", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-3">Share an Update</h2>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={4}
                    placeholder="What's on your mind?"
                    required
                />
                <div className="text-right mt-3">
                    <button
                        type="submit"
                        disabled={isLoading || !content.trim()}
                        className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors shadow-sm"
                    >
                        {isLoading ? <Spinner /> : 'Post'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const Feed: React.FC = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [suggestedConnections, setSuggestedConnections] = useState<UserCredentials[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<Record<string, 'idle' | 'pending'>>({});

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            const fetchedPosts = await getPosts();
            setPosts(fetchedPosts);
            setLoading(false);
        };

        const fetchConnections = async () => {
            if (user) {
                try {
                const connections = await getSuggestedConnections(user.id);
                setSuggestedConnections(connections.slice(0, 5));
                } catch (error) {
                console.error("Failed to fetch connections", error);
                }
            }
        };

        fetchPosts();
        fetchConnections();
    }, [user]);

    const handlePostCreated = (newPost: Post) => {
        setPosts(prevPosts => [newPost, ...prevPosts]);
    };

    const handleConnect = async (recipientId: string) => {
        if (!user) return;
        setConnectionStatus(prev => ({ ...prev, [recipientId]: 'pending' }));
        try {
            await sendConnectionRequest(user.id, recipientId);
        } catch(e) {
            console.error(e);
            setConnectionStatus(prev => ({ ...prev, [recipientId]: 'idle' }));
        }
    }

    return (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
                <h1 className="text-3xl font-bold text-slate-800">Community Feed</h1>
                <CreatePost onPostCreated={handlePostCreated} />
                {loading ? (
                    <div className="text-center p-10"><Spinner /></div>
                ) : (
                    <div className="space-y-5">
                        {posts.map(post => <PostCard key={post.id} post={post} />)}
                        {posts.length === 0 && <p className="text-slate-500 text-center py-10">The feed is empty. Be the first to post!</p>}
                    </div>
                )}
            </div>
             <div className="lg:col-span-1 space-y-6 sticky top-24">
                {suggestedConnections.length > 0 && (
                <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">People You May Know</h2>
                    <ul className="space-y-4">
                        {suggestedConnections.map(conn => (
                            <li key={conn.id} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <UserCircleIcon className="h-10 w-10 text-slate-400 mr-3" />
                                    <div>
                                        <p className="font-bold text-sm text-slate-800">{conn.name}</p>
                                        <p className="text-xs text-slate-500">{conn.companyName}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleConnect(conn.id)}
                                    disabled={connectionStatus[conn.id] === 'pending'}
                                    className="flex items-center bg-indigo-100 text-indigo-700 font-semibold py-1.5 px-3 rounded-full hover:bg-indigo-200 text-xs disabled:bg-slate-100 disabled:text-slate-500"
                                >
                                    <UserPlusIcon className="h-4 w-4 mr-1.5" />
                                    {connectionStatus[conn.id] === 'pending' ? 'Pending' : 'Connect'}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                )}
            </div>
        </div>
    );
};

export default Feed;