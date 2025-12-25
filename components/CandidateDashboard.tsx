
import React, { useState } from 'react';
import { MOCK_POSITIONS } from '../constants';

interface CandidateDashboardProps {
  onStartInterview: (posId: string, resumeText?: string) => void;
}

const CandidateDashboard: React.FC<CandidateDashboardProps> = ({ onStartInterview }) => {
  const [selectedPos, setSelectedPos] = useState('');
  const [resumeName, setResumeName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setResumeName(file.name);
      // Simulate resume parsing
      setTimeout(() => {
        setIsUploading(false);
      }, 1500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile/Upload */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h3 className="text-lg font-bold mb-4">个人资料</h3>
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <p className="text-sm font-medium">候选人 001</p>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm text-gray-600">上传简历 (PDF)</span>
                <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors cursor-pointer relative">
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf" onChange={handleFileUpload} />
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-10 w-10 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <p className="text-xs text-gray-500">点击或拖拽上传</p>
                  </div>
                </div>
              </label>
              {resumeName && (
                <div className="flex items-center space-x-2 p-2 bg-green-50 rounded text-green-700 text-xs">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>{resumeName} {isUploading && '(解析中...)'}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Positions */}
        <div className="md:col-span-2 space-y-6">
          <h3 className="text-xl font-bold">热招岗位</h3>
          <div className="grid gap-4">
            {MOCK_POSITIONS.map(pos => (
              <div 
                key={pos.id}
                onClick={() => setSelectedPos(pos.id)}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedPos === pos.id ? 'border-blue-500 bg-blue-50' : 'bg-white border-transparent hover:border-gray-200'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-lg text-gray-800">{pos.title}</h4>
                    <p className="text-sm text-blue-600 font-medium">{pos.department}</p>
                  </div>
                  {selectedPos === pos.id && (
                    <div className="bg-blue-500 text-white p-1 rounded-full">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                </div>
                <p className="mt-3 text-sm text-gray-600 line-clamp-2">{pos.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {pos.requirements.map((req, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">{req}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="sticky bottom-6 mt-8">
            <button
              disabled={!selectedPos || isUploading}
              onClick={() => onStartInterview(selectedPos)}
              className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all ${!selectedPos ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#0070c0] hover:bg-[#005da1] text-white'}`}
            >
              {!selectedPos ? '请选择一个岗位开始面试' : '立即开始 AI 面试对话'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
