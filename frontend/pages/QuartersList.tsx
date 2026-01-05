
import React, { useState } from 'react';
import { Quarter, QuarterCategory, QuarterBlock, QuarterStatus, UserRole } from '../types';
import { apiClient } from '../services/apiClient';

interface QuartersListProps {
  quarters: Quarter[];
  categories: QuarterCategory[];
  blocks: QuarterBlock[];
  setQuarters: React.Dispatch<React.SetStateAction<Quarter[]>>;
  userRole: UserRole;
}

const QuartersList: React.FC<QuartersListProps> = ({ quarters, categories, blocks, setQuarters, userRole }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuarter, setEditingQuarter] = useState<Quarter | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Quarter>>({
    name_en: '', name_gu: '', address_en: '', address_gu: '',
    categoryId: '', blockId: '', status: QuarterStatus.VACANT,
    contactPerson: '', contactPhone: ''
  });

  const handleOpenModal = (q?: Quarter) => {
    if (q) {
      setEditingQuarter(q);
      setFormData(q);
    } else {
      setEditingQuarter(null);
      setFormData({
        name_en: '', name_gu: '', address_en: '', address_gu: '',
        categoryId: categories[0]?.id || '', blockId: blocks[0]?.id || '', status: QuarterStatus.VACANT,
        contactPerson: '', contactPhone: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setIsSaving(true);
      if (editingQuarter) {
        const updated = await apiClient.updateQuarter(editingQuarter.id, formData as Quarter);
        setQuarters(prev => prev.map(q => q.id === updated.id ? updated : q));
      } else {
        const created = await apiClient.createQuarter(formData as Quarter);
        setQuarters(prev => [...prev, created]);
      }
      setIsModalOpen(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Deactivate this quarter?')) return;
    try {
      await apiClient.deactivateQuarter(id);
      setQuarters(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const filteredQuarters = quarters.filter(q => 
    q.name_en.toLowerCase().includes(searchTerm.toLowerCase()) || 
    q.name_gu.includes(searchTerm)
  );

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            type="text"
            placeholder="Search by name (English or Gujarati)..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {userRole !== UserRole.VIEWER && (
          <button
            onClick={() => handleOpenModal()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <i className="fa-solid fa-plus text-sm"></i>
            Add Quarter
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Quarter Name (EN/GU)</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Block</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuarters.map(q => (
                <tr key={q.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{q.name_en}</div>
                    <div className="text-xs text-slate-500 font-medium">{q.name_gu}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {categories.find(c => c.id === q.categoryId)?.name_en || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {blocks.find(b => b.id === q.blockId)?.name_en || 'Unknown'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      q.status === QuarterStatus.VACANT ? 'bg-emerald-100 text-emerald-700' :
                      q.status === QuarterStatus.OCCUPIED ? 'bg-indigo-100 text-indigo-700' :
                      q.status === QuarterStatus.MAINTENANCE ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleOpenModal(q)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      {userRole === UserRole.ADMIN && (
                        <button onClick={() => handleDeactivate(q.id)} className="text-slate-400 hover:text-rose-600 transition-colors">
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">
                {editingQuarter ? 'Edit Quarter' : 'Add New Quarter'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name (English)</label>
                  <input
                    type="text" required
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={formData.name_en}
                    onChange={e => setFormData({ ...formData, name_en: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name (Gujarati)</label>
                  <input
                    type="text" required
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={formData.name_gu}
                    onChange={e => setFormData({ ...formData, name_gu: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address (English)</label>
                  <textarea
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={formData.address_en}
                    onChange={e => setFormData({ ...formData, address_en: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={formData.categoryId}
                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name_en}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Block</label>
                  <select
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={formData.blockId}
                    onChange={e => setFormData({ ...formData, blockId: e.target.value })}
                  >
                    {blocks.map(b => <option key={b.id} value={b.id}>{b.name_en}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as QuarterStatus })}
                  >
                    {Object.values(QuarterStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={formData.contactPhone}
                    onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-md active:scale-95"
                >
                  {isSaving ? 'Saving...' : 'Save Quarter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuartersList;
