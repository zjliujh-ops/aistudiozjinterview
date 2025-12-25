
import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { COLORS } from '../constants';
import { generateThemeBackground } from '../services/geminiService';

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBg = async () => {
      const img = await generateThemeBackground();
      setBgImage(img);
    };
    fetchBg();
  }, []);

  const handleLogin = (role: UserRole) => {
    setLoading(true);
    // Simulate auth
    setTimeout(() => {
      onLogin(role);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-900">
      {/* Dynamic Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-1000"
        style={{ 
          backgroundImage: bgImage ? `url(${bgImage})` : 'none',
          opacity: bgImage ? 0.4 : 0.1
        }}
      />
      {!bgImage && <div className={`absolute inset-0 z-0 bg-gradient-to-br ${COLORS.GRADIENT_START} ${COLORS.GRADIENT_END} opacity-20`} />}

      <div className="z-10 w-full max-w-md p-8 glass-morphism rounded-2xl shadow-2xl mx-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#0070c0] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">湛江移动公司面试系统</h2>
          <p className="text-gray-600 mt-2">欢迎使用智慧移动 AI 面试平台</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleLogin(UserRole.CANDIDATE)}
            disabled={loading}
            className="w-full py-4 bg-[#0070c0] hover:bg-[#005da1] text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <span>我来应聘 (候选人入口)</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </button>

          <button
            onClick={() => handleLogin(UserRole.INTERVIEWER)}
            disabled={loading}
            className="w-full py-4 bg-white border-2 border-[#0070c0] text-[#0070c0] hover:bg-blue-50 rounded-xl font-bold shadow-sm transition-all flex items-center justify-center space-x-2"
          >
            <span>招聘管控 (面试官入口)</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </button>
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>© 2024 中国移动广东公司湛江分公司 版权所有</p>
          <p className="mt-1 font-mono">Power by Gemini 3.0 Pro Image Preview</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
