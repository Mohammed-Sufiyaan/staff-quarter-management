
import React, { useState } from 'react';
import { AllocationRequest, QuarterCategory, RequestStatus, User, UserRole } from '../types';
import { apiClient } from '../services/apiClient';

interface RequestsPageProps {
  requests: AllocationRequest[];
  categories: QuarterCategory[];
  setRequests: React.Dispatch<React.SetStateAction<AllocationRequest[]>>;
  userRole: UserRole;
  currentUser: User;
}

const RequestsPage: React.FC<RequestsPageProps> = ({ requests, categories, setRequests, userRole, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    categoryId: categories[0]?.id || '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    remarks: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      setIsSubmitting(true);
      const payload = {
        categoryId: formData.categoryId,
        priority: formData.priority,
        remarks: formData.remarks,
      };
      const created = await apiClient.createAllocationRequest(payload);
      setRequests(prev => [created, ...prev]);
      setIsModalOpen(false);
      setFormData({ categoryId: categories[0]?.id || '', priority: 'MEDIUM', remarks: '' });
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (id: string, newStatus: RequestStatus) => {
    try {
      const updated = await apiClient.updateAllocationRequest(id, { status: newStatus });
      setRequests(prev => prev.map(r => r.id === id ? updated : r));
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">Application Requests</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <i className="fa-solid fa-file-circle-plus"></i>
          New Request
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Req #</th>
                <th className="px-6 py-4">Staff Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map(req => (
                <tr key={req.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-mono text-indigo-600 font-bold">{req.requestNumber}</td>
                  <td className="px-6 py-4">{req.userName}</td>
                  <td className="px-6 py-4">
                    {categories.find(c => c.id === req.categoryId)?.name_en}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                      req.priority === 'HIGH' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                      req.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}>
                      {req.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`flex items-center gap-2 text-sm ${
                       req.status === RequestStatus.PENDING ? 'text-amber-600' :
                       req.status === RequestStatus.APPROVED ? 'text-indigo-600' :
                       req.status === RequestStatus.ALLOCATED ? 'text-emerald-600' : 'text-rose-600'
                     }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          req.status === RequestStatus.PENDING ? 'bg-amber-400' :
                          req.status === RequestStatus.APPROVED ? 'bg-indigo-400' :
                          req.status === RequestStatus.ALLOCATED ? 'bg-emerald-400' : 'bg-rose-400'
                        }`}></span>
                        {req.status}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {new Date(req.requestedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {userRole === UserRole.ADMIN && req.status === RequestStatus.PENDING && (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => updateStatus(req.id, RequestStatus.APPROVED)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Approve"
                        >
                          <i className="fa-solid fa-check"></i>
                        </button>
                        <button 
                          onClick={() => updateStatus(req.id, RequestStatus.REJECTED)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Reject"
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b flex justify-between">
              <h3 className="text-xl font-bold">New Allocation Request</h3>
              <button onClick={() => setIsModalOpen(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2 rounded-lg text-sm">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Quarter Category</label>
                <select 
                  className="w-full p-2 border border-slate-200 rounded-lg"
                  value={formData.categoryId}
                  onChange={e => setFormData({...formData, categoryId: e.target.value})}
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name_en}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select 
                  className="w-full p-2 border border-slate-200 rounded-lg"
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value as any})}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Remarks</label>
                <textarea 
                  className="w-full p-2 border border-slate-200 rounded-lg"
                  placeholder="Reason for allocation request..."
                  value={formData.remarks}
                  onChange={e => setFormData({...formData, remarks: e.target.value})}
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-500">Cancel</button>
                 <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300">
                   {isSubmitting ? 'Submitting...' : 'Submit Request'}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestsPage;
