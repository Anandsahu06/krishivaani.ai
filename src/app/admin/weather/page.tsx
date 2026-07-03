'use client';

import React, { useEffect, useState } from 'react';
import { 
  Radio, 
  Send, 
  AlertTriangle, 
  Loader2, 
  CheckCircle2,
  Clock,
  Compass
} from 'lucide-react';

export default function AdminWeatherAlertsPage() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);

  // Form states
  const [district, setDistrict] = useState('Nagpur');
  const [severity, setSeverity] = useState('medium');
  const [drySpellRisk, setDrySpellRisk] = useState('high');
  const [message, setMessage] = useState('किसान भाइयों, अगले 9 दिनों तक वर्षा न होने की आशंका है। कपास में यूरिया का छिड़काव रोक दें और सुबह सिंचाई करें।');

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadAlertHistory();
  }, []);

  const loadAlertHistory = async () => {
    try {
      const res = await fetch('/api/admin/cases/list'); // fetch case profiles to show district names
      const data = await res.json();
      
      // Fetch advisories from database
      const resAdvisories = await fetch('/api/farmer/history?userId=f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1'); // seeded user id fallback
      const dataAdvisories = await resAdvisories.json();
      if (dataAdvisories.success) {
        setHistory(dataAdvisories.data.weatherAdvisories);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!district || !message.trim()) return;

    setSubmitting(true);
    setSuccessMsg('');
    setError('');

    try {
      const response = await fetch('/api/admin/weather/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          district,
          message,
          drySpellRisk,
          severity
        }),
      });

      const resData = await response.json();
      if (response.ok) {
        setSuccessMsg(resData.message);
        setMessage('');
        await loadAlertHistory();
      } else {
        throw new Error(resData.message || 'Broadcast failed');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error executing alert broadcast');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans text-slate-100">
      
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold text-white">Weather Alerts Broadcasting</h2>
        <p className="text-slate-400 text-sm">Broadcast localized alerts and dry-spell advice directly to farmers' dashboard alert banners.</p>
      </div>

      <div className="grid md:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Broadcast Form */}
        <form onSubmit={handleBroadcast} className="md:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm">
          
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Radio className="h-4 w-4 text-emerald-500" />
            Dispatch District Warning Warning
          </h3>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target District</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="Nagpur">Nagpur</option>
                <option value="Wardha">Wardha</option>
                <option value="Palghar">Palghar</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dry-Spell Threat</label>
              <select
                value={drySpellRisk}
                onChange={(e) => setDrySpellRisk(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
                <option value="critical">Critical Risk</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alert Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="none">Normal (None)</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Advisory explainer (Farmer Dialect / Language)</label>
            <textarea
              required
              rows={4}
              placeholder="e.g. किसान भाइयों, वर्षा न होने के कारण..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 bg-slate-850 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-semibold"
            />
          </div>

          {error && (
            <div className="bg-red-950/60 text-red-400 px-4 py-3 rounded-xl text-xs font-semibold border border-red-900/50">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="bg-green-950/60 text-green-300 px-4 py-3 rounded-xl text-xs font-bold border border-green-800/40 flex items-center gap-1.5 animate-pulse">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              {successMsg}
            </div>
          )}

          <div className="pt-2 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow shadow-emerald-950 flex items-center gap-1.5"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Broadcast Alert
            </button>
          </div>

        </form>

        {/* Right Side: Alert Dispatch Logs */}
        <div className="md:col-span-5 bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm flex flex-col max-h-[500px] overflow-y-auto">
          
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Clock className="h-4 w-4 text-emerald-500" />
            Alert Broadcast Logs
          </h3>

          <div className="space-y-3 flex-1">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
              </div>
            ) : history.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-10 font-medium">No previous alerts logged.</p>
            ) : (
              history.map((h, i) => (
                <div key={i} className="bg-slate-950 p-4 border border-slate-800 rounded-2xl text-xs space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase">
                    <span>Dist: {h.district || 'Nagpur'}</span>
                    <span>{new Date(h.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-350 leading-relaxed font-semibold">"{h.ai_explanation}"</p>
                  <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase inline-block ${
                    h.alert_severity === 'none' ? 'bg-slate-850 text-slate-400' : 'bg-red-950 text-red-400 border border-red-900/30'
                  }`}>
                    Severity: {h.alert_severity}
                  </span>
                </div>
              ))
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
