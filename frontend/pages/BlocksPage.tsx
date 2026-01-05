
import React, { useState } from 'react';
import { QuarterBlock } from '../types';
import { apiClient } from '../services/apiClient';

interface BlocksPageProps {
  blocks: QuarterBlock[];
  setBlocks: React.Dispatch<React.SetStateAction<QuarterBlock[]>>;
}

const BlocksPage: React.FC<BlocksPageProps> = ({ blocks, setBlocks }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name_en: '', name_gu: '' });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      setIsSaving(true);
      const block = await apiClient.createBlock(formData);
      setBlocks([...blocks, block]);
      setIsModalOpen(false);
      setFormData({ name_en: '', name_gu: '' });
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-right-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Quarter Blocks</h3>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg">Add Block</button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {blocks.map(block => (
          <div key={block.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-3">
              <i className="fa-solid fa-cube"></i>
            </div>
            <h4 className="font-bold text-slate-800">{block.name_en}</h4>
            <p className="text-sm text-slate-500">{block.name_gu}</p>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Block</h3>
            <div className="space-y-4">
               {formError && (
                 <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg text-sm">
                   {formError}
                 </div>
               )}
               <div>
                 <label className="block text-sm font-medium mb-1">Name (English)</label>
                 <input type="text" required className="w-full p-2 border border-slate-200 rounded-lg" value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} />
               </div>
               <div>
                 <label className="block text-sm font-medium mb-1">Name (Gujarati)</label>
                 <input type="text" required className="w-full p-2 border border-slate-200 rounded-lg" value={formData.name_gu} onChange={e => setFormData({...formData, name_gu: e.target.value})} />
               </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
               <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2">Cancel</button>
               <button type="submit" disabled={isSaving} className="px-6 py-2 bg-indigo-600 text-white rounded-lg disabled:bg-indigo-300">
                 {isSaving ? 'Saving...' : 'Save'}
               </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BlocksPage;
