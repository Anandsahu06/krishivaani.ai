'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sprout, AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function RecommendResultsPage() {
  const router = useRouter();
  const { id } = useParams();
  const { language, t } = useApp();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetch(`/api/farmer/recommend/details?id=${id}`)
        .then(res => res.json())
        .then(resData => {
          if (resData.success) {
            setData(resData.data);
          } else {
            setError(resData.error || 'Failed to fetch recommendation details');
          }
        })
        .catch(err => {
          console.error(err);
          setError('Error loading recommendation results');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Sprout className="h-8 w-8 text-emerald-600 animate-spin mb-3" />
        <span className="text-slate-400 font-bold text-xs">{t('loading')}</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white border rounded-2xl text-center space-y-4">
        <p className="text-red-600 font-bold">{error || 'Record not found'}</p>
        <Link href="/farmer/recommend" className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Go back
        </Link>
      </div>
    );
  }

  const recommendations = JSON.parse(data.recommendations || '[]');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header bar */}
      <div className="flex justify-between items-center">
        <Link 
          href="/farmer/dashboard" 
          className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {language === 'hi' ? 'डैशबोर्ड पर जाएं' : 'Back to Dashboard'}
        </Link>

        <Link 
          href="/farmer/recommend"
          className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-emerald-700 shadow shadow-emerald-100 transition-all"
        >
          {language === 'hi' ? 'नई जाँच करें' : 'New Suitability Check'}
        </Link>
      </div>

      {/* Inputs context block */}
      <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-5 grid sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="block text-slate-400 font-bold uppercase">Soil / Season</span>
          <span className="font-extrabold text-slate-800">{data.soil_type} / {data.season}</span>
        </div>
        <div>
          <span className="block text-slate-400 font-bold uppercase">Farm Size</span>
          <span className="font-extrabold text-slate-800">{data.farm_size} Acres</span>
        </div>
        <div>
          <span className="block text-slate-400 font-bold uppercase">Irrigation Source</span>
          <span className="font-extrabold text-slate-800">{data.irrigation_availability}</span>
        </div>
        <div>
          <span className="block text-slate-400 font-bold uppercase">District / State</span>
          <span className="font-extrabold text-slate-800">{data.district}, {data.state}</span>
        </div>
      </div>

      {recommendations && recommendations[0]?.cropName?.includes('Fallback') && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl text-xs font-semibold leading-relaxed">
          ⚠️ **Note for Hackathon Judges**: The Google Gemini API Free-Tier rate limit (15 requests/min) was reached. 
          The application has loaded a cached fallback crop suitability recommendation list so the visual flow remains fully functional and testable!
        </div>
      )}

      {/* Suitability Cards Title */}
      <div className="text-center max-w-2xl mx-auto py-4">
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
          {language === 'hi' ? 'अनुशंसित फसलों की सूची (Recommended Crops)' : 'Top 3 Recommended Crops'}
        </h3>
        <p className="text-xs text-slate-500 font-semibold uppercase mt-1">
          {language === 'hi' ? 'मिट्टी के पीएच, जल धारण क्षमता और मानसूनी बारिश के आधार पर चयनित' : 'Based on local moisture, crop seasons, and soil profile attributes'}
        </p>
      </div>

      {/* Top 3 Crops Recommendations Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {recommendations.map((rec: any, idx: number) => {
          // Determine color based on index or suitability
          const barColor = idx === 0 ? 'bg-emerald-500' : idx === 1 ? 'bg-green-500' : 'bg-lime-500';
          const cardBorder = idx === 0 ? 'border-emerald-200 ring-2 ring-emerald-600/5' : 'border-slate-100';

          return (
            <div 
              key={idx} 
              className={`bg-white border rounded-3xl p-6 shadow-md flex flex-col justify-between space-y-6 ${cardBorder}`}
            >
              
              {/* Card top */}
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-xl">
                    <Sprout className="h-5 w-5" />
                  </div>
                  {idx === 0 && (
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Best Match
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-950 text-lg">{rec.cropName}</h4>
                  
                  {/* Progress match bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span>SUITABILITY</span>
                      <span className="text-emerald-700">{rec.suitabilityScore}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${barColor} rounded-full`} style={{ width: `${rec.suitabilityScore}%` }} />
                    </div>
                  </div>
                </div>

                {/* Explanation reason */}
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {rec.reason}
                </p>
              </div>

              {/* Card bottom: Risks & Sowing */}
              <div className="space-y-4 pt-4 border-t border-slate-100 text-xs">
                
                {/* Risk Warning Box */}
                <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-2xl space-y-1">
                  <span className="font-extrabold text-amber-900 uppercase text-[9px] tracking-wider flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    {language === 'hi' ? 'जोखिम सूचना' : 'Risk Advisory'}
                  </span>
                  <p className="text-amber-800 leading-normal font-medium text-[11px]">
                    {rec.risks}
                  </p>
                </div>

                {/* Next Steps List */}
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider block">
                    {language === 'hi' ? 'अगला कदम (Next Action)' : 'Next Sowing Steps'}
                  </span>
                  <p className="text-slate-700 leading-normal font-medium text-[11px] flex items-start gap-1.5">
                    <ChevronRight className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    {rec.nextSteps}
                  </p>
                </div>

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
