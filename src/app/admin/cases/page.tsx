'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Inbox, 
  Search, 
  ChevronRight, 
  Filter, 
  Loader2,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export default function AdminCasesPage() {
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<any[]>([]);

  // Filter states
  const [status, setStatus] = useState('all');
  const [crop, setCrop] = useState('all');
  const [district, setDistrict] = useState('all');

  useEffect(() => {
    loadCases();
  }, [status, crop, district]);

  const loadCases = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/cases/list?status=${status}&crop=${crop}&district=${district}`);
      const data = await res.json();
      if (data.success) {
        setCases(data.cases);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold text-white">Farmer Cases & Escalations</h2>
        <p className="text-slate-400 text-sm">Review leaf disease uploads, confidence matching scores, and resolve escalated support tickets.</p>
      </div>

      {/* Filters block */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          
          {/* Status Filter */}
          <div className="space-y-1 w-full sm:w-44">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="escalated">Escalated</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Crop Filter */}
          <div className="space-y-1 w-full sm:w-44">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Crop Sown</span>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 outline-none"
            >
              <option value="all">All Crops</option>
              <option value="Cotton">Cotton</option>
              <option value="Soybean">Soybean</option>
              <option value="Rice/Paddy">Rice / Paddy</option>
              <option value="Wheat">Wheat</option>
              <option value="Pigeon Pea">Pigeon Pea</option>
            </select>
          </div>

          {/* District Filter */}
          <div className="space-y-1 w-full sm:w-44">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">District</span>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 outline-none"
            >
              <option value="all">All Districts</option>
              <option value="Nagpur">Nagpur</option>
              <option value="Wardha">Wardha</option>
              <option value="Palghar">Palghar</option>
            </select>
          </div>

        </div>

        <div className="text-slate-400 text-xs font-bold">
          Found {cases.length} cases
        </div>
      </div>

      {/* Cases Table list */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500 mb-2" />
            <span className="text-xs text-slate-500 font-bold">Loading case logs...</span>
          </div>
        ) : cases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Inbox className="h-10 w-10 text-slate-750 mb-2" />
            <p className="text-xs font-bold">No farmer cases match the active filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-850/50 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Case ID</th>
                  <th className="p-4">Farmer</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Crop Type</th>
                  <th className="p-4">AI disease Ident</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
                {cases.map((c) => (
                  <tr key={c.case_id} className="hover:bg-slate-850/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-400">#{c.case_id}</td>
                    <td className="p-4 font-bold text-white">{c.farmer_name}</td>
                    <td className="p-4">{c.village_name}, {c.district}</td>
                    <td className="p-4">{c.crop_type}</td>
                    <td className="p-4 text-white font-semibold">{c.ai_disease}</td>
                    <td className="p-4">
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase ${
                        c.ai_severity === 'low' ? 'bg-green-950 text-green-400 border border-green-900/30' :
                        c.ai_severity === 'medium' ? 'bg-amber-950 text-amber-400 border border-amber-900/30' : 
                        'bg-red-950 text-red-400 border border-red-900/30'
                      }`}>
                        {c.ai_severity}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase ${
                        c.status === 'resolved' ? 'bg-green-950 text-green-400' :
                        c.status === 'escalated' ? 'bg-purple-950 text-purple-400' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <Link
                        href={`/admin/cases/${c.case_id}`}
                        className="bg-emerald-600 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-all inline-flex items-center gap-0.5"
                      >
                        Inspect
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
