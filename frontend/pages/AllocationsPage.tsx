
import React, { useState } from 'react';
import { Allocation, Quarter, AllocationRequest, RequestStatus, QuarterStatus } from '../types';
import { apiClient } from '../services/apiClient';

interface AllocationsPageProps {
  allocations: Allocation[];
  setAllocations: React.Dispatch<React.SetStateAction<Allocation[]>>;
  quarters: Quarter[];
  requests: AllocationRequest[];
  setQuarters: React.Dispatch<React.SetStateAction<Quarter[]>>;
  setRequests: React.Dispatch<React.SetStateAction<AllocationRequest[]>>;
}

const AllocationsPage: React.FC<AllocationsPageProps> = ({ allocations, setAllocations, quarters, requests, setQuarters, setRequests }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({ requestId: '', quarterId: '' });

  // Filter approved requests and vacant quarters
  const eligibleRequests = requests.filter(r => r.status === RequestStatus.APPROVED);
  const vacantQuarters = quarters.filter(q => q.status === QuarterStatus.VACANT);

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.requestId || !formData.quarterId) return;

    try {
      setIsProcessing(true);
      const allocation = await apiClient.createAllocation({
        requestId: formData.requestId,
        quarterId: formData.quarterId,
      });

      setAllocations([...allocations, allocation]);
      setQuarters(prev => prev.map(q => q.id === allocation.quarterId ? { ...q, status: QuarterStatus.OCCUPIED } : q));
      setRequests(prev => prev.map(r => r.id === allocation.requestId ? { ...r, status: RequestStatus.ALLOCATED } : r));

      setIsModalOpen(false);
      setFormData({ requestId: '', quarterId: '' });
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="animate-in fade-in">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Allocation History</h3>
        <button 
          onClick={() => setIsModalOpen(true)} 
          disabled={eligibleRequests.length === 0 || vacantQuarters.length === 0}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            eligibleRequests.length === 0 || vacantQuarters.length === 0 
            ? 'bg-slate-200 text-slate-500 cursor-not-allowed' 
            : 'bg-indigo-600 text-white'
          }`}
        >
          <i className="fa-solid fa-key"></i>
          Process Allocation
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Allocation ID</th>
              <th className="px-6 py-4">Quarter</th>
              <th className="px-6 py-4">Staff</th>
              <th className="px-6 py-4">Allocated Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {allocations.map(al => {
              const q = quarters.find(x => x.id === al.quarterId);
              const r = requests.find(x => x.id === al.requestId);
              return (
                <tr key={al.id}>
                  <td className="px-6 py-4 font-mono text-indigo-600 text-xs font-bold">{al.id}</td>
                  <td className="px-6 py-4 font-medium">{q?.name_en}</td>
                  <td className="px-6 py-4">{r?.userName}</td>
                  <td className="px-6 py-4 text-slate-500">{new Date(al.allocatedAt).toLocaleDateString()}</td>
                </tr>
              );
            })}
            {allocations.length === 0 && (
              <tr><td colSpan={4} className="text-center py-8 text-slate-400">No allocations processed yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <form onSubmit={handleAllocate} className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">New Allocation</h3>
            <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium mb-1">Approved Request</label>
                 <select 
                    required 
                    className="w-full p-2 border border-slate-200 rounded-lg" 
                    value={formData.requestId} 
                    onChange={e => setFormData({...formData, requestId: e.target.value})}
                 >
                    <option value="">Select Request...</option>
                    {eligibleRequests.map(r => (
                      <option key={r.id} value={r.id}>{r.requestNumber} - {r.userName}</option>
                    ))}
                 </select>
               </div>
               <div>
                 <label className="block text-sm font-medium mb-1">Vacant Quarter</label>
                 <select 
                    required 
                    className="w-full p-2 border border-slate-200 rounded-lg" 
                    value={formData.quarterId} 
                    onChange={e => setFormData({...formData, quarterId: e.target.value})}
                 >
                    <option value="">Select Quarter...</option>
                    {vacantQuarters.map(q => (
                      <option key={q.id} value={q.id}>{q.name_en} ({q.status})</option>
                    ))}
                 </select>
               </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
               <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-500">Cancel</button>
               <button type="submit" disabled={isProcessing} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow-lg disabled:bg-indigo-300">
                 {isProcessing ? 'Processing...' : 'Confirm Allocation'}
               </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AllocationsPage;
