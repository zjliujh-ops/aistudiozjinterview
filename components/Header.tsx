
import React from 'react';
import { COLORS } from '../constants';

interface HeaderProps {
  onLogout: () => void;
  userType?: string;
}

const Header: React.FC<HeaderProps> = ({ onLogout, userType }) => {
  return (
    <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-[#0070c0] flex items-center justify-center text-white font-bold">M</div>
          <div>
            <h1 className="text-lg font-bold text-gray-800 leading-none">湛江移动</h1>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Interview System</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          {userType && (
            <span className="hidden md:inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
              {userType === 'CANDIDATE' ? '候选人模式' : '面试官模式'}
            </span>
          )}
          <button 
            onClick={onLogout}
            className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
          >
            退出系统
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
