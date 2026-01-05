
import React, { useState } from 'react';
import { QuarterCategory } from '../types';
import { apiClient } from '../services/apiClient';

interface CategoriesPageProps {
  categories: QuarterCategory[];
  setCategories: React.Dispatch<React.SetStateAction<QuarterCategory[]>>;
}

const CategoriesPage: React.FC<CategoriesPageProps> = ({ categories, setCategories }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name_en: '', name_gu: '' });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      setIsSaving(true);
      const category = await apiClient.createCategory(formData);
      setCategories([...categories, category]);
      setIsModalOpen(false);
      setFormData({ name_en: '', name_gu: '' });
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await apiClient.deleteCategory(id);
      setCategories(categories.filter(cat => cat.id !== id));
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-right-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Quarter Categories</h3>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg">Add Category</button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h4 className="font-bold text-lg text-slate-800">{cat.name_en}</h4>
              <p className="text-indigo-600 font-medium">{cat.name_gu}</p>
            </div>
            <div className="flex gap-2">
               <button onClick={() => handleDelete(cat.id)} className="p-2 text-slate-400 hover:text-rose-500"><i className="fa-solid fa-trash"></i></button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Category</h3>
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

export default CategoriesPage;
