import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserCircleIcon } from './IconComponents';

const UserMenu: React.FC<{isMobile?: boolean}> = ({ isMobile = false }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        navigate('/login');
    };

    if (isMobile) {
        return (
             <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {user?.role === 'candidate' && (
                    <NavLink
                        to="/profile"
                        className="block px-3 py-2 rounded-md text-base font-medium text-slate-500 hover:bg-slate-100"
                    >
                        My Profile
                    </NavLink>
                )}
                <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-500 hover:bg-slate-100"
                >
                    Logout
                </button>
             </div>
        )
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-slate-100"
            >
                <span className="text-sm font-medium text-slate-600 hidden sm:block">{user?.name}</span>
                <UserCircleIcon className="h-7 w-7 text-slate-500" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                    {user?.role === 'candidate' && (
                         <NavLink
                            to="/profile"
                            onClick={() => setIsOpen(false)}
                            className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        >
                            My Profile
                        </NavLink>
                    )}
                    <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
