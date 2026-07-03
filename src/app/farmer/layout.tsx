'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Sprout, 
  LayoutDashboard, 
  CalendarDays, 
  CloudSun, 
  Camera, 
  HelpCircle, 
  History, 
  UserCircle, 
  LogOut, 
  Languages, 
  Bell, 
  Menu, 
  X 
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser, language, setLanguage, isLoading, t } = useApp();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Authenticate session check
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  // Fetch recent notifications
  useEffect(() => {
    if (user) {
      fetch(`/api/farmer/notifications?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setNotifications(data.notifications);
          }
        })
        .catch(err => console.error("Error fetching notifications", err));
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    router.push('/auth/login');
  };

  const navItems = [
    { name: t('dashboard'), href: '/farmer/dashboard', icon: LayoutDashboard },
    { name: t('cropRecommend'), href: '/farmer/recommend', icon: CalendarDays },
    { name: t('weatherAdvisory'), href: '/farmer/weather', icon: CloudSun },
    { name: t('cropDiagnosis'), href: '/farmer/diagnose', icon: Camera },
    { name: t('requestHelp'), href: '/farmer/support', icon: HelpCircle },
    { name: t('history'), href: '/farmer/history', icon: History },
    { name: t('profile'), href: '/farmer/profile', icon: UserCircle },
  ];

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Sprout className="h-10 w-10 text-emerald-600 animate-bounce mb-3" />
        <span className="text-slate-500 font-bold text-sm">{t('loading')}</span>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0">
        {/* Brand */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-100">
          <div className="bg-gradient-to-br from-emerald-400 to-green-600 p-2 rounded-xl text-white shadow-md">
            <Sprout className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
              {t('brandName')}
            </h1>
            <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">
              Farmer Copilot
            </span>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 mx-4 my-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
          <p className="text-xs font-semibold text-slate-500">{t('welcomeFarmer')}</p>
          <h4 className="font-bold text-slate-800 truncate text-sm">{user.farmer_name}</h4>
          <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded mt-1.5">
            📍 {user.village_name || 'My Village'}
          </span>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  active 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-600'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-700 transition-all"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {t('logout')}
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header bar */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
          
          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="hidden md:block">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {user.district}, {user.state}
            </span>
          </div>

          {/* Quick settings: Language, Notifications */}
          <div className="flex items-center gap-4">
            
            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-slate-150 p-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-600">
              <Languages className="h-3.5 w-3.5 text-emerald-600" />
              <button 
                onClick={() => setLanguage('hi')} 
                className={`px-2 py-0.5 rounded ${language === 'hi' ? 'bg-white text-emerald-800 shadow-sm' : 'hover:bg-white/50'}`}
              >
                हिंदी
              </button>
              <button 
                onClick={() => setLanguage('en')} 
                className={`px-2 py-0.5 rounded ${language === 'en' ? 'bg-white text-emerald-800 shadow-sm' : 'hover:bg-white/50'}`}
              >
                EN
              </button>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <span className="font-bold text-slate-800 text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={() => {
                          fetch(`/api/farmer/notifications/read?userId=${user.id}`, { method: 'POST' })
                            .then(() => setNotifications(notifications.map(n => ({...n, is_read: true}))))
                            .catch(err => console.error(err));
                        }}
                        className="text-[10px] text-emerald-600 font-bold hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-xs text-slate-400 text-center font-medium">No new notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className={`p-4 text-xs space-y-1 ${n.is_read ? 'bg-white' : 'bg-emerald-50/30'}`}>
                          <p className="font-bold text-slate-800">{n.title}</p>
                          <p className="text-slate-500 leading-normal">{n.message}</p>
                          <span className="block text-[9px] text-slate-400 font-medium">
                            {new Date(n.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>

        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-900/40 backdrop-blur-sm">
          <div className="w-64 bg-white flex flex-col h-full animate-in slide-in-from-left duration-250">
            
            <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sprout className="h-5 w-5 text-emerald-600" />
                <span className="font-extrabold text-slate-950 text-sm">{t('brandName')}</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 mx-4 my-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
              <p className="text-xs font-semibold text-slate-500">{t('welcomeFarmer')}</p>
              <h4 className="font-bold text-slate-800 text-sm truncate">{user.farmer_name}</h4>
              <span className="text-[10px] font-bold text-slate-500">📍 {user.village_name}</span>
            </div>

            <nav className="flex-1 px-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      active 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                {t('logout')}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
