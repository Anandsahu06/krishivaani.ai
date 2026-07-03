'use client';

import React, { useEffect, useState } from 'react';
import { 
  CloudSun, 
  Thermometer, 
  Droplets, 
  AlertTriangle, 
  Compass, 
  Info, 
  Activity,
  ArrowLeft,
  CalendarDays
} from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

export default function WeatherAdvisoryPage() {
  const { user, language, t } = useApp();
  const [loading, setLoading] = useState(true);
  const [advisory, setAdvisory] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetch(`/api/farmer/weather-advisory?userId=${user.id}&lang=${language}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setAdvisory(data.advisory);
          } else {
            setError(data.error || 'Failed to fetch weather advisory details');
          }
        })
        .catch(err => {
          console.error(err);
          setError('Error loading weather parameters');
        })
        .finally(() => setLoading(false));
    }
  }, [user, language]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <CloudSun className="h-8 w-8 text-emerald-600 animate-spin mb-3" />
        <span className="text-slate-400 font-bold text-xs">{t('loading')}</span>
      </div>
    );
  }

  if (error || !advisory) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white border rounded-2xl text-center space-y-4">
        <p className="text-red-600 font-bold">{error || 'No weather advisory active for your village'}</p>
        <Link href="/farmer/dashboard" className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const drySpellRisk = advisory.dry_spell_risk || 'low';
  
  // Custom styling elements based on severity
  const riskStyles: Record<string, { bg: string; text: string; border: string; label: string }> = {
    low: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-100', label: 'Low Threat' },
    medium: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-100', label: 'Moderate Threat' },
    high: { bg: 'bg-orange-50', text: 'text-orange-850', border: 'border-orange-200', label: 'High Alert' },
    critical: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200', label: 'Critical Emergency' }
  };

  const currentStyle = riskStyles[drySpellRisk] || riskStyles['low'];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header bar */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-900">{t('weatherAdvisory')}</h2>
          <p className="text-sm text-slate-500 font-medium">📍 {advisory.village_name || 'Wadhona Village'}, {advisory.district}</p>
        </div>
        <Link 
          href="/farmer/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-white border border-slate-200 px-4 py-2 rounded-xl transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('back')}
        </Link>
      </div>

      {/* Grid: Stats & Dry Spell risk gauge */}
      <div className="grid md:grid-cols-12 gap-6">
        
        {/* Weather Metrics Card */}
        <div className="md:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
            <div className="bg-orange-100 text-orange-600 p-2.5 rounded-xl">
              <Thermometer className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Temperature</span>
              <span className="text-xl font-extrabold text-slate-800">{advisory.temperature}°C</span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
            <div className="bg-blue-100 text-blue-600 p-2.5 rounded-xl">
              <Droplets className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Humidity</span>
              <span className="text-xl font-extrabold text-slate-800">{advisory.humidity}%</span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 col-span-2">
            <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-xl">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Forecast Summary</span>
              <span className="text-xs font-extrabold text-slate-800 leading-normal">{advisory.rainfall_forecast}</span>
            </div>
          </div>
        </div>

        {/* Dry Spell Gauge Card */}
        <div className="md:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-between text-center relative">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dry Spell Risk Threat</p>
          
          <div className="my-4 relative flex items-center justify-center">
            {/* Visual circle gauge */}
            <div className="h-28 w-28 rounded-full border-8 border-slate-100 flex flex-col items-center justify-center">
              <span className={`text-xs font-extrabold uppercase ${
                drySpellRisk === 'low' ? 'text-green-600' :
                drySpellRisk === 'medium' ? 'text-amber-500' : 'text-red-600'
              }`}>
                {drySpellRisk}
              </span>
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Risk Index</span>
            </div>
          </div>

          <div className={`w-full border ${currentStyle.border} ${currentStyle.bg} ${currentStyle.text} px-3 py-1.5 rounded-xl text-xs font-bold`}>
            {currentStyle.label}
          </div>
        </div>

      </div>

      {/* AI advisory Explainer message box */}
      <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-y-4">
          <Info className="h-32 w-32" />
        </div>
        <div className="space-y-2 relative z-10">
          <h4 className="font-extrabold text-emerald-100 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
            <Compass className="h-4 w-4" />
            {language === 'hi' ? 'विशेषज्ञ एआई संदेश (AI Krishi Mitra Message)' : 'Expert AI Advisory Message'}
          </h4>
          <p className="text-sm font-bold leading-relaxed text-white">
            "{advisory.ai_explanation}"
          </p>
        </div>
      </div>

      {/* Action details: Sowing, Irrigation, Fertilizing tabs */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Irrigation Advisory */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="bg-blue-100 text-blue-600 p-2.5 rounded-xl">
              <Droplets className="h-5 w-5" />
            </div>
            <h4 className="font-extrabold text-slate-800 text-sm">
              {language === 'hi' ? 'सिंचाई सलाह (Irrigation Guide)' : 'Irrigation Advisory'}
            </h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-semibold">
            {advisory.irrigation_guidance}
          </p>
        </div>

        {/* Fertilization Advisory */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="bg-amber-100 text-amber-600 p-2.5 rounded-xl">
              <Activity className="h-5 w-5" />
            </div>
            <h4 className="font-extrabold text-slate-800 text-sm">
              {language === 'hi' ? 'उर्वरक एवं छिड़काव सलाह' : 'Fertilization Guide'}
            </h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-semibold">
            {advisory.fertilization_guidance}
          </p>
        </div>

      </div>

    </div>
  );
}
