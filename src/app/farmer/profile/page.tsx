'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, MapPin, Layers, Settings, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, language, t } = useApp();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  // Profile fields
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');

  // Farm fields
  const [farmSize, setFarmSize] = useState('');
  const [soilType, setSoilType] = useState('Black Soil (Regur)');
  const [irrigationSource, setIrrigationSource] = useState('Well/Tubewell Water');
  const [waterAvailability, setWaterAvailability] = useState('Medium (Seasonal)');
  const [currentCrop, setCurrentCrop] = useState('');
  const [preferredCropCategory, setPreferredCropCategory] = useState('Cash Crops (Cotton, Sugarcane)');

  useEffect(() => {
    if (user) {
      fetch(`/api/farmer/active-farm?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setName(data.profile.farmer_name || '');
            setVillage(data.profile.village_name || '');
            setDistrict(data.profile.district || '');
            setState(data.profile.state || '');
            if (data.farm) {
              setFarmSize(data.farm.total_size_acres?.toString() || '');
              setSoilType(data.farm.soil_type || 'Black Soil (Regur)');
              setIrrigationSource(data.farm.irrigation_source || 'Well/Tubewell Water');
              setWaterAvailability(data.farm.water_availability || 'Medium (Seasonal)');
              setCurrentCrop(data.farm.current_crop || '');
              setPreferredCropCategory(data.farm.preferred_crop_category || 'Cash Crops (Cotton, Sugarcane)');
            }
          }
        })
        .catch(err => console.error("Error loading profile", err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setSuccessMsg('');
    setUpdating(true);

    try {
      const response = await fetch('/api/farmer/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: user.id,
          name,
          language,
          village,
          district,
          state,
          farmSize,
          soilType,
          irrigationSource,
          waterAvailability,
          currentCrop,
          preferredCropCategory
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data.profile);
        setSuccessMsg(language === 'hi' ? 'प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!' : 'Profile updated successfully!');
      } else {
        throw new Error(data.message || 'Update failed');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Server error');
    } finally {
      setUpdating(false);
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-900">{t('profile')}</h2>
          <p className="text-sm text-slate-500 font-medium">Manage farmer settings and farm specifications.</p>
        </div>
        <Link 
          href="/farmer/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-white border border-slate-200 px-4 py-2 rounded-xl"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('back')}
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* STEP 1: Personal Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <User className="h-4 w-4 text-emerald-600" />
              {language === 'hi' ? 'किसान का विवरण' : 'Farmer Settings'}
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('fullName')}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm font-medium outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('phoneNumber')}</label>
                <input
                  type="tel"
                  disabled
                  value={user?.phone_number}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-sm font-medium outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* STEP 2: Location details */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              {language === 'hi' ? 'स्थान विवरण' : 'Location details'}
            </h3>
            
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('villageName')}</label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm font-medium outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('districtName')}</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm font-medium outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('stateName')}</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm font-medium outline-none"
                />
              </div>
            </div>
          </div>

          {/* STEP 3: Farm specifications */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Layers className="h-4 w-4 text-emerald-600" />
              {t('farmDetails')}
            </h3>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('farmSize')}</label>
                <input
                  type="number"
                  step="0.1"
                  value={farmSize}
                  onChange={(e) => setFarmSize(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm font-medium outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('soilType')}</label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm font-medium outline-none"
                >
                  <option value="Black Soil (Regur)">{t('blackSoil')}</option>
                  <option value="Red Soil">{t('redSoil')}</option>
                  <option value="Alluvial Soil">{t('alluvialSoil')}</option>
                  <option value="Sandy/Loamy Soil">{t('sandySoil')}</option>
                  <option value="Laterite Soil">{t('lateriteSoil')}</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('irrigationSource')}</label>
                <select
                  value={irrigationSource}
                  onChange={(e) => setIrrigationSource(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm font-medium outline-none"
                >
                  <option value="Rainfed (Only Rain)">{t('rainfed')}</option>
                  <option value="Well/Tubewell Water">{t('wellWater')}</option>
                  <option value="Canal Irrigation">{t('canalIrrigation')}</option>
                  <option value="Drip Irrigation">{t('dripIrrigation')}</option>
                  <option value="Sprinkler Irrigation">{t('sprinklerIrrigation')}</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('waterAvailability')}</label>
                <select
                  value={waterAvailability}
                  onChange={(e) => setWaterAvailability(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm font-medium outline-none"
                >
                  <option value="High (Year-Round)">{t('highWater')}</option>
                  <option value="Medium (Seasonal)">{t('mediumWater')}</option>
                  <option value="Low (Drought-Prone)">{t('lowWater')}</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('currentCrop')}</label>
                <input
                  type="text"
                  value={currentCrop}
                  onChange={(e) => setCurrentCrop(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm font-medium outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('preferredCropCat')}</label>
                <select
                  value={preferredCropCategory}
                  onChange={(e) => setPreferredCropCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm font-medium outline-none"
                >
                  <option value="Cash Crops (Cotton, Sugarcane)">{t('cashCrops')}</option>
                  <option value="Food Grains (Wheat, Rice, Millet)">{t('foodGrains')}</option>
                  <option value="Pulses (Tur, Gram, Moong)">{t('pulses')}</option>
                  <option value="Oilseeds (Soybean, Mustard, Groundnut)">{t('oilseeds')}</option>
                  <option value="Vegetables / Horticulture">{t('vegetables')}</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold border border-red-100">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="bg-green-50 text-emerald-800 px-4 py-3 rounded-xl text-xs font-bold border border-emerald-100 flex items-center gap-1.5 animate-bounce">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              {successMsg}
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={updating}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white font-bold px-6 py-3.5 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg text-sm"
            >
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving updates...
                </>
              ) : (
                'Save Profile Configuration'
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
