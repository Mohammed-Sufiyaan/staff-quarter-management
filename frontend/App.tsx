
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import { User, UserRole, Quarter, QuarterCategory, QuarterBlock, AllocationRequest, RequestStatus, QuarterStatus, Allocation } from './types';
import Dashboard from './pages/Dashboard';
import QuartersList from './pages/QuartersList';
import RequestsPage from './pages/RequestsPage';
import CategoriesPage from './pages/CategoriesPage';
import BlocksPage from './pages/BlocksPage';
import UsersPage from './pages/UsersPage';
import AllocationsPage from './pages/AllocationsPage';
import LoginPage from './pages/LoginPage';
import { apiClient } from './services/apiClient';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const [quarters, setQuarters] = useState<Quarter[]>([]);
  const [categories, setCategories] = useState<QuarterCategory[]>([]);
  const [blocks, setBlocks] = useState<QuarterBlock[]>([]);
  const [requests, setRequests] = useState<AllocationRequest[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const bootstrapData = useCallback(async (userOverride?: User) => {
    try {
      setIsLoading(true);
      const user = userOverride ?? await apiClient.fetchCurrentUser();
      const data = await apiClient.bootstrap(user);

      setCurrentUser(user);
      setQuarters(data.quarters);
      setCategories(data.categories);
      setBlocks(data.blocks);
      setRequests(data.requests);
      setAllocations(data.allocations);
      setUsers(user.role === UserRole.ADMIN ? data.users : []);
      setAuthError(null);
    } catch (error) {
      console.error(error);
      await apiClient.logout();
      setCurrentUser(null);
      setAuthError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (apiClient.hasToken()) {
      bootstrapData();
    } else {
      setIsLoading(false);
    }
  }, [bootstrapData]);

  const handleLogin = async (email: string, password: string) => {
    setAuthError(null);
    try {
      const user = await apiClient.login(email, password);
      await bootstrapData(user);
    } catch (error) {
      setAuthError((error as Error).message);
    }
  };

  const handleLogout = async () => {
    await apiClient.logout();
    setCurrentUser(null);
    setActiveTab('dashboard');
    setQuarters([]);
    setCategories([]);
    setBlocks([]);
    setRequests([]);
    setAllocations([]);
    setUsers([]);
  };

  if (!currentUser) {
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
          <p className="text-lg font-medium">Preparing your workspace...</p>
        </div>
      );
    }
    return <LoginPage onLogin={handleLogin} error={authError} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard quarters={quarters} requests={requests} />;
      case 'quarters':
        return <QuartersList quarters={quarters} categories={categories} blocks={blocks} setQuarters={setQuarters} userRole={currentUser.role} />;
      case 'requests':
        return <RequestsPage requests={requests} categories={categories} setRequests={setRequests} userRole={currentUser.role} currentUser={currentUser} />;
      case 'categories':
        return <CategoriesPage categories={categories} setCategories={setCategories} />;
      case 'blocks':
        return <BlocksPage blocks={blocks} setBlocks={setBlocks} />;
      case 'users':
        return <UsersPage users={users} setUsers={setUsers} />;
      case 'allocations':
        return <AllocationsPage allocations={allocations} setAllocations={setAllocations} quarters={quarters} requests={requests} setQuarters={setQuarters} setRequests={setRequests} />;
      default:
        return <Dashboard quarters={quarters} requests={requests} />;
    }
  };

  return (
    <Layout user={currentUser} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
