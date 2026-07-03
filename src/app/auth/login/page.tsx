'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sprout, Phone, Loader2, ArrowLeft, Languages } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function FarmerLoginPage() {
  const router = useRouter();
  const { language, setLanguage, setUser, user, t } = useApp();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in as farmer, redirect to dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'farmer') {
        router.push('/farmer/dashboard');
      } else if (user.role === 'admin') {
        router.push('/admin/dashboard');
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone || phone.length < 10) {
      setError(language === 'hi' ? 'कृपया एक वैध 10-अंकीय मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setUser(data.profile);
      router.push('/farmer/dashboard');

    } catch (err: any) {
      console.error("Login submission error:", err);
      setError(err.message || 'Server error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-emerald-50 via-white to-green-100 font-sans">
      
      {/* Back button */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('back')}
      </Link>

      {/* Language Switcher */}
      <div className="absolute top-6 right-6 flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm text-xs font-bold text-slate-600">
        <Languages className="h-3.5 w-3.5 text-emerald-600" />
        <button 
          onClick={() => setLanguage('hi')} 
          className={`px-1.5 py-0.5 rounded ${language === 'hi' ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-slate-100'}`}
        >
          हिंदी
        </button>
        <button 
          onClick={() => setLanguage('en')} 
          className={`px-1.5 py-0.5 rounded ${language === 'en' ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-slate-100'}`}
        >
          EN
        </button>
      </div>

      <div className="w-full max-w-md bg-white border border-emerald-100 p-8 rounded-3xl shadow-xl space-y-6">
        
        {/* Brand/Header */}
        <div className="text-center space-y-2">
          <div className="bg-gradient-to-br from-emerald-400 to-green-600 p-3 rounded-2xl text-white shadow-md w-fit mx-auto">
            <Sprout className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">{t('brandName')}</h2>
          <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">{t('tagline')}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {language === 'hi' ? 'मोबाइल नंबर' : 'Mobile Number'}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Phone className="h-5 w-5" />
              </span>
              <input
                type="tel"
                placeholder={language === 'hi' ? '10-अंकीय नंबर (उदा: 9876543210)' : '10-digit number (e.g. 9876543210)'}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-slate-800 outline-none transition-all font-medium"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-50 transition-all flex justify-center items-center gap-2 text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {language === 'hi' ? 'प्रवेश हो रहा है...' : 'Logging in...'}
              </>
            ) : (
              language === 'hi' ? 'प्रवेश करें (Login)' : 'Sign In / Login'
            )}
          </button>
        </form>

        {/* Links */}
        <div className="text-center text-xs font-semibold text-slate-500 pt-4 border-t border-slate-100 flex flex-col gap-2">
          <p>
            {language === 'hi' ? 'नया खाता बनाना चाहते हैं?' : 'New to KrishiVaani?'} &nbsp;
            <Link href="/auth/signup" className="text-emerald-600 hover:underline">
              {language === 'hi' ? 'पंजीकरण करें (Register)' : 'Register / Sign Up'}
            </Link>
          </p>
          <p>
            {language === 'hi' ? 'कृषि अधिकारी / विशेषज्ञ लॉगिन' : 'District Expert Officer Login'} &nbsp;
            <Link href="/auth/admin-login" className="text-slate-600 hover:underline">
              {language === 'hi' ? 'यहाँ क्लिक करें' : 'Click here'}
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
