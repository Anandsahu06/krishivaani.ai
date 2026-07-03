'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Sprout, 
  CloudRain, 
  AlertTriangle, 
  HelpCircle, 
  ArrowRight, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function FarmerDashboard() {
  const { user, language, t } = useApp();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    latestRecommendation: null,
    latestAdvisory: null,
    latestDiagnosis: null,
    activeTicketsCount: 0,
    activities: []
  });

  useEffect(() => {
    if (user) {
      fetch(`/api/farmer/dashboard-summary?userId=${user.id}`)
        .then(res => res.json())
        .then(resData => {
          if (resData.success) {
            setData(resData.data);
          }
        })
        .catch(err => console.error("Error loading dashboard data", err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Sprout className="h-8 w-8 text-emerald-600 animate-spin mb-3" />
        <span className="text-slate-400 font-bold text-xs">{t('loading')}</span>
      </div>
    );
  }

  // Check if there is an active dry-spell weather warning
  const activeAlert = data.latestAdvisory && 
    (data.latestAdvisory.dry_spell_risk === 'high' || data.latestAdvisory.dry_spell_risk === 'critical');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-500 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-15 transform translate-y-6 translate-x-6">
          <Sprout className="h-64 w-64 text-white" />
        </div>
        <div className="relative z-10 space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
            {t('welcomeFarmer')} {user?.farmer_name}!
          </h2>
          <p className="text-emerald-50 text-sm md:text-base font-medium max-w-2xl">
            {language === 'hi' 
              ? 'कृषिवाणी AI में आपका स्वागत है। आइए आपकी मिट्टी, स्थानीय मौसम और फसल स्वास्थ्य के अनुसार सर्वोत्तम कृषि निर्णय लें।' 
              : 'Welcome to KrishiVaani AI. Let\'s evaluate crop health, monitor weather advisories, and boost your harvest precision.'}
          </p>
        </div>
      </div>

      {/* Weather / Alert Banner */}
      {activeAlert ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-4 items-start shadow-sm animate-pulse">
          <div className="bg-red-100 p-2.5 rounded-xl text-red-700 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-red-950 text-sm">
                {language === 'hi' ? 'गंभीर सूखा चेतावनी (Dry Spell ALERT)' : 'Severe Dry Spell Warning'}
              </h4>
              <span className="bg-red-200 text-red-950 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                {data.latestAdvisory.dry_spell_risk}
              </span>
            </div>
            <p className="text-xs text-red-800 leading-relaxed font-medium">
              {data.latestAdvisory.ai_explanation}
            </p>
            <Link 
              href="/farmer/weather" 
              className="inline-flex items-center gap-1 text-xs font-bold text-red-900 hover:underline pt-1"
            >
              {language === 'hi' ? 'सिंचाई निर्देश देखें' : 'View irrigation guidelines'}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3 items-center">
          <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="text-xs text-emerald-800 font-medium">
            {t('noAlerts')}
          </span>
        </div>
      )}

      {/* Metrics Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Recommendation Widget */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('cropRecCardTitle')}</p>
          <div className="mt-3 space-y-1">
            {data.latestRecommendation ? (
              <>
                <p className="text-base font-extrabold text-slate-800">
                  {JSON.parse(data.latestRecommendation.recommendations || '[]')[0]?.cropName || 'Ready'}
                </p>
                <p className="text-xs text-slate-400 font-medium">
                  Suitability: {JSON.parse(data.latestRecommendation.recommendations || '[]')[0]?.suitabilityScore || 0}%
                </p>
              </>
            ) : (
              <p className="text-slate-500 font-bold text-sm">Not Started</p>
            )}
          </div>
          <span className="absolute bottom-4 right-4 bg-emerald-50 text-emerald-600 p-1.5 rounded-lg">
            <Sprout className="h-4 w-4" />
          </span>
        </div>

        {/* Weather Risk Widget */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{language === 'hi' ? 'सूखा जोखिम' : 'Dry Spell Risk'}</p>
          <div className="mt-3 space-y-1">
            {data.latestAdvisory ? (
              <>
                <p className={`text-base font-extrabold uppercase ${
                  data.latestAdvisory.dry_spell_risk === 'low' ? 'text-green-600' :
                  data.latestAdvisory.dry_spell_risk === 'medium' ? 'text-amber-500' : 'text-red-600'
                }`}>
                  {data.latestAdvisory.dry_spell_risk} Risk
                </p>
                <p className="text-xs text-slate-400 font-medium">
                  Temp: {data.latestAdvisory.temperature}°C
                </p>
              </>
            ) : (
              <p className="text-slate-500 font-bold text-sm">No Forecast</p>
            )}
          </div>
          <span className="absolute bottom-4 right-4 bg-blue-50 text-blue-600 p-1.5 rounded-lg">
            <CloudRain className="h-4 w-4" />
          </span>
        </div>

        {/* Crop Diagnosis Widget */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('cropDiagnosis')}</p>
          <div className="mt-3 space-y-1">
            {data.latestDiagnosis ? (
              <>
                <p className="text-base font-extrabold text-slate-800 truncate pr-6">
                  {data.latestDiagnosis.ai_disease}
                </p>
                <p className={`text-xs font-bold uppercase ${
                  data.latestDiagnosis.status === 'resolved' ? 'text-green-600' : 'text-amber-600'
                }`}>
                  {data.latestDiagnosis.status}
                </p>
              </>
            ) : (
              <p className="text-slate-500 font-bold text-sm">No Diagnosis</p>
            )}
          </div>
          <span className="absolute bottom-4 right-4 bg-red-50 text-red-600 p-1.5 rounded-lg">
            <AlertCircle className="h-4 w-4" />
          </span>
        </div>

        {/* Expert Tickets Widget */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{language === 'hi' ? 'सक्रिय शिकायतें' : 'Expert Tickets'}</p>
          <div className="mt-3 space-y-1">
            <p className="text-2xl font-extrabold text-slate-800">
              {data.activeTicketsCount}
            </p>
            <p className="text-xs text-slate-400 font-medium">Open cases pending</p>
          </div>
          <span className="absolute bottom-4 right-4 bg-purple-50 text-purple-600 p-1.5 rounded-lg">
            <HelpCircle className="h-4 w-4" />
          </span>
        </div>

      </div>

      {/* Quick Launch Cards Section */}
      <div>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">{t('quickActions')}</h3>
        <div className="grid md:grid-cols-4 gap-4">
          
          {/* Action 1 */}
          <Link 
            href="/farmer/recommend" 
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between h-48 group"
          >
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl w-fit group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm mb-1">{t('cropRecCardTitle')}</h4>
              <p className="text-[11px] text-slate-400 font-medium">Identify 3 best-matching crops with suitability gauges.</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
              {t('recBtn')}
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          {/* Action 2 */}
          <Link 
            href="/farmer/weather" 
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between h-48 group"
          >
            <div className="bg-blue-50 text-blue-600 p-3 rounded-xl w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <CloudRain className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm mb-1">{t('weatherCardTitle')}</h4>
              <p className="text-[11px] text-slate-400 font-medium">Check rain calendars and nitrogen fertilizing tips.</p>
            </div>
            <span className="text-xs font-bold text-blue-600 inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
              {t('weatherBtn')}
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          {/* Action 3 */}
          <Link 
            href="/farmer/diagnose" 
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between h-48 group"
          >
            <div className="bg-red-50 text-red-600 p-3 rounded-xl w-fit group-hover:bg-red-600 group-hover:text-white transition-colors">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm mb-1">{t('diagnosisCardTitle')}</h4>
              <p className="text-[11px] text-slate-400 font-medium">Scan crop leaf damage for instant AI remedies.</p>
            </div>
            <span className="text-xs font-bold text-red-600 inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
              {t('diagBtn')}
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          {/* Action 4 */}
          <Link 
            href="/farmer/support" 
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between h-48 group"
          >
            <div className="bg-purple-50 text-purple-600 p-3 rounded-xl w-fit group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm mb-1">{t('supportCardTitle')}</h4>
              <p className="text-[11px] text-slate-400 font-medium">Ask questions to local expert support officers.</p>
            </div>
            <span className="text-xs font-bold text-purple-600 inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
              {t('supportBtn')}
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </Link>

        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-emerald-600" />
          {t('recentActivity')}
        </h3>

        {data.activities.length === 0 ? (
          <p className="text-xs text-slate-400 font-medium text-center py-6">No recent actions logged.</p>
        ) : (
          <div className="relative border-l-2 border-slate-100 pl-4 space-y-6">
            {data.activities.map((act: any, idx: number) => (
              <div key={idx} className="relative">
                <span className="absolute -left-[23px] top-1 bg-white border-2 border-emerald-500 rounded-full h-3 w-3" />
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">
                    {new Date(act.created_at).toLocaleString()}
                  </span>
                  <p className="text-xs font-semibold text-slate-700">{act.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
