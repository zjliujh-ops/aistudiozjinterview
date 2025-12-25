
import React, { useState } from 'react';
import { MOCK_POSITIONS } from '../constants';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

interface InterviewerDashboardProps {
  // Pass mock data or handlers
}

const InterviewerDashboard: React.FC<InterviewerDashboardProps> = () => {
  const [activeTab, setActiveTab] = useState<'positions' | 'interviews'>('positions');
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  // Mock candidates data
  const candidates = [
    { id: 'c1', name: '王小明', position: '5G 网络优化工程师', status: '已评估', score: 88, date: '2024-03-20' },
    { id: 'c2', name: '李梅', position: '数字化转型客户经理', status: '待面试', score: 0, date: '2024-03-21' },
    { id: 'c3', name: '张伟', position: '5G 网络优化工程师', status: '已面试', score: 72, date: '2024-03-22' },
  ];

  const handleShowReport = (c: any) => {
    setSelectedReport(c);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 space-y-2">
          <button 
            onClick={() => setActiveTab('positions')}
            className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${activeTab === 'positions' ? 'bg-[#0070c0] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" /></svg>
            招聘岗位录入
          </button>
          <button 
            onClick={() => setActiveTab('interviews')}
            className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${activeTab === 'interviews' ? 'bg-[#0070c0] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            面试进度监控
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white rounded-2xl border shadow-sm p-6 overflow-hidden">
          {activeTab === 'positions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">已录入岗位</h3>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                  + 新增招聘岗位
                </button>
              </div>
              <div className="grid gap-4">
                {MOCK_POSITIONS.map(p => (
                  <div key={p.id} className="p-4 border rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-bold text-gray-800">{p.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{p.department}</p>
                      </div>
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full h-fit">招募中</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'interviews' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold">面试候选人概览</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 font-medium">
                    <tr>
                      <th className="px-4 py-3">候选人</th>
                      <th className="px-4 py-3">应聘岗位</th>
                      <th className="px-4 py-3">状态</th>
                      <th className="px-4 py-3">AI 评分</th>
                      <th className="px-4 py-3">面试日期</th>
                      <th className="px-4 py-3 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {candidates.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 font-medium text-gray-800">{c.name}</td>
                        <td className="px-4 py-4 text-gray-600">{c.position}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${c.status === '已评估' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-mono font-bold text-blue-600">{c.score > 0 ? c.score : '--'}</td>
                        <td className="px-4 py-4 text-gray-500">{c.date}</td>
                        <td className="px-4 py-4 text-right">
                          <button 
                            onClick={() => handleShowReport(c)}
                            className="text-blue-600 hover:underline font-medium"
                          >
                            查看详情报告
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl relative">
            <button 
              onClick={() => setSelectedReport(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 text-2xl font-bold">
                {selectedReport.name[0]}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedReport.name} 的面试评估报告</h2>
                <p className="text-gray-500">{selectedReport.position} | 评估日期: {selectedReport.date}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Score Chart */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h4 className="font-bold mb-4 text-gray-700">岗位匹配度分析</h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: '专业能力', score: 85 },
                      { name: '沟通能力', score: 92 },
                      { name: '移动业务理解', score: 78 },
                      { name: '学习潜力', score: 90 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 100]} hide />
                      <Tooltip />
                      <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={40}>
                        {[0,1,2,3].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 1 ? '#0070c0' : '#82ca9d'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Assessment Text */}
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <h5 className="font-bold text-blue-800 text-sm mb-1">综合评分</h5>
                  <div className="text-4xl font-black text-blue-600">{selectedReport.score}</div>
                </div>
                <div>
                  <h5 className="font-bold text-gray-700 text-sm mb-2">AI 评价总结</h5>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    候选人在 {selectedReport.position} 面试中展现了极高的专业素养，特别是在对湛江地区网络现状的分析上见解独到。沟通表达清晰，逻辑严密。建议作为重点考察对象进入二面。
                  </p>
                </div>
                <div>
                  <h5 className="font-bold text-gray-700 text-sm mb-2">优势亮点</h5>
                  <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                    <li>扎实的通信工程背景</li>
                    <li>对 5G NR 协议有深刻理解</li>
                    <li>优秀的抗压能力与沟通技巧</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="font-bold mb-4 text-gray-700">面试录音文本片段 (多轮对话回顾)</h4>
              <div className="bg-gray-50 p-4 rounded-xl space-y-3 text-xs">
                <div className="flex gap-2"><span className="font-bold text-blue-600">面试官:</span> <span>谈谈你对湛江移动 5G 网络覆盖现状的看法？</span></div>
                <div className="flex gap-2"><span className="font-bold text-gray-700">候选人:</span> <span>目前湛江市区及主要乡镇已基本实现 5G 连续覆盖，但在海岛和工业园区等复杂场景下仍需精细化优化...</span></div>
                <div className="flex gap-2"><span className="font-bold text-blue-600">面试官:</span> <span>针对你提到的工业园区，你建议采用什么样的天线挂高策略？</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewerDashboard;
