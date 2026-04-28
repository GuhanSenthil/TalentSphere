import React, { useState, useEffect, useRef } from 'react';
import { getNotifications, markNotificationsAsRead } from '../services/communityService';
import { handleConnectionRequest } from '../services/userService';
import type { Notification } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { BellIcon, UserPlusIcon, CheckIcon, XMarkIcon } from './IconComponents';

const NotificationsMenu: React.FC = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const menuRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        if (user) {
            const fetched = await getNotifications(user.id);
            setNotifications(fetched);
        }
    };

    useEffect(() => {
        if(user) {
            fetchNotifications();
            // Optional: Poll for new notifications periodically
            const interval = setInterval(fetchNotifications, 30000); // every 30s
            return () => clearInterval(interval);
        }
    }, [user]);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const toggleMenu = async () => {
        setIsOpen(!isOpen);
        if (!isOpen && unreadCount > 0 && user) {
            // Mark as read when opening
            await markNotificationsAsRead(user.id);
            // Refresh state to show them as read
            fetchNotifications();
        }
    };
    
    const onHandleRequest = async (senderId: string, action: 'accept' | 'reject') => {
        if (!user) return;
        await handleConnectionRequest(user.id, senderId, action);
        // Refresh notifications and user context (if implemented)
        fetchNotifications();
        // You might want a more robust state management to update user connections globally
    };

    const notificationText = (n: Notification) => {
        switch (n.type) {
            case 'CONNECTION_REQUEST':
                return <><strong>{n.senderName}</strong> sent you a connection request.</>;
            case 'CONNECTION_ACCEPTED':
                 return <><strong>{n.senderName}</strong> accepted your connection request.</>;
            default:
                return "You have a new notification.";
        }
    }


    return (
        <div className="relative" ref={menuRef}>
            <button onClick={toggleMenu} className="relative p-2 rounded-full hover:bg-slate-100">
                <BellIcon className="h-6 w-6 text-slate-500" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                        {unreadCount}
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 max-h-96 overflow-y-auto">
                    <div className="px-4 py-2 font-bold text-slate-800 border-b">Notifications</div>
                    {notifications.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-slate-500">No notifications yet.</p>
                    ) : (
                        notifications.map(n => (
                            <div key={n.id} className={`px-4 py-3 border-b last:border-b-0 text-sm ${!n.read ? 'bg-indigo-50' : ''}`}>
                                <div className="flex items-start">
                                    <UserPlusIcon className="h-5 w-5 text-indigo-500 mr-3 mt-0.5 shrink-0" />
                                    <div className="flex-grow">
                                        <p className="text-slate-700">{notificationText(n)}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{n.createdAt.toLocaleDateString()}</p>
                                        {n.type === 'CONNECTION_REQUEST' && (
                                            <div className="flex space-x-2 mt-2">
                                                <button onClick={() => onHandleRequest(n.senderId, 'accept')} className="flex-1 bg-indigo-500 text-white text-xs font-semibold py-1 px-2 rounded hover:bg-indigo-600">Accept</button>
                                                <button onClick={() => onHandleRequest(n.senderId, 'reject')} className="flex-1 bg-slate-200 text-slate-700 text-xs font-semibold py-1 px-2 rounded hover:bg-slate-300">Decline</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationsMenu;