'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Sprout, 
  CalendarDays, 
  CloudRain, 
  Camera, 
  ArrowLeft, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function HistoryPage() {
  const { user, language, t } = useApp();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any>({
    recommendations: [],
    diagnoses: [],
    weatherAdvisories: []
  });
  const [activeTab, setActiveTab] = useState<'recs' | 'diagnoses' | 'weather'>('recs');

  useEffect(() => {
    if (user) {
      fetch(`/api/farmer/history?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setHistory(data.data);
          }
        })
        .catch(err => console.error("Error loading history", err))
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-900">{t('history')}</h2>
          <p className="text-sm text-slate-500 font-medium">Historical logs of your agricultural advisor cases.</p>
        </div>
        <Link 
          href="/farmer/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-white border border-slate-200 px-4 py-2 rounded-xl"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('back')}
        </Link>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-bold text-slate-500">
        <button
          onClick={() => setActiveTab('recs')}
          className={`pb-3 relative flex items-center gap-2 ${activeTab === 'recs' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'hover:text-slate-700'}`}
        >
          <CalendarDays className="h-4 w-4" />
          {t('cropRecommend')} ({history.recommendations.length})
        </button>
        <button
          onClick={() => setActiveTab('weather')}
          className={`pb-3 relative flex items-center gap-2 ${activeTab === 'weather' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'hover:text-slate-700'}`}
        >
          <CloudRain className="h-4 w-4" />
          {t('weatherAdvisory')} ({history.weatherAdvisories.length})
        </button>
        <button
          onClick={() => setActiveTab('diagnoses')}
          className={`pb-3 relative flex items-center gap-2 ${activeTab === 'diagnoses' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'hover:text-slate-700'}`}
        >
          <Camera className="h-4 w-4" />
          {t('cropDiagnosis')} ({history.diagnoses.length})
        </button>
      </div>

      {/* Contents based on tab */}
      <div className="space-y-4">
        
        {/* RECS TAB */}
        {activeTab === 'recs' && (
          <div className="space-y-4">
            {history.recommendations.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center font-medium">No previous crop recommendation records.</p>
            ) : (
              history.recommendations.map((item: any) => {
                const crops = JSON.parse(item.recommendations || '[]');
                return (
                  <div key={item.id} className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="space-y-2">
                      <div className="flex gap-2 text-[10px] text-slate-400 font-bold uppercase">
                        <span>Season: {item.season}</span>
                        <span>•</span>
                        <span>Soil: {item.soil_type}</span>
                      </div>
                      <h4 className="font-extrabold text-slate-800 text-sm">
                        Recommended: {crops.map((c: any) => c.cropName).join(', ')}
                      </h4>
                      <span className="block text-[9px] text-slate-400 font-semibold">
                        Sought: {new Date(item.created_at).toLocaleString()}
                      </span>
                    </div>

                    <Link
                      href={`/farmer/recommend/results/${item.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline shrink-0"
                    >
                      View Report
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* WEATHER TAB */}
        {activeTab === 'weather' && (
          <div className="space-y-4">
            {history.weatherAdvisories.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center font-medium">No weather warning alerts logged.</p>
            ) : (
              history.weatherAdvisories.map((item: any) => (
                <div key={item.id} className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">{new Date(item.created_at).toLocaleString()}</span>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase ${
                      item.dry_spell_risk === 'low' ? 'bg-green-100 text-green-800' :
                      item.dry_spell_risk === 'medium' ? 'bg-amber-100 text-amber-850' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.dry_spell_risk} Dry spell risk
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    "{item.ai_explanation}"
                  </p>
                  
                  <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
                    <p>💧 Irrigation: {item.irrigation_guidance}</p>
                    <p>🧪 Fertilizers: {item.fertilization_guidance}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* DIAGNOSES TAB */}
        {activeTab === 'diagnoses' && (
          <div className="space-y-4">
            {history.diagnoses.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center font-medium">No leaf disease diagnoses logged.</p>
            ) : (
              history.diagnoses.map((item: any) => (
                <div key={item.id} className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex gap-4 items-center">
                    {item.image_url && (
                      <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                        <img src={item.image_url} alt="Leaf crop" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="flex gap-2 items-center">
                        <h4 className="font-extrabold text-slate-800 text-sm">{item.ai_disease}</h4>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                          item.ai_severity === 'low' ? 'bg-green-100 text-green-800' :
                          item.ai_severity === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.ai_severity}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Crop: {item.crop_type} | Status: {item.status}</p>
                      <span className="block text-[9px] text-slate-400 font-medium">
                        Uploaded: {new Date(item.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/farmer/diagnose/results/${item.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline shrink-0"
                  >
                    View Report
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              ))
            )}
          </div>
        )}

      </div>

    </div>
  );
}
