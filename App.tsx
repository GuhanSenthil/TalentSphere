

import React, { useState } from 'react';
import { HashRouter, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import JobList from './components/JobList';
import ApplyJob from './components/ApplyJob';
import CreateJob from './components/CreateJob';
import ViewApplications from './components/ViewApplications';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import ProfilePage from './components/ProfilePage';
import EditProfilePage from './components/EditProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BriefcaseIcon, DocumentPlusIcon, EyeIcon, HomeIcon, UserGroupIcon, Bars3Icon, XMarkIcon, DocumentTextIcon, DocumentMagnifyingGlassIcon } from './components/IconComponents';
import Dashboard from './components/Dashboard';
import JobDetail from './components/JobDetail';
import MyApplications from './components/MyApplications';
import ApplicationDetail from './components/ApplicationDetail';
import UserMenu from './components/UserMenu';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import Feed from './components/Feed';
import NotificationsMenu from './components/NotificationsMenu';
import PrintableResume from './components/PrintableResume';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const NavLinks: React.FC<{isMobile?: boolean}> = ({ isMobile = false }) => {
    const baseClasses = isMobile ? 'block px-3 py-2 rounded-md text-base font-medium' : 'flex items-center px-3 py-2 rounded-md text-sm font-medium';
    const activeClasses = 'bg-indigo-50 text-indigo-700';
    const inactiveClasses = 'text-slate-500 hover:bg-slate-100';

    const getLinkClass = ({ isActive }: { isActive: boolean }) => 
        `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;

    return (
        <>
            {user?.role === 'candidate' && (
                <>
                    <NavLink to="/" className={getLinkClass} onClick={() => setIsMenuOpen(false)}>
                        <BriefcaseIcon className="h-5 w-5 mr-2" /> All Jobs
                    </NavLink>
                    <NavLink to="/feed" className={getLinkClass} onClick={() => setIsMenuOpen(false)}>
                        <UserGroupIcon className="h-5 w-5 mr-2" /> Community Feed
                    </NavLink>
                    <NavLink to="/my-applications" className={getLinkClass} onClick={() => setIsMenuOpen(false)}>
                        <DocumentTextIcon className="h-5 w-5 mr-2" /> My Applications
                    </NavLink>
                    <NavLink to="/resume-analyzer" className={getLinkClass} onClick={() => setIsMenuOpen(false)}>
                        <DocumentMagnifyingGlassIcon className="h-5 w-5 mr-2" /> Resume Analyzer
                    </NavLink>
                </>
            )}
            {user?.role === 'hr' && (
                <>
                    <NavLink to="/dashboard" className={getLinkClass} onClick={() => setIsMenuOpen(false)}>
                        <HomeIcon className="h-5 w-5 mr-2" /> Dashboard
                    </NavLink>
                    <NavLink to="/create-job" className={getLinkClass} onClick={() => setIsMenuOpen(false)}>
                        <DocumentPlusIcon className="h-5 w-5 mr-2" /> Post Job
                    </NavLink>
                    <NavLink to="/applications" className={getLinkClass} onClick={() => setIsMenuOpen(false)}>
                        <EyeIcon className="h-5 w-5 mr-2" /> Applications
                    </NavLink>
                </>
            )}
        </>
    );
  };
  
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const isPrintPage = location.pathname === '/resume/print';

  if (isAuthPage) {
      return (
           <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
           </Routes>
      )
  }

  if (isPrintPage) {
    return (
        <Routes>
            <Route path="/resume/print" element={<PrintableResume />} />
        </Routes>
    )
  }


  return (
    <div className="min-h-screen font-sans text-slate-800 bg-slate-50">
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-20">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <NavLink to={user ? (user.role === 'hr' ? '/dashboard' : '/') : '/login'} className="flex items-center space-x-2">
                <BriefcaseIcon className="h-8 w-8 text-indigo-600" />
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-slate-800 leading-tight">TalentSphere</span>
                  {user?.role === 'hr' && (
                    <span className="text-xs text-indigo-700 font-semibold leading-tight">{user.companyName}</span>
                  )}
                </div>
              </NavLink>
            </div>
            <div className="hidden md:flex items-center space-x-4">
                <NavLinks />
                {user && (
                    <div className="flex items-center space-x-2">
                        <NotificationsMenu />
                        <UserMenu />
                    </div>
                )}
            </div>
            <div className="-mr-2 flex md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                {isMenuOpen ? <XMarkIcon className="block h-6 w-6" /> : <Bars3Icon className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </nav>
        {isMenuOpen && (
            <div className="md:hidden">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    <NavLinks isMobile={true} />
                    {user && <div className="border-t border-slate-200 mt-2 pt-2"><UserMenu isMobile={true}/></div>}
                </div>
            </div>
        )}
      </header>
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/" element={<ProtectedRoute allowedRoles={['hr', 'candidate']}><JobList /></ProtectedRoute>} />
          <Route path="/job/:jobId" element={<ProtectedRoute allowedRoles={['hr', 'candidate']}><JobDetail /></ProtectedRoute>} />
          <Route path="/my-applications" element={<ProtectedRoute allowedRoles={['candidate']}><MyApplications /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute allowedRoles={['candidate']}><ProfilePage /></ProtectedRoute>} />
          <Route path="/profile/edit" element={<ProtectedRoute allowedRoles={['candidate']}><EditProfilePage /></ProtectedRoute>} />
          <Route path="/resume-analyzer" element={<ProtectedRoute allowedRoles={['candidate']}><ResumeAnalyzer /></ProtectedRoute>} />
          <Route path="/feed" element={<ProtectedRoute allowedRoles={['candidate']}><Feed /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['hr']}><Dashboard /></ProtectedRoute>} />
          <Route path="/apply/:jobId" element={<ProtectedRoute allowedRoles={['candidate']}><ApplyJob /></ProtectedRoute>} />
          <Route path="/create-job" element={<ProtectedRoute allowedRoles={['hr']}><CreateJob /></ProtectedRoute>} />
          <Route path="/applications" element={<ProtectedRoute allowedRoles={['hr']}><ViewApplications /></ProtectedRoute>} />
          <Route path="/application/:appId" element={<ProtectedRoute allowedRoles={['hr']}><ApplicationDetail /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;