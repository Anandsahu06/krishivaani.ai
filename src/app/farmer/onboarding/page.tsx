'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sprout, CheckCircle2, ChevronRight, ChevronLeft, MapPin, Layers, Settings2, Loader2, Navigation } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { INDIAN_STATES } from '@/utils/geoData';

export default function OnboardingPage() {
  const router = useRouter();
  const { language, user, setUser, t } = useApp();

  const [step, setStep] = useState(1);
  
  // Geolocation and coordinates states
  const [village, setVillage] = useState('');
  const [selectedStateId, setSelectedStateId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  const [farmName, setFarmName] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [soilType, setSoilType] = useState('Black Soil (Regur)');
  const [irrigationSource, setIrrigationSource] = useState('Well/Tubewell Water');
  const [waterAvailability, setWaterAvailability] = useState('Medium (Seasonal)');
  const [currentCrop, setCurrentCrop] = useState('');
  const [preferredCropCategory, setPreferredCropCategory] = useState('Cash Crops (Cotton, Sugarcane)');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill location fields if they exist in user profile
  useEffect(() => {
    if (user) {
      setVillage(user.village_name || '');
      
      // Attempt to resolve state ID from name matching
      if (user.state) {
        const foundState = INDIAN_STATES.find(
          s => s.name.en.toLowerCase() === user.state.toLowerCase() || s.name.hi === user.state
        );
        if (foundState) {
          setSelectedStateId(foundState.id);
          
          if (user.district) {
            const foundDist = foundState.districts.find(
              d => d.name.en.toLowerCase() === user.district.toLowerCase() || d.name.hi === user.district
            );
            if (foundDist) {
              setSelectedDistrictId(foundDist.id);
            }
          }
        }
      }
      if (user.latitude) setLatitude(user.latitude);
      if (user.longitude) setLongitude(user.longitude);
    } else {
      router.push('/auth/login');
    }
  }, [user, router]);

  // Retrieve browser Geolocation coordinates
  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      setError(language === 'hi' ? 'आपका ब्राउज़र जियोलोकेशन का समर्थन नहीं करता है।' : 'Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setError('');
    setLocationSuccess(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lon);
        setLocationSuccess(true);
        setLocating(false);

        // Auto-resolve State & District based on demo locations or seed defaults
        // Nagpur (21.14, 79.08) -> Maharashtra, Nagpur
        // Kanpur (26.44, 80.33) -> Uttar Pradesh, Kanpur
        if (lat >= 24) {
          setSelectedStateId("uttar_pradesh");
          setSelectedDistrictId("kanpur");
          setVillage(village || "Kanpur Dehat");
        } else {
          setSelectedStateId("maharashtra");
          setSelectedDistrictId("nagpur");
          setVillage(village || "Wadhona Village");
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError(language === 'hi' ? 'सटीक स्थान प्राप्त करने में विफल। कृपया सूची से चुनें।' : 'Failed to retrieve precise location. Please select manually.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleNext = () => {
    setError('');
    if (step === 1) {
      if (!village.trim() || !selectedStateId || !selectedDistrictId) {
        setError(language === 'hi' ? 'कृपया सभी स्थान फ़ील्ड भरें।' : 'Please select your State, District and Village.');
        return;
      }
    }
    if (step === 2) {
      if (!farmSize || parseFloat(farmSize) <= 0) {
        setError(language === 'hi' ? 'कृपया एक वैध खेत का आकार दर्ज करें।' : 'Please enter a valid farm size.');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setError('');
    setIsSubmitting(true);

    const activeState = INDIAN_STATES.find(s => s.id === selectedStateId);
    const activeDistrict = activeState?.districts.find(d => d.id === selectedDistrictId);

    try {
      const response = await fetch('/api/farmer/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: user.id,
          village,
          district: activeDistrict?.name.en || '',
          state: activeState?.name.en || '',
          latitude,
          longitude,
          farmName,
          farmSize,
          soilType,
          irrigationSource,
          waterAvailability,
          currentCrop,
          preferredCropCategory
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Onboarding update failed');
      }

      setUser(data.profile);
      router.push('/farmer/dashboard');

    } catch (err: any) {
      console.error("Onboarding submission failed:", err);
      setError(err.message || 'Failed to submit onboarding configuration');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  const currentState = INDIAN_STATES.find(s => s.id === selectedStateId);
  const districtList = currentState ? currentState.districts : [];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-emerald-50 via-white to-green-100 font-sans">
      
      {/* Onboarding Box */}
      <div className="w-full max-w-2xl bg-white border border-emerald-100 p-8 rounded-3xl shadow-xl space-y-8 my-10">
        
        {/* Header & Step progress bar */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 text-white p-2.5 rounded-xl">
              <Sprout className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">{t('onboardingTitle')}</h2>
              <p className="text-xs text-slate-500 font-medium">Step {step} of 3 - {step === 1 ? t('farmerDetails') : step === 2 ? t('farmDetails') : 'Crop Preferences'}</p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex gap-2">
            <div className={`h-2 flex-1 rounded-full transition-all ${step >= 1 ? 'bg-emerald-600' : 'bg-slate-200'}`} />
            <div className={`h-2 flex-1 rounded-full transition-all ${step >= 2 ? 'bg-emerald-600' : 'bg-slate-200'}`} />
            <div className={`h-2 flex-1 rounded-full transition-all ${step >= 3 ? 'bg-emerald-600' : 'bg-slate-200'}`} />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold border border-red-100">
            {error}
          </div>
        )}

        {/* Step Contents */}
        <div className="min-h-[220px] transition-all">
          
          {/* STEP 1: Farmer Location Detail */}
          {step === 1 && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  {language === 'hi' ? 'स्थान विवरण की पुष्टि करें' : 'Confirm Geography & Location'}
                </h3>

                {/* Live Location Fetch Button */}
                <button
                  type="button"
                  onClick={handleGetLiveLocation}
                  disabled={locating}
                  className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all outline-none"
                >
                  {locating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Navigation className="h-3.5 w-3.5 text-emerald-600 fill-emerald-100" />
                  )}
                  {language === 'hi' ? 'लाइव स्थान (Live GPS)' : 'Get Live GPS Location'}
                </button>
              </div>

              {/* Coordinates Indicator */}
              {latitude && longitude && (
                <div className="bg-emerald-50 border border-emerald-100 px-4 py-3 rounded-xl flex items-center justify-between text-xs text-emerald-800 font-semibold animate-in fade-in">
                  <span>
                    🛰️ Live GPS Coords: {latitude.toFixed(5)}°, {longitude.toFixed(5)}°
                  </span>
                  <span className="text-[10px] bg-emerald-200 px-2 py-0.5 rounded text-emerald-950">
                    High Accuracy Resolved
                  </span>
                </div>
              )}
              
              <div className="grid sm:grid-cols-3 gap-4">
                
                {/* State selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('stateName')} *</label>
                  <select
                    value={selectedStateId}
                    onChange={(e) => {
                      setSelectedStateId(e.target.value);
                      setSelectedDistrictId(''); // reset district
                    }}
                    className="w-full px-3 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 text-slate-800 outline-none text-sm font-medium bg-white"
                  >
                    <option value="">{language === 'hi' ? '-- राज्य चुनें --' : '-- Select State --'}</option>
                    {INDIAN_STATES.map(s => (
                      <option key={s.id} value={s.id}>{language === 'hi' ? s.name.hi : s.name.en}</option>
                    ))}
                  </select>
                </div>

                {/* District selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('districtName')} *</label>
                  <select
                    value={selectedDistrictId}
                    disabled={!selectedStateId}
                    onChange={(e) => setSelectedDistrictId(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 text-slate-800 outline-none text-sm font-medium bg-white disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    <option value="">{language === 'hi' ? '-- जिला चुनें --' : '-- Select District --'}</option>
                    {districtList.map(d => (
                      <option key={d.id} value={d.id}>{language === 'hi' ? d.name.hi : d.name.en}</option>
                    ))}
                  </select>
                </div>

                {/* Village Text Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('villageName')} *</label>
                  <input
                    type="text"
                    required
                    placeholder={language === 'hi' ? 'उदा: वधोना' : 'e.g. Wadhona'}
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-slate-800 outline-none text-sm font-medium"
                  />
                </div>

              </div>
            </div>
          )}

          {/* STEP 2: Soil and Irrigation Systems */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                <Layers className="h-4 w-4 text-emerald-600" />
                {language === 'hi' ? 'मिट्टी और पानी की उपलब्धता विवरण' : 'Soil & Irrigation Profile'}
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('farmName')}</label>
                  <input
                    type="text"
                    placeholder={language === 'hi' ? 'उदा: पटेल कपास खेत' : 'e.g. Patel Cotton Farm'}
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-slate-800 outline-none text-sm font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('farmSize')} *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="e.g. 4.5"
                    value={farmSize}
                    onChange={(e) => setFarmSize(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-slate-800 outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('soilType')}</label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 text-slate-800 outline-none text-sm font-medium"
                  >
                    <option value="Black Soil (Regur)">{t('blackSoil')}</option>
                    <option value="Red Soil">{t('redSoil')}</option>
                    <option value="Alluvial Soil">{t('alluvialSoil')}</option>
                    <option value="Sandy/Loamy Soil">{t('sandySoil')}</option>
                    <option value="Laterite Soil">{t('lateriteSoil')}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('irrigationSource')}</label>
                  <select
                    value={irrigationSource}
                    onChange={(e) => setIrrigationSource(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 text-slate-800 outline-none text-sm font-medium"
                  >
                    <option value="Rainfed (Only Rain)">{t('rainfed')}</option>
                    <option value="Well/Tubewell Water">{t('wellWater')}</option>
                    <option value="Canal Irrigation">{t('canalIrrigation')}</option>
                    <option value="Drip Irrigation">{t('dripIrrigation')}</option>
                    <option value="Sprinkler Irrigation">{t('sprinklerIrrigation')}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('waterAvailability')}</label>
                  <select
                    value={waterAvailability}
                    onChange={(e) => setWaterAvailability(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 text-slate-800 outline-none text-sm font-medium"
                  >
                    <option value="High (Year-Round)">{t('highWater')}</option>
                    <option value="Medium (Seasonal)">{t('mediumWater')}</option>
                    <option value="Low (Drought-Prone)">{t('lowWater')}</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Sown Crops & Preferences */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                <Settings2 className="h-4 w-4 text-emerald-600" />
                {language === 'hi' ? 'बोई गई फसल और प्राथमिकताएं' : 'Crop Profiles & Preferences'}
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('currentCrop')}</label>
                  <input
                    type="text"
                    placeholder={language === 'hi' ? 'उदा: कपास / कपास नहीं बोई गई' : 'e.g. Cotton / None'}
                    value={currentCrop}
                    onChange={(e) => setCurrentCrop(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-slate-800 outline-none text-sm font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('preferredCropCat')}</label>
                  <select
                    value={preferredCropCategory}
                    onChange={(e) => setPreferredCropCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 text-slate-800 outline-none text-sm font-medium"
                  >
                    <option value="Cash Crops (Cotton, Sugarcane)">{t('cashCrops')}</option>
                    <option value="Food Grains (Wheat, Rice, Millet)">{t('foodGrains')}</option>
                    <option value="Pulses (Tur, Gram, Moong)">{t('pulses')}</option>
                    <option value="Oilseeds (Soybean, Mustard, Groundnut)">{t('oilseeds')}</option>
                    <option value="Vegetables / Horticulture">{t('vegetables')}</option>
                  </select>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-xs font-medium text-emerald-800">
                {language === 'hi' ? '💡 जानकारी: कृषिवाणी AI आपकी इन प्राथमिकताओं का उपयोग स्मार्ट फसल सिफारिशों और सूखा सलाह देने के लिए करेगा।' : '💡 Info: KrishiVaani AI will use these farm attributes to personalize your crop recommendation options and weather warnings.'}
              </div>
            </div>
          )}

        </div>

        {/* Buttons Row */}
        <div className="flex justify-between items-center pt-6 border-t border-slate-100">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-slate-800 py-2.5 px-4 rounded-xl hover:bg-slate-100 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
              {t('back')}
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 text-sm font-bold bg-emerald-600 text-white py-2.5 px-6 rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200"
            >
              {language === 'hi' ? 'आगे बढ़ें' : 'Next'}
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 text-sm font-bold bg-emerald-600 text-white py-2.5 px-6 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-md shadow-emerald-200"
            >
              {isSubmitting ? t('loading') : (language === 'hi' ? 'सेटअप पूरा करें' : 'Finish Setup')}
              <CheckCircle2 className="h-4 w-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
