export interface GeoItem {
  id: string;
  name: {
    en: string;
    hi: string;
  };
}

export interface StateData extends GeoItem {
  districts: GeoItem[];
}

export const INDIAN_STATES: StateData[] = [
  {
    id: "uttar_pradesh",
    name: { en: "Uttar Pradesh", hi: "उत्तर प्रदेश" },
    districts: [
      { id: "kanpur", name: { en: "Kanpur", hi: "कानपुर" } },
      { id: "lucknow", name: { en: "Lucknow", hi: "लखनऊ" } },
      { id: "varanasi", name: { en: "Varanasi", hi: "वाराणसी" } },
      { id: "prayagraj", name: { en: "Prayagraj", hi: "प्रयागराज" } },
      { id: "agra", name: { en: "Agra", hi: "आगरा" } },
      { id: "meerut", name: { en: "Meerut", hi: "मेरठ" } },
      { id: "gorakhpur", name: { en: "Gorakhpur", hi: "गोरखपुर" } },
      { id: "jhansi", name: { en: "Jhansi", hi: "झाँसी" } }
    ]
  },
  {
    id: "maharashtra",
    name: { en: "Maharashtra", hi: "महाराष्ट्र" },
    districts: [
      { id: "nagpur", name: { en: "Nagpur", hi: "नागपुर" } },
      { id: "wardha", name: { en: "Wardha", hi: "वर्धा" } },
      { id: "palghar", name: { en: "Palghar", hi: "पालघर" } },
      { id: "pune", name: { en: "Pune", hi: "पुणे" } },
      { id: "mumbai", name: { en: "Mumbai", hi: "मुंबई" } },
      { id: "nashik", name: { en: "Nashik", hi: "नाशिक" } },
      { id: "aurangabad", name: { en: "Aurangabad", hi: "औरंगाबाद" } },
      { id: "amravati", name: { en: "Amravati", hi: "अमरावती" } }
    ]
  },
  {
    id: "madhya_pradesh",
    name: { en: "Madhya Pradesh", hi: "मध्य प्रदेश" },
    districts: [
      { id: "bhopal", name: { en: "Bhopal", hi: "भोपाल" } },
      { id: "indore", name: { en: "Indore", hi: "इंदौर" } },
      { id: "jabalpur", name: { en: "Jabalpur", hi: "जबलपुर" } },
      { id: "gwalior", name: { en: "Gwalior", hi: "ग्वालियर" } },
      { id: "ujjain", name: { en: "Ujjain", hi: "उज्जैन" } }
    ]
  },
  {
    id: "punjab",
    name: { en: "Punjab", hi: "पंजाब" },
    districts: [
      { id: "ludhiana", name: { en: "Ludhiana", hi: "लुधियाना" } },
      { id: "amritsar", name: { en: "Amritsar", hi: "अमृतसर" } },
      { id: "jalandhar", name: { en: "Jalandhar", hi: "जालंधर" } },
      { id: "patiala", name: { en: "Patiala", hi: "पटियाला" } }
    ]
  },
  {
    id: "gujarat",
    name: { en: "Gujarat", hi: "गुजरात" },
    districts: [
      { id: "ahmedabad", name: { en: "Ahmedabad", hi: "अहमदाबाद" } },
      { id: "surat", name: { en: "Surat", hi: "सूरत" } },
      { id: "vadodara", name: { en: "Vadodara", hi: "वडोदरा" } },
      { id: "rajkot", name: { en: "Rajkot", hi: "राजकोट" } }
    ]
  },
  {
    id: "rajasthan",
    name: { en: "Rajasthan", hi: "राजस्थान" },
    districts: [
      { id: "jaipur", name: { en: "Jaipur", hi: "जयपुर" } },
      { id: "jodhpur", name: { en: "Jodhpur", hi: "जोधपुर" } },
      { id: "udaipur", name: { en: "Udaipur", hi: "उदयपुर" } },
      { id: "kota", name: { en: "Kota", hi: "कोटा" } },
      { id: "bikaner", name: { en: "Bikaner", hi: "बीकानेर" } }
    ]
  },
  {
    id: "bihar",
    name: { en: "Bihar", hi: "बिहार" },
    districts: [
      { id: "patna", name: { en: "Patna", hi: "पटना" } },
      { id: "gaya", name: { en: "Gaya", hi: "गया" } },
      { id: "bhagalpur", name: { en: "Bhagalpur", hi: "भागलपुर" } },
      { id: "muzaffarpur", name: { en: "Muzaffarpur", hi: "मुजफ्फरपुर" } }
    ]
  },
  {
    id: "karnataka",
    name: { en: "Karnataka", hi: "कर्नाटक" },
    districts: [
      { id: "bengaluru", name: { en: "Bengaluru", hi: "बेंगलुरु" } },
      { id: "mysuru", name: { en: "Mysuru", hi: "मैसूरु" } },
      { id: "hubballi", name: { en: "Hubballi", hi: "हुबली" } },
      { id: "mangaluru", name: { en: "Mangaluru", hi: "मंगलूरु" } }
    ]
  },
  {
    id: "tamil_nadu",
    name: { en: "Tamil Nadu", hi: "तमिलनाडु" },
    districts: [
      { id: "chennai", name: { en: "Chennai", hi: "चेन्नई" } },
      { id: "coimbatore", name: { en: "Coimbatore", hi: "कोयंबटूर" } },
      { id: "madurai", name: { en: "Madurai", hi: "मदुरै" } },
      { id: "salem", name: { en: "Salem", hi: "सेलम" } }
    ]
  },
  {
    id: "west_bengal",
    name: { en: "West Bengal", hi: "पश्चिम बंगाल" },
    districts: [
      { id: "kolkata", name: { en: "Kolkata", hi: "कोलकाता" } },
      { id: "howrah", name: { en: "Howrah", hi: "हावड़ा" } },
      { id: "darjeeling", name: { en: "Darjeeling", hi: "दार्जिलिंग" } },
      { id: "siliguri", name: { en: "Siliguri", hi: "सिलीगुड़ी" } }
    ]
  }
];
