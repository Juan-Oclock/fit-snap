'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { 
  FiHome, FiActivity, FiList, FiClock, 
  FiBarChart2, FiUsers, FiSettings, FiLock, FiMenu, FiX, FiPlus, FiPlusCircle, FiLogOut
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigationGuard } from '@/contexts/NavigationGuardContext';
import { UserAvatar } from '@/components/ui/UserAvatar';

type NavItem = {
  path: string;
  label: string;
  icon: JSX.Element;
  mobileShow?: boolean; // For items that should appear in mobile bottom nav
  adminOnly?: boolean;
  onClick?: () => void;
  highlight?: boolean; // For highlighting important nav items
};

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const { guardedNavigate } = useNavigationGuard();
  
  const navItems: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: <FiHome size={20} />, mobileShow: true },
    { path: '/exercises', label: 'Exercises', icon: <FiActivity size={20} />, mobileShow: true },
    { path: '/workout', label: 'New Workout', icon: <FiPlusCircle size={24} />, mobileShow: true },
    { path: '/community', label: 'Community', icon: <FiUsers size={20} />, mobileShow: true },
    { path: '/progress', label: 'Progress', icon: <FiBarChart2 size={20} /> },
    { path: '/history', label: 'History', icon: <FiClock size={20} /> },
    { path: '/settings', label: 'Settings', icon: <FiSettings size={20} />, mobileShow: true },
    { path: '/admin', label: 'Admin', icon: <FiLock size={20} />, adminOnly: true },
    // Sign out option doesn't have a path since it's an action, not a route
    { path: '#', label: 'Sign Out', icon: <FiLogOut size={20} />, onClick: signOut }
  ];
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  // Filter admin routes if user is not admin
  const filteredNavItems = navItems.filter(item => !item.adminOnly || isAdmin);
  
  return (
    <>
      {/* Mobile Menu Button */}

      
      {/* Top Header Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3" style={{ backgroundColor: '#272727' }}>
        <div className="flex items-center space-x-3">
          <button 
            onClick={toggleSidebar} 
            className="p-2 rounded-md text-white hover:bg-gray-700 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          
          {/* User Avatar */}
          <UserAvatar 
            name={user?.user_metadata?.full_name}
            username={user?.user_metadata?.username}
            size="sm"
          />
        </div>
        
        {/* App Logo (Right side) */}
        <div className="flex items-center">
          <span className="font-bold text-lg" style={{ color: '#FFFC74' }}>FitSnap</span>
        </div>
      </div>
      
      {/* Sidebar for Mobile (Slide-in) */}
      <div 
        className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          w-64 bg-dark-800 overflow-y-auto transition duration-200 ease-in-out z-30 md:hidden`}
      >
        <div className="p-4 pt-16">
          <div className="flex items-center mb-8 pl-4">
            <span className="font-bold text-lg" style={{ color: '#FFFC74' }}>FitSnap</span>
          </div>
          <nav className="space-y-1">
            {filteredNavItems.map((item) => (
              item.onClick ? (
                <button
                  key={item.path}
                  onClick={() => {
                    item.onClick?.();
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors w-full text-left text-gray-300 hover:bg-dark-700"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ) : (
                <button
                  key={item.path}
                  onClick={() => {
                    guardedNavigate(item.path);
                    setIsOpen(false);
                  }}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors w-full text-left ${
                    pathname === item.path || pathname.startsWith(item.path + '/')
                      ? 'bg-yellow-500 text-black font-medium'
                      : 'text-gray-300 hover:bg-dark-700'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              )
            ))}
          </nav>
        </div>
      </div>
      
      {/* Sidebar for Desktop (Fixed) */}
      <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 md:z-10 bg-dark-800 border-r border-dark-700">
        <div className="p-4">
          <div className="flex items-center mb-8 pl-4">
            <span className="font-bold text-lg" style={{ color: '#FFFC74' }}>FitSnap</span>
          </div>
          <nav className="space-y-1">
            {filteredNavItems.map((item) => (
              item.onClick ? (
                <button
                  key={item.path}
                  onClick={item.onClick}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors w-full text-left text-gray-300 hover:bg-dark-700"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ) : (
                <button
                  key={item.path}
                  onClick={() => guardedNavigate(item.path)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors w-full text-left ${
                    pathname === item.path || pathname.startsWith(item.path + '/')
                      ? 'bg-yellow-500 text-black font-medium'
                      : 'text-gray-300 hover:bg-dark-700'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              )
            ))}
          </nav>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-dark-700 flex justify-around py-2" style={{ backgroundColor: '#272727' }}>
        {filteredNavItems
          .filter(item => item.mobileShow)
          .map((item) => (
            item.onClick ? (
              <button
                key={item.path}
                onClick={item.onClick}
                className="flex flex-col items-center justify-center p-2 text-gray-400"
              >
                <span>{item.icon}</span>
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            ) : (
              <button
                key={item.path}
                onClick={() => guardedNavigate(item.path)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
                  pathname === item.path || pathname.startsWith(item.path + '/')
                    ? item.highlight
                      ? 'text-black bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg font-bold'
                      : 'text-yellow-500'
                    : item.highlight
                      ? 'text-yellow-400 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 font-semibold'
                      : 'text-gray-400'
                }`}
              >
                <span>{item.icon}</span>
                <span className="text-xs mt-1">{item.label === 'New Workout' ? 'Workout' : item.label}</span>
              </button>
            )
          ))}
      </div>
    </>
  );
}
