'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Profile {
  id: string;
  phone_number: string;
  farmer_name: string;
  preferred_language: 'hi' | 'en';
  village_name: string;
  district: string;
  state: string;
  latitude?: number;
  longitude?: number;
  role: 'farmer' | 'admin';
}

interface AppContextType {
  language: 'hi' | 'en';
  setLanguage: (lang: 'hi' | 'en') => void;
  user: Profile | null;
  setUser: (user: Profile | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Core multilingual dictionaries for Hindi-first UI
const translations: Record<string, { hi: string; en: string }> = {
  brandName: { hi: "कृषिवाणी AI", en: "KrishiVaani AI" },
  tagline: { hi: "आपका बहुभाषी एआई खेती साथी", en: "Your Multilingual AI Farming Companion" },
  dashboard: { hi: "डैशबोर्ड", en: "Dashboard" },
  cropRecommend: { hi: "फसल सिफारिश", en: "Crop Recommendation" },
  weatherAdvisory: { hi: "मौसम सलाह", en: "Weather Advisory" },
  cropDiagnosis: { hi: "फसल रोग निदान", en: "Crop Diagnosis" },
  requestHelp: { hi: "विशेषज्ञ से मदद", en: "Expert Help" },
  history: { hi: "इतिहास", en: "History" },
  profile: { hi: "प्रोफ़ाइल", en: "Profile" },
  logout: { hi: "लॉगआउट", en: "Logout" },
  adminDashboard: { hi: "एडमिन पैनल", en: "Admin Panel" },
  loading: { hi: "लोड हो रहा है...", en: "Loading..." },
  submit: { hi: "जमा करें", en: "Submit" },
  cancel: { hi: "रद्द करें", en: "Cancel" },
  back: { hi: "पीछे", en: "Back" },
  save: { hi: "सुरक्षित करें", en: "Save" },

  // Dashboard Specific
  welcomeFarmer: { hi: "नमस्ते,", en: "Welcome," },
  latestAlerts: { hi: "महत्वपूर्ण चेतावनियां", en: "Critical Alerts" },
  quickActions: { hi: "त्वरित विकल्प", en: "Quick Actions" },
  recentActivity: { hi: "हाल की गतिविधियां", en: "Recent Activity" },
  cropRecCardTitle: { hi: "फसल की सिफारिश", en: "Crop Recommendation" },
  weatherCardTitle: { hi: "मौसम और सूखा सलाह", en: "Weather & Dry-Spell Advisory" },
  diagnosisCardTitle: { hi: "फसल स्वास्थ्य निदान", en: "Crop Health Diagnosis" },
  supportCardTitle: { hi: "कृषि सहायता केंद्र", en: "Agriculture Support Centre" },
  noAlerts: { hi: "कोई सक्रिय चेतावनी नहीं है। आपकी फसलें सुरक्षित हैं!", en: "No active alerts. Your crops are doing well!" },
  recBtn: { hi: "सिफारिश फॉर्म भरें", en: "Get Recommendations" },
  diagBtn: { hi: "पत्ती का फोटो अपलोड करें", en: "Upload Leaf Photo" },
  weatherBtn: { hi: "विस्तृत मौसम देखें", en: "View Weather Details" },
  supportBtn: { hi: "शिकायत दर्ज करें / टिकट खोलें", en: "Open escalation ticket" },

  // Onboarding & Profile Setup
  onboardingTitle: { hi: "किसान प्रोफ़ाइल और फार्म सेटअप", en: "Farmer Profile & Farm Setup" },
  farmerDetails: { hi: "किसान विवरण", en: "Farmer Details" },
  farmDetails: { hi: "खेत का विवरण", en: "Farm Details" },
  fullName: { hi: "पूरा नाम", en: "Full Name" },
  phoneNumber: { hi: "मोबाइल नंबर", en: "Mobile Number" },
  preferredLang: { hi: "पसंदीदा भाषा", en: "Preferred Language" },
  villageName: { hi: "गांव का नाम", en: "Village Name" },
  districtName: { hi: "जिला", en: "District" },
  stateName: { hi: "राज्य", en: "State" },
  farmName: { hi: "खेत का नाम (वैकल्पिक)", en: "Farm Name (Optional)" },
  farmSize: { hi: "खेत का आकार (एकड़ में)", en: "Farm Size (in Acres)" },
  soilType: { hi: "मिट्टी का प्रकार", en: "Soil Type" },
  irrigationSource: { hi: "सिंचाई का स्रोत", en: "Irrigation Source" },
  waterAvailability: { hi: "पानी की उपलब्धता", en: "Water Availability" },
  currentCrop: { hi: "वर्तमान में बोई गई फसल", en: "Currently Sown Crop" },
  preferredCropCat: { hi: "पसंदीदा फसल श्रेणी", en: "Preferred Crop Category" },

  // Soil types
  blackSoil: { hi: "काली मिट्टी (Regur)", en: "Black Soil (Regur)" },
  redSoil: { hi: "लाल मिट्टी", en: "Red Soil" },
  alluvialSoil: { hi: "जलोढ़ मिट्टी", en: "Alluvial Soil" },
  sandySoil: { hi: "रेतीली मिट्टी", en: "Sandy/Loamy Soil" },
  lateriteSoil: { hi: "लेटराइट मिट्टी", en: "Laterite Soil" },

  // Irrigation types
  rainfed: { hi: "केवल बारिश पर निर्भर (वर्षा-आधारित)", en: "Rainfed (Only Rain)" },
  wellWater: { hi: "कुएं का पानी", en: "Well/Tubewell Water" },
  canalIrrigation: { hi: "नहर/कैनोल सिंचाई", en: "Canal Irrigation" },
  dripIrrigation: { hi: "टपकन (ड्रिप) सिंचाई", en: "Drip Irrigation" },
  sprinklerIrrigation: { hi: "फव्वारा (स्प्रिंकलर) सिंचाई", en: "Sprinkler Irrigation" },

  // Water availability
  highWater: { hi: "प्रचुर मात्रा में (सालों भर)", en: "High (Year-Round)" },
  mediumWater: { hi: "मध्यम (मौसमी)", en: "Medium (Seasonal)" },
  lowWater: { hi: "कम (सूखा प्रवण)", en: "Low (Drought-Prone)" },

  // Crop Categories
  cashCrops: { hi: "नकदी फसलें (कपास, गन्ना)", en: "Cash Crops (Cotton, Sugarcane)" },
  foodGrains: { hi: "खाद्यान्न (गेहूं, चावल, बाजरा)", en: "Food Grains (Wheat, Rice, Millet)" },
  pulses: { hi: "दालें (अरहर, चना, मूंग)", en: "Pulses (Tur, Gram, Moong)" },
  oilseeds: { hi: "तिलहन (सोयाबीन, सरसों, मूंगफली)", en: "Oilseeds (Soybean, Mustard, Groundnut)" },
  vegetables: { hi: "सब्जियां / बागवानी", en: "Vegetables / Horticulture" },
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<'hi' | 'en'>('hi');
  const [user, setUserState] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load configuration from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('krishi_lang');
    const savedUser = localStorage.getItem('krishi_user');

    if (savedLang === 'hi' || savedLang === 'en') {
      setLanguageState(savedLang);
    }
    
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUserState(parsed);
        
        // Silent validation check against database to heal stale local sessions
        fetch(`/api/farmer/active-farm?userId=${parsed.id}`)
          .then(res => {
            if (res.status === 404) {
              console.warn("Stale profile session detected. Clearing storage...");
              localStorage.removeItem('krishi_user');
              setUserState(null);
            }
          })
          .catch(err => console.error("Profile sync check failed:", err));
      } catch (e) {
        console.error("Error parsing saved user session", e);
      }
    }
    setIsLoading(false);
  }, []);

  const setLanguage = (lang: 'hi' | 'en') => {
    setLanguageState(lang);
    localStorage.setItem('krishi_lang', lang);
    if (user) {
      const updatedUser = { ...user, preferred_language: lang };
      setUserState(updatedUser);
      localStorage.setItem('krishi_user', JSON.stringify(updatedUser));
      // update language in backend profiles silently if needed
      fetch('/api/auth/update-lang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, language: lang }),
      }).catch(err => console.error("Silent lang update error", err));
    }
  };

  const setUser = (newUser: Profile | null) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem('krishi_user', JSON.stringify(newUser));
      setLanguageState(newUser.preferred_language || 'hi');
    } else {
      localStorage.removeItem('krishi_user');
    }
  };

  const t = (key: string): string => {
    const dict = translations[key];
    if (!dict) return key;
    return dict[language] || dict['hi'] || key;
  };

  return (
    <AppContext.Provider value={{ language, setLanguage, user, setUser, isLoading, setIsLoading, t }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
