'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  AlertTriangle, 
  Inbox, 
  HelpCircle, 
  Loader2, 
  ChevronRight,
  TrendingUp,
  Map,
  Clock
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    totalFarmers: 0,
    activeAlerts: 0,
    openDiagnoses: 0,
    openTickets: 0,
    districtBreakdown: [],
    recentCases: []
  });

  useEffect(() => {
    fetch('/api/admin/dashboard-stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.data);
        }
      })
      .catch(err => console.error("Error fetching admin stats", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mb-3" />
        <span className="text-slate-500 font-bold text-xs">Loading Command Stats...</span>
      </div>
    );
  }

  const metricItems = [
    { title: 'Total Registered Farmers', value: stats.totalFarmers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Open Escales / Tickets', value: stats.openTickets, icon: HelpCircle, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Diagnosis Cases Pending', value: stats.openDiagnoses, icon: Inbox, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { title: 'Active Weather Advisories', value: stats.activeAlerts, icon: AlertTriangle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Welcome header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold text-white">Command Overview Dashboard</h2>
        <p className="text-slate-400 text-sm">Real-time statistics of Indic-language AI crop cases, warnings, and expert resolutions.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm relative overflow-hidden">
              <span className={`absolute bottom-4 right-4 p-2 rounded-xl ${item.bg} ${item.color}`}>
                <Icon className="h-5 w-5" />
              </span>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.title}</p>
              <h4 className="text-3xl font-extrabold text-white mt-2">{item.value}</h4>
            </div>
          );
        })}
      </div>

      {/* Grid: Recent activities Left, District chart Right */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Recent Cases list */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <Clock className="h-4 w-4 text-emerald-500" />
              Recent Farmer Cases Submitted
            </h3>

            <div className="divide-y divide-slate-800 overflow-x-auto">
              {stats.recentCases.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-10 font-medium">No diagnostic cases submitted yet.</p>
              ) : (
                stats.recentCases.map((c: any) => (
                  <div key={c.id} className="py-4 flex justify-between items-center gap-4 text-xs">
                    <div className="space-y-1">
                      <p className="font-extrabold text-white">{c.farmer_name} ({c.village_name})</p>
                      <p className="text-slate-400">Crop: {c.crop_type} | AI disease: {c.ai_disease}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase ${
                        c.status === 'resolved' ? 'bg-green-950 text-green-400' : 'bg-amber-950 text-amber-400'
                      }`}>
                        {c.status}
                      </span>
                      <Link 
                        href={`/admin/cases/${c.id}`}
                        className="bg-slate-800 text-slate-300 p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {stats.recentCases.length > 0 && (
            <Link 
              href="/admin/cases"
              className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1 mt-4"
            >
              See all farmer cases
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {/* District Breakdown chart */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Map className="h-4 w-4 text-emerald-500" />
            District Case Volume
          </h3>

          <div className="space-y-4">
            {stats.districtBreakdown.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-10 font-medium">No districts mapped.</p>
            ) : (
              stats.districtBreakdown.map((dist: any, idx: number) => (
                <div key={idx} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold text-slate-350">
                    <span>{dist.district || 'Nagpur'}</span>
                    <span className="text-slate-400">{dist.case_count} Cases</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full animate-pulse" 
                      style={{ width: `${Math.min(100, (parseInt(dist.case_count, 10) * 20))}%` }} 
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
