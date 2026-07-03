'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Sprout, 
  MapPin, 
  Layers, 
  Loader2, 
  ShieldCheck, 
  AlertTriangle,
  Send,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function AdminCaseDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user: expertUser } = useApp();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  // Form states
  const [expertNotes, setExpertNotes] = useState('');
  const [status, setStatus] = useState('resolved');
  const [submitting, setSubmitting] = useState(false);

  // Chat message state
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (id) {
      loadCaseDetails();
    }
  }, [id]);

  const loadCaseDetails = async () => {
    try {
      const res = await fetch(`/api/admin/cases/details?caseId=${id}`);
      const resData = await res.json();
      if (resData.success) {
        setData(resData.data);
        setStatus(resData.data.caseDetails.status || 'resolved');
      } else {
        setError(resData.error || 'Failed to load case details');
      }
    } catch (err) {
      console.error(err);
      setError('Error fetching case detailed parameters');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expertNotes.trim() || !expertUser) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/admin/cases/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: id,
          ticketId: data.ticket?.id || null,
          expertId: expertUser.id,
          status,
          expertNotes
        }),
      });

      if (response.ok) {
        setExpertNotes('');
        // Reload details
        await loadCaseDetails();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !data.ticket || !expertUser) return;

    try {
      const response = await fetch('/api/farmer/support/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: data.ticket.id,
          senderId: expertUser.id,
          senderRole: 'expert',
          message: newMessage
        }),
      });

      if (response.ok) {
        setNewMessage('');
        await loadCaseDetails();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-950 text-slate-100 min-h-screen">
        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mb-3" />
        <span className="text-slate-500 font-bold text-xs">Fetching leaf records and coordinates...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4">
        <p className="text-red-400 font-bold">{error || 'Case file not found'}</p>
        <Link href="/admin/cases" className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-400 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Go back
        </Link>
      </div>
    );
  }

  const { caseDetails, farm, ticket, messages } = data;
  const isEscalated = caseDetails.status === 'escalated' || ticket;

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans text-slate-100">
      
      {/* Header bar */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <Link 
            href="/admin/cases" 
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Cases
          </Link>
          <h2 className="text-xl font-extrabold text-white">Case Inspection: Case #{caseDetails.id}</h2>
        </div>

        <span className={`text-[10px] font-extrabold px-3 py-1 rounded uppercase ${
          caseDetails.status === 'resolved' ? 'bg-green-950 text-green-400 border border-green-900/30' : 'bg-amber-950 text-amber-400 border border-amber-900/30'
        }`}>
          Status: {caseDetails.status}
        </span>
      </div>

      <div className="grid md:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Farmer & Geography Details */}
        <div className="md:col-span-5 bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 flex flex-col">
          
          {/* Section 1: Farmer Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <MapPin className="h-4 w-4 text-emerald-500" />
              Farmer & Location Info
            </h3>
            <div className="text-xs space-y-1 text-slate-300">
              <p><span className="text-slate-500 font-bold">Farmer Name:</span> {caseDetails.farmer_name}</p>
              <p><span className="text-slate-500 font-bold">Mobile Phone:</span> {caseDetails.phone_number}</p>
              <p><span className="text-slate-500 font-bold">Village / District:</span> {caseDetails.village_name}, {caseDetails.district} ({caseDetails.state})</p>
              <p><span className="text-slate-500 font-bold">Preferred Language:</span> {caseDetails.preferred_language?.toUpperCase()}</p>
            </div>
          </div>

          {/* Section 2: Farm profile details */}
          {farm && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                <Layers className="h-4 w-4 text-emerald-500" />
                Farm Profile Context
              </h3>
              <div className="text-xs space-y-1 text-slate-300">
                <p><span className="text-slate-500 font-bold">Farm size:</span> {farm.total_size_acres} Acres</p>
                <p><span className="text-slate-500 font-bold">Soil composition:</span> {farm.soil_type}</p>
                <p><span className="text-slate-500 font-bold">Water availability:</span> {farm.water_availability}</p>
                <p><span className="text-slate-500 font-bold">Irrigation system:</span> {farm.irrigation_source}</p>
              </div>
            </div>
          )}

          {/* Section 3: Visual file upload */}
          <div className="space-y-3 flex-1 flex flex-col justify-end">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Crop leaf visual upload</h3>
            <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 max-h-60 flex justify-center">
              <img 
                src={caseDetails.image_url || 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800'} 
                alt="Farmer crop leaf upload" 
                className="object-contain max-h-60"
              />
            </div>
            <p className="text-[10px] text-slate-400 text-center font-medium">Sourced crop: {caseDetails.crop_type}</p>
          </div>

        </div>

        {/* Right Side: Automated diagnosis details & expert form */}
        <div className="md:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col space-y-6 justify-between">
          
          {/* Section 1: AI findings */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Sprout className="h-4 w-4 text-emerald-500" />
                AI Diagnosis Report
              </h3>
              <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">
                Confidence Match: {Math.round(caseDetails.ai_confidence * 100)}%
              </span>
            </div>

            <div className="text-xs space-y-3">
              <p><span className="text-slate-400 font-bold">AI Identified disease:</span> <span className="text-white font-extrabold">{caseDetails.ai_disease}</span></p>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Remedy Treatment returned:</span>
                <p className="text-slate-350 leading-relaxed font-semibold">{caseDetails.ai_remedy}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Support Ticket conversational log */}
          {isEscalated && ticket && (
            <div className="border-t border-slate-800 pt-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Ticket Chat log (Conversational thread)</h4>
              
              <div className="max-h-40 overflow-y-auto bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-3">
                <p className="text-slate-400 italic">Farmer description: "{ticket.description}"</p>
                
                {messages.map((msg: any) => {
                  const isFarmer = msg.sender_role === 'farmer';
                  return (
                    <div key={msg.id} className={`flex ${isFarmer ? 'justify-start' : 'justify-end'}`}>
                      <div className={`p-2.5 rounded-xl max-w-xs ${isFarmer ? 'bg-slate-900 border border-slate-800 text-slate-300' : 'bg-emerald-950 text-emerald-300 border border-emerald-900/30'}`}>
                        <span className="block font-bold text-[8px] uppercase opacity-75">{isFarmer ? 'Farmer' : 'Expert Response'}</span>
                        <p>{msg.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat send message input */}
              {caseDetails.status !== 'resolved' && (
                <form onSubmit={handleSendChatMessage} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Send update message directly to farmer's support thread..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="bg-slate-800 text-emerald-400 p-2 border border-slate-700 rounded-xl hover:bg-slate-700"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Section 3: Expert writeback Form */}
          {caseDetails.status !== 'resolved' ? (
            <form onSubmit={handleResolve} className="border-t border-slate-800 pt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Expert Intervention notes</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Enter diagnostic details, chemical/organic treatment guidelines, spray schedules, etc..."
                  value={expertNotes}
                  onChange={(e) => setExpertNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-850 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Update status</span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  >
                    <option value="resolved">Resolved & Close Case</option>
                    <option value="advice_sent">Send Advice (Keep Open)</option>
                    <option value="expert_assigned">Assign & Pending Review</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow shadow-emerald-950 flex items-center gap-1.5"
                >
                  {submitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  Submit Decision
                </button>
              </div>

            </form>
          ) : (
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <div className="text-xs space-y-1">
                <span className="font-bold text-white block">Case resolved and closed by Specialist.</span>
                <p className="text-slate-400">Response notes logged: "{caseDetails.expert_notes || 'No notes saved'}"</p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
