
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface LayoutProps {
  user: User | null;
  onLogout: () => void;
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children, activeTab, setActiveTab }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line', roles: [UserRole.ADMIN, UserRole.STAFF, UserRole.VIEWER] },
    { id: 'quarters', label: 'Quarters', icon: 'fa-building', roles: [UserRole.ADMIN, UserRole.STAFF, UserRole.VIEWER] },
    { id: 'requests', label: 'Requests', icon: 'fa-file-invoice', roles: [UserRole.ADMIN, UserRole.STAFF] },
    { id: 'allocations', label: 'Allocations', icon: 'fa-key', roles: [UserRole.ADMIN, UserRole.STAFF, UserRole.VIEWER] },
    { id: 'categories', label: 'Categories', icon: 'fa-tags', roles: [UserRole.ADMIN, UserRole.STAFF] },
    { id: 'blocks', label: 'Blocks', icon: 'fa-th-large', roles: [UserRole.ADMIN, UserRole.STAFF] },
    { id: 'users', label: 'User Management', icon: 'fa-users', roles: [UserRole.ADMIN] },
    { id: 'reports', label: 'Reports', icon: 'fa-file-alt', roles: [UserRole.ADMIN, UserRole.STAFF] },
  ];

  const filteredMenuItems = menuItems.filter(item => user && item.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-20`}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && <span className="text-xl font-bold text-white tracking-tight">StaffQuarter</span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:text-white">
            <i className={`fa-solid ${isSidebarOpen ? 'fa-chevron-left' : 'fa-bars'}`}></i>
          </button>
        </div>

        <nav className="flex-1 mt-4">
          {filteredMenuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center p-4 transition-colors ${activeTab === item.id ? 'bg-indigo-600 text-white border-r-4 border-indigo-300' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <div className="w-8 flex justify-center">
                <i className={`fa-solid ${item.icon} text-lg`}></i>
              </div>
              {isSidebarOpen && <span className="ml-4 font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center p-4 text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
          >
            <div className="w-8 flex justify-center">
              <i className="fa-solid fa-right-from-bracket"></i>
            </div>
            {isSidebarOpen && <span className="ml-4 font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800">
            {menuItems.find(m => m.id === activeTab)?.label}
          </h2>
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
               <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
               <p className="text-xs text-slate-500 uppercase tracking-wider">{user?.role}</p>
             </div>
             <img src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`} className="w-10 h-10 rounded-full border-2 border-indigo-100 shadow-sm" alt="Avatar" />
          </div>
        </header>

        {/* Page Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
