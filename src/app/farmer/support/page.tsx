'use client';

import React, { useEffect, useState } from 'react';
import { 
  HelpCircle, 
  Send, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  MessageSquare,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

export default function FarmerSupportPage() {
  const { user, language, t } = useApp();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  
  // Chat thread states
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  // Create ticket states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('medium');
  const [creatingTicket, setCreatingTicket] = useState(false);

  const [error, setError] = useState('');

  // Load tickets list
  useEffect(() => {
    if (user) {
      loadTickets();
    }
  }, [user]);

  // Load chat messages when ticket selection changes
  useEffect(() => {
    if (selectedTicketId) {
      loadMessages(selectedTicketId);
    }
  }, [selectedTicketId]);

  const loadTickets = async () => {
    try {
      const res = await fetch(`/api/farmer/support/list?userId=${user?.id}`);
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets);
        if (data.tickets.length > 0 && !selectedTicketId) {
          setSelectedTicketId(data.tickets[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (ticketId: number) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/farmer/support/messages?ticketId=${ticketId}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicketId || !user) return;

    try {
      const response = await fetch('/api/farmer/support/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicketId,
          senderId: user.id,
          senderRole: 'farmer',
          message: newMessage
        }),
      });

      const resData = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, {
          ...resData.data,
          sender_name: user.farmer_name,
          sender_role: 'farmer'
        }]);
        setNewMessage('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim() || !user) return;

    setCreatingTicket(true);
    try {
      const response = await fetch('/api/farmer/support/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: user.id,
          subject,
          description,
          urgency
        }),
      });

      const resData = await response.json();
      if (response.ok) {
        setSubject('');
        setDescription('');
        setUrgency('medium');
        setShowCreateModal(false);
        // Reload list and select new ticket
        await loadTickets();
        setSelectedTicketId(resData.ticket.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingTicket(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mb-3" />
        <span className="text-slate-400 font-bold text-xs">{t('loading')}</span>
      </div>
    );
  }

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header bar */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-900">{t('supportCardTitle')}</h2>
          <p className="text-sm text-slate-500 font-medium">Discuss severe crop infections directly with district agriculture officers.</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-emerald-700 shadow shadow-emerald-100 flex items-center gap-1.5 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {language === 'hi' ? 'नई शिकायत दर्ज करें' : 'Create New Ticket'}
        </button>
      </div>

      <div className="grid md:grid-cols-12 gap-6 items-stretch h-[600px]">
        
        {/* Left Side: Tickets List */}
        <div className="md:col-span-4 bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col overflow-y-auto">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Active Support Cases</h3>
          
          <div className="space-y-2 flex-1">
            {tickets.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">No support tickets opened.</p>
            ) : (
              tickets.map((t) => {
                const active = t.id === selectedTicketId;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all space-y-2 ${
                      active 
                        ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-600/5' 
                        : 'bg-white border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-extrabold text-slate-800 text-xs truncate max-w-[160px]">{t.subject}</h4>
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                        t.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    
                    {t.crop_type && (
                      <p className="text-[10px] font-bold text-slate-400">Crop: {t.crop_type} ({t.ai_disease})</p>
                    )}
                    
                    <span className="block text-[9px] text-slate-400 font-medium">
                      Opened: {new Date(t.created_at).toLocaleDateString()}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Chat Panel */}
        <div className="md:col-span-8 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden relative">
          
          {selectedTicket ? (
            <>
              {/* Header info */}
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">{selectedTicket.subject}</h4>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Ticket ID: #{selectedTicket.id} | Urgency: {selectedTicket.urgency}
                  </span>
                </div>
              </div>

              {/* Chat timeline messages list */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {/* Initial ticket description as first message */}
                <div className="bg-slate-100 p-4 rounded-2xl border border-slate-150 max-w-xl text-xs space-y-1.5">
                  <p className="font-bold text-slate-700">Initial Request Description:</p>
                  <p className="text-slate-600 leading-normal">{selectedTicket.description}</p>
                  <span className="block text-[9px] text-slate-400">
                    {new Date(selectedTicket.created_at).toLocaleString()}
                  </span>
                </div>

                {/* messages mapping */}
                {loadingMessages ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                  </div>
                ) : (
                  messages.map((msg: any) => {
                    const isFarmer = msg.sender_role === 'farmer';
                    const alignment = isFarmer ? 'justify-end' : 'justify-start';
                    const color = isFarmer ? 'bg-emerald-600 text-white' : 'bg-slate-150 text-slate-800 border border-slate-200';
                    const labelColor = isFarmer ? 'text-emerald-700' : 'text-slate-500';

                    return (
                      <div key={msg.id} className={`flex ${alignment}`}>
                        <div className={`p-4 rounded-2xl max-w-sm text-xs space-y-1 ${color}`}>
                          <span className="block font-bold text-[9px] uppercase tracking-wide opacity-80">
                            {isFarmer ? 'You' : msg.sender_name}
                          </span>
                          <p className="leading-normal">{msg.message}</p>
                          <span className="block text-[8px] opacity-60">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Send message text form */}
              {selectedTicket.status !== 'resolved' ? (
                <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 flex gap-3 shrink-0">
                  <input
                    type="text"
                    placeholder={language === 'hi' ? 'विशेषज्ञ को अपना संदेश लिखें...' : 'Type message here to expert...'}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-850 text-xs outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-600 text-white p-2.5 rounded-xl hover:bg-emerald-700 transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <div className="p-4 border-t border-slate-100 bg-green-50 text-green-800 text-xs font-bold text-center shrink-0">
                  This support ticket is marked as resolved and closed.
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <MessageSquare className="h-12 w-12 text-slate-200 mb-2" />
              <p className="text-xs font-bold text-slate-500">Select a support ticket from the sidebar list to view conversation.</p>
            </div>
          )}

        </div>

      </div>

      {/* Modal Dialog for creating a ticket manually */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border rounded-3xl p-6 shadow-2xl max-w-md w-full space-y-4 animate-in fade-in duration-200">
            <h3 className="text-base font-extrabold text-slate-900">Open Escalation Support Ticket</h3>
            
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">Subject (विषय) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rice leaf insect attack details"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-xs font-medium outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">Description (विवरण) *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your issue in details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-xs font-medium outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">Urgency level</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-xs font-medium outline-none"
                >
                  <option value="low">Low urgency</option>
                  <option value="medium">Medium urgency</option>
                  <option value="high">High urgency</option>
                  <option value="critical">Critical urgency</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTicket}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 disabled:opacity-50"
                >
                  {creatingTicket ? 'Creating...' : 'Open Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
