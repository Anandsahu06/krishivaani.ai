'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sprout, Phone, Lock, Loader2, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setUser, user } = useApp();
  const [phone, setPhone] = useState('9999999999'); // default seeded admin phone
  const [password, setPassword] = useState('admin123'); // default password
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in as admin, redirect to admin control center
  useEffect(() => {
    if (user && user.role === 'admin') {
      router.push('/admin/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone || !password) {
      setError('Please enter both phone number and password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      setUser(data.profile);
      router.push('/admin/dashboard');

    } catch (err: any) {
      console.error("Admin login error:", err);
      setError(err.message || 'Failed to authenticate admin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 font-sans text-slate-100">
      
      {/* Back to landing */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="w-full max-w-md bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-3 rounded-2xl text-white shadow-lg w-fit mx-auto">
            <Sprout className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">KrishiVaani Expert Portal</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Agricultural Officer / Specialist Login
          </p>
        </div>

        {/* Hackathon notice */}
        <div className="bg-slate-750 border border-emerald-800/40 p-4 rounded-2xl flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1 text-slate-300">
            <p className="font-bold text-slate-200">Hackathon Demo Info</p>
            <p>Admin tables are initialized during setup. Use the pre-filled credentials:</p>
            <p className="font-mono text-emerald-400">Phone: 9999999999</p>
            <p className="font-mono text-emerald-400">Password: admin123</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Officer Phone Number</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Phone className="h-4 w-4" />
              </span>
              <input
                type="tel"
                placeholder="Admin Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-700 border border-slate-600 focus:border-emerald-500 text-white outline-none text-sm transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Access Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                placeholder="Access Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-700 border border-slate-600 focus:border-emerald-500 text-white outline-none text-sm transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-950/60 text-red-400 px-4 py-3 rounded-xl text-xs font-semibold border border-red-900/50">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all flex justify-center items-center gap-2 text-sm shadow-lg shadow-emerald-900/25"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              'Authenticate Officer'
            )}
          </button>
        </form>

        {/* Links */}
        <div className="text-center text-xs font-semibold text-slate-400 pt-4 border-t border-slate-700">
          <p>
            Are you a farmer? &nbsp;
            <Link href="/auth/login" className="text-emerald-400 hover:underline">
              Go to Farmer Login (किसान प्रवेश)
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
