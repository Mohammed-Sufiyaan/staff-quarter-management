
import React, { useState, useEffect } from 'react';
import { Quarter, AllocationRequest, QuarterStatus, RequestStatus } from '../types';
import { GeminiService } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
  quarters: Quarter[];
  requests: AllocationRequest[];
}

const Dashboard: React.FC<DashboardProps> = ({ quarters, requests }) => {
  const [aiSummary, setAiSummary] = useState<string>('Analyzing data with Gemini AI...');
  const gemini = new GeminiService();

  useEffect(() => {
    const getAnalysis = async () => {
      const summary = await gemini.analyzeAllocationTrends(quarters, requests);
      setAiSummary(summary || "Analysis unavailable.");
    };
    getAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quarters, requests]);

  const stats = [
    { label: 'Total Quarters', value: quarters.length, icon: 'fa-building', color: 'indigo' },
    { label: 'Occupied', value: quarters.filter(q => q.status === QuarterStatus.OCCUPIED).length, icon: 'fa-user-check', color: 'emerald' },
    { label: 'Vacant', value: quarters.filter(q => q.status === QuarterStatus.VACANT).length, icon: 'fa-door-open', color: 'amber' },
    { label: 'Pending Requests', value: requests.filter(r => r.status === RequestStatus.PENDING).length, icon: 'fa-clock', color: 'rose' },
  ];

  const occupancyData = [
    { name: 'Occupied', value: quarters.filter(q => q.status === QuarterStatus.OCCUPIED).length },
    { name: 'Vacant', value: quarters.filter(q => q.status === QuarterStatus.VACANT).length },
    { name: 'Maintenance', value: quarters.filter(q => q.status === QuarterStatus.MAINTENANCE).length },
  ];

  const COLORS = ['#10b981', '#f59e0b', '#6366f1'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600`}>
              <i className={`fa-solid ${stat.icon} text-xl`}></i>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-6">Occupancy Status</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={occupancyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {occupancyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insight Sidebar */}
        <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-xl flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <h3 className="font-semibold text-lg">AI Smart Insights</h3>
          </div>
          <div className="flex-1 overflow-y-auto prose prose-invert prose-sm">
            <p className="text-indigo-100 leading-relaxed italic">
              {aiSummary}
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-indigo-800 text-xs text-indigo-300">
            Powered by Gemini 3 Flash
          </div>
        </div>
      </div>

      {/* Recent Requests Table */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold mb-4">Recent Allocation Requests</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 font-semibold">Request ID</th>
                <th className="px-4 py-3 font-semibold">Staff Name</th>
                <th className="px-4 py-3 font-semibold">Priority</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.slice(0, 5).map(req => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-indigo-600">{req.requestNumber}</td>
                  <td className="px-4 py-3">{req.userName}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      req.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' :
                      req.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {req.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${req.status === 'PENDING' ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                      <span className="text-sm">{req.status}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-sm">
                    {new Date(req.requestedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400 italic">No recent requests</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
