'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sprout, Phone, User, MapPin, Loader2, ArrowLeft, Languages } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function FarmerSignupPage() {
  const router = useRouter();
  const { language, setLanguage, setUser, t } = useApp();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [prefLang, setPrefLang] = useState<'hi' | 'en'>('hi');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError(language === 'hi' ? 'कृपया अपना पूरा नाम दर्ज करें।' : 'Please enter your full name.');
      return;
    }
    if (!phone || phone.length < 10) {
      setError(language === 'hi' ? 'कृपया 10-अंकीय मोबाइल नंबर दर्ज करें।' : 'Please enter a 10-digit mobile number.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          language: prefLang
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setUser(data.profile);
      // Route directly to onboarding profile/farm setup page
      router.push('/farmer/onboarding');

    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-emerald-50 via-white to-green-100 font-sans">
      
      {/* Back button */}
      <Link 
        href="/auth/login" 
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('back')}
      </Link>

      {/* Language Switcher */}
      <div className="absolute top-6 right-6 flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm text-xs font-bold text-slate-600">
        <Languages className="h-3.5 w-3.5 text-emerald-600" />
        <button 
          onClick={() => { setLanguage('hi'); setPrefLang('hi'); }} 
          className={`px-1.5 py-0.5 rounded ${language === 'hi' ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-slate-100'}`}
        >
          हिंदी
        </button>
        <button 
          onClick={() => { setLanguage('en'); setPrefLang('en'); }} 
          className={`px-1.5 py-0.5 rounded ${language === 'en' ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-slate-100'}`}
        >
          EN
        </button>
      </div>

      <div className="w-full max-w-lg bg-white border border-emerald-100 p-8 rounded-3xl shadow-xl space-y-6 my-10">
        
        {/* Brand/Header */}
        <div className="text-center space-y-1">
          <div className="bg-gradient-to-br from-emerald-400 to-green-600 p-3 rounded-2xl text-white shadow-md w-fit mx-auto">
            <Sprout className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            {language === 'hi' ? 'नया किसान पंजीकरण' : 'Farmer Registration'}
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            {language === 'hi' ? 'अपनी प्रोफ़ाइल और कृषि विवरण सेट करें' : 'Create your farmer profile to get started'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name & Phone Row */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('fullName')} *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder={language === 'hi' ? 'उदा: राजेश पटेल' : 'e.g. Rajesh Patel'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-slate-800 outline-none text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('phoneNumber')} *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Phone className="h-4 w-4" />
                </span>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-slate-800 outline-none text-sm font-medium"
                />
              </div>
            </div>
          </div>

          {/* Lang Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('preferredLang')} *</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPrefLang('hi')}
                className={`py-2.5 rounded-xl border font-bold text-sm transition-all ${prefLang === 'hi' ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                हिंदी (Hindi)
              </button>
              <button
                type="button"
                onClick={() => setPrefLang('en')}
                className={`py-2.5 rounded-xl border font-bold text-sm transition-all ${prefLang === 'en' ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                English
              </button>
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
                {language === 'hi' ? 'पंजीकरण हो रहा है...' : 'Registering...'}
              </>
            ) : (
              language === 'hi' ? 'पंजीकरण करें और आगे बढ़ें' : 'Register & Continue'
            )}
          </button>
        </form>

        {/* Links */}
        <div className="text-center text-xs font-semibold text-slate-500 pt-4 border-t border-slate-100">
          <p>
            {language === 'hi' ? 'पहले से खाता है?' : 'Already registered?'} &nbsp;
            <Link href="/auth/login" className="text-emerald-600 hover:underline">
              {language === 'hi' ? 'यहाँ प्रवेश करें (Login)' : 'Login here'}
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
