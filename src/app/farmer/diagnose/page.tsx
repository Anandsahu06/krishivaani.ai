'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Image, Mic, Square, Trash2, Sprout, AlertCircle, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function DiagnosePage() {
  const router = useRouter();
  const { user, language, t } = useApp();

  const [cropType, setCropType] = useState('Cotton');
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('');
  const [userNotes, setUserNotes] = useState('');

  // Audio mock recorder states
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordDuration, setRecordDuration] = useState(0);
  const [recordInterval, setRecordInterval] = useState<any>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file.');
        return;
      }
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordDuration(0);
    const interval = setInterval(() => {
      setRecordDuration(prev => prev + 1);
    }, 1000);
    setRecordInterval(interval);
  };

  const stopRecording = () => {
    setIsRecording(false);
    clearInterval(recordInterval);
    setAudioUrl('mock-audio-payload.mp3');
  };

  const deleteRecording = () => {
    setAudioUrl(null);
    setRecordDuration(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');

    if (!image) {
      setError(language === 'hi' ? 'कृपया फसल की पत्ती की तस्वीर अपलोड करें।' : 'Please upload a crop leaf image.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/farmer/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: user.id,
          cropType,
          imageBase64: image,
          mimeType,
          userNotes,
          language
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Diagnosis failed');
      }

      router.push(`/farmer/diagnose/results/${data.caseId}`);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Internal server error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header title */}
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold text-slate-900">{t('cropDiagnosis')}</h2>
        <p className="text-sm text-slate-500 font-medium font-sans">
          {language === 'hi' 
            ? 'अपनी फसल की पत्ती का फोटो खींचे और एआई रोग रिपोर्ट प्राप्त करें।' 
            : 'Capture leaf details, note plant symptoms, and receive AI-derived pathological reports.'}
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Crop select drop */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {language === 'hi' ? 'फसल का प्रकार चुनें' : 'Select Sown Crop'}
            </label>
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 text-slate-800 outline-none text-sm font-medium"
            >
              <option value="Cotton">Cotton (कपास)</option>
              <option value="Rice/Paddy">Rice / Paddy (धान/चावल)</option>
              <option value="Wheat">Wheat (गेहूं)</option>
              <option value="Soybean">Soybean (सोयाबीन)</option>
              <option value="Pigeon Pea">Pigeon Pea / Tur (अरहर)</option>
              <option value="Vegetables">Vegetables (सब्जियां)</option>
            </select>
          </div>

          {/* Photo upload zone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {language === 'hi' ? 'पत्ती का फोटो अपलोड करें' : 'Crop Leaf Photo *'}
            </label>
            
            {!image ? (
              <div className="border-2 border-dashed border-slate-200 hover:border-emerald-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Camera className="h-10 w-10 text-slate-400 mb-3" />
                <p className="text-xs font-bold text-slate-700">
                  {language === 'hi' ? 'कैमरा खोलें या गैलरी से चुनें' : 'Take a photo or choose from files'}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP formats up to 5MB</p>
              </div>
            ) : (
              <div className="relative border border-slate-200 rounded-2xl overflow-hidden max-h-72 flex justify-center bg-slate-50">
                <img 
                  src={image} 
                  alt="Crop Leaf Preview" 
                  className="object-contain max-h-72" 
                />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="absolute top-3 right-3 bg-red-600 text-white p-2 rounded-xl shadow hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* User notes text area */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {language === 'hi' ? 'लक्षण लिखें (वैकल्पिक)' : 'Describe Symptoms (Optional)'}
            </label>
            <textarea
              placeholder={language === 'hi' ? 'उदा: पत्तियों पर पीले धब्बे आ गए हैं और वे झड़ रही हैं...' : 'e.g. Yellow patches on leaves, slow growth...'}
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 text-slate-800 outline-none text-sm font-medium"
            />
          </div>

          {/* Voice Note Section */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              {language === 'hi' ? 'आवाज संदेश जोड़ें (वैकल्पिक)' : 'Add Voice Note (Optional)'}
            </label>

            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-150">
              {!isRecording && !audioUrl ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="bg-emerald-100 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-200 transition-all inline-flex items-center gap-1.5"
                >
                  <Mic className="h-4 w-4 text-emerald-700" />
                  {language === 'hi' ? 'रिकॉर्ड शुरू करें' : 'Record Voice Description'}
                </button>
              ) : isRecording ? (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="bg-red-100 text-red-800 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-red-200 transition-all inline-flex items-center gap-1.5 animate-pulse"
                >
                  <Square className="h-4 w-4 text-red-600 fill-red-600" />
                  {language === 'hi' ? `रिकॉर्डिंग रोकें (${recordDuration}s)` : `Stop Recording (${recordDuration}s)`}
                </button>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-slate-700">Voice Note Recorded (0:0{recordDuration})</span>
                  </div>
                  <button
                    type="button"
                    onClick={deleteRecording}
                    className="text-red-600 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold border border-red-100">
              {error}
            </div>
          )}

          {/* Submit btn */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white font-bold px-6 py-3.5 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-100 text-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {language === 'hi' ? 'एआई निदान चल रहा है...' : 'Analyzing plant tissues...'}
                </>
              ) : (
                <>
                  {language === 'hi' ? 'रोग का पता लगाएं' : 'Identify Leaf Issue'}
                </>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
