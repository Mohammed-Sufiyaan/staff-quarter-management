
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { apiClient } from '../services/apiClient';

interface UsersPageProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const UsersPage: React.FC<UsersPageProps> = ({ users, setUsers }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: UserRole.VIEWER, phone: '' });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      setIsSaving(true);
      const newUser = await apiClient.createUser({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone,
      });
      setUsers([...users, newUser]);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', role: UserRole.VIEWER, phone: '' });
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">User Management</h3>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg">Create User</button>
      </div>
      
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">
                     {user.name.charAt(0)}
                   </div>
                   <span className="font-semibold">{user.name}</span>
                </td>
                <td className="px-6 py-4 text-slate-600">{user.email}</td>
                <td className="px-6 py-4">
                   <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                     user.role === UserRole.ADMIN ? 'bg-indigo-100 text-indigo-700' :
                     user.role === UserRole.STAFF ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                   }`}>
                     {user.role}
                   </span>
                </td>
                <td className="px-6 py-4 text-right">
                   <button className="text-slate-400 hover:text-indigo-600"><i className="fa-solid fa-user-pen"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Create New User</h3>
            <div className="space-y-4">
               {formError && (
                 <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg text-sm">
                   {formError}
                 </div>
               )}
               <div>
                 <label className="block text-sm font-medium mb-1">Full Name</label>
                 <input type="text" required className="w-full p-2 border border-slate-200 rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
               </div>
               <div>
                 <label className="block text-sm font-medium mb-1">Email</label>
                 <input type="email" required className="w-full p-2 border border-slate-200 rounded-lg" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
               </div>
               <div>
                 <label className="block text-sm font-medium mb-1">Phone</label>
                 <input type="tel" className="w-full p-2 border border-slate-200 rounded-lg" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
               </div>
               <div>
                 <label className="block text-sm font-medium mb-1">Role</label>
                 <select className="w-full p-2 border border-slate-200 rounded-lg" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}>
                    <option value={UserRole.ADMIN}>Admin</option>
                    <option value={UserRole.STAFF}>Staff / Operator</option>
                    <option value={UserRole.VIEWER}>Viewer (Read-only)</option>
                 </select>
               </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
               <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2">Cancel</button>
               <button type="submit" disabled={isSaving} className="px-6 py-2 bg-indigo-600 text-white rounded-lg disabled:bg-indigo-300">
                 {isSaving ? 'Creating...' : 'Create'}
               </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
