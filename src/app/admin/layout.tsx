'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Sprout, 
  Layers, 
  Inbox, 
  Radio, 
  LogOut, 
  Loader2, 
  Settings2,
  RefreshCw,
  Home
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser, isLoading } = useApp();
  const [resettingDb, setResettingDb] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Authenticate session check
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/auth/admin-login');
    }
  }, [user, isLoading, router]);

  const handleLogout = () => {
    setUser(null);
    router.push('/auth/admin-login');
  };

  const handleResetDb = async () => {
    setResettingDb(true);
    setResetSuccess(false);
    try {
      const res = await fetch('/api/setup');
      const data = await res.json();
      if (data.status === 'success') {
        setResetSuccess(true);
        setTimeout(() => setResetSuccess(false), 3000);
        // Refresh page to load seeded DB values
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResettingDb(false);
    }
  };

  const navItems = [
    { name: 'Overview Stats', href: '/admin/dashboard', icon: Layers },
    { name: 'Farmer Cases', href: '/admin/cases', icon: Inbox },
    { name: 'Weather Monitoring', href: '/admin/weather', icon: Radio },
  ];

  if (isLoading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100">
        <Sprout className="h-10 w-10 text-emerald-500 animate-bounce mb-3" />
        <span className="text-slate-500 font-bold text-sm">Validating Officer Credentials...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans">
      
      {/* Sidebar navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        
        {/* Brand */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-800 shrink-0">
          <div className="bg-gradient-to-br from-emerald-500 to-green-700 p-2.5 rounded-xl text-white shadow-md shadow-emerald-950">
            <Sprout className="h-5 w-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              KrishiVaani AI
            </span>
            <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">
              Specialist Center
            </span>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 mx-4 my-4 bg-slate-800/50 border border-slate-800 rounded-2xl">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assigned Specialist</p>
          <h4 className="font-extrabold text-white text-sm truncate">{user.farmer_name}</h4>
          <span className="inline-block bg-slate-700 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded mt-1.5 truncate">
            📍 Nagpur Headquarters
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  active 
                    ? 'bg-emerald-600 text-white shadow shadow-emerald-900/40' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Setup actions */}
        <div className="px-4 space-y-2 border-t border-slate-800 pt-4">
          <button
            onClick={handleResetDb}
            disabled={resettingDb}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              resetSuccess 
                ? 'bg-green-950 border-green-800 text-green-300'
                : 'bg-slate-850 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
          >
            {resettingDb ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {resetSuccess ? 'Seed Success!' : 'Provision/Reset DB'}
          </button>
        </div>

        {/* Logout */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-red-950/40 hover:text-red-400 transition-all"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Sign Out
          </button>
        </div>

      </aside>

      {/* Main Command Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <header className="h-20 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-40 shrink-0">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Control Panel & Command Center
            </span>
          </div>

          <Link
            href="/"
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700"
          >
            <Home className="h-3.5 w-3.5" />
            Public Page
          </Link>
        </header>

        {/* Content body */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
