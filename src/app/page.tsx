import Link from 'next/link';
import { Sprout, CloudSun, ShieldAlert, Users, Languages, CheckCircle2, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-50 font-sans selection:bg-emerald-200">
      
      {/* Navigation Header */}
      <header className="border-b border-emerald-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-400 to-green-600 p-2.5 rounded-2xl text-white shadow-md shadow-emerald-200">
              <Sprout className="h-6 w-6" />
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
                KrishiVaani AI
              </span>
              <span className="block text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
                Farmer Copilot
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/auth/admin-login" 
              className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors"
            >
              Expert Portal
            </Link>
            <Link 
              href="/auth/login" 
              className="bg-emerald-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-300 transition-all transform hover:-translate-y-0.5"
            >
              Farmer Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-emerald-100/70 border border-emerald-200 px-4 py-2 rounded-full text-emerald-800 text-xs font-bold uppercase tracking-wider">
                <Languages className="h-3.5 w-3.5" />
                Hindi-First & Multilingual Support (हिंदी और क्षेत्रीय भाषाएं)
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight">
                Empowering Small Farmers with <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">AI Intelligence</span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 font-medium">
                Your multilingual AI farming companion for smarter crop decisions, real-time dry-spell alerts, visual crop disease diagnosis, and direct support-centre escalation.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-2xl text-base font-bold shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:shadow-2xl transition-all transform hover:-translate-y-0.5"
                >
                  Get Started (शुरू करें)
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link 
                  href="/auth/signup"
                  className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-2xl text-base font-bold shadow-md hover:bg-slate-50 transition-all"
                >
                  Register New Farm
                </Link>
              </div>

              {/* Trust markers */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                <div>
                  <span className="block text-3xl font-extrabold text-slate-950">95%</span>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Recommendation Match</span>
                </div>
                <div>
                  <span className="block text-3xl font-extrabold text-slate-950">10 Secs</span>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">AI Leaf Diagnosis</span>
                </div>
                <div>
                  <span className="block text-3xl font-extrabold text-slate-950">100%</span>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Expert Escalate Rate</span>
                </div>
              </div>
            </div>

            {/* Visual Callout */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-200 to-green-100 rounded-3xl blur-3xl opacity-30 -z-10 scale-90" />
              <div className="bg-white border border-emerald-100/50 p-6 rounded-3xl shadow-2xl w-full max-w-sm space-y-6 transform hover:scale-[1.02] transition-transform">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 text-red-600 p-2 rounded-xl">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">सूखा चेतावनी (Dry Spell)</h4>
                      <p className="text-xs text-slate-400">Nagpur District</p>
                    </div>
                  </div>
                  <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-1 rounded">High Risk</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm space-y-2">
                  <p className="text-slate-800 font-medium">
                    "किसान भाइयों, अगले 9 दिनों तक वर्षा न होने की आशंका है। कपास में यूरिया का छिड़काव रोक दें और सुबह सिंचाई करें।"
                  </p>
                  <p className="text-xs text-emerald-600 font-bold">Generated by KrishiVaani AI</p>
                </div>

                <div className="flex justify-between items-center bg-emerald-50/70 border border-emerald-100 p-4 rounded-2xl">
                  <span className="text-xs font-bold text-slate-700">Explore in Hindi (हिंदी)</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Modules Section */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Built for Ground-Level Farmer Needs
            </h2>
            <p className="text-slate-600 font-medium">
              We bridge the gap between complex satellite analytics and day-to-day farming choices with clean, voice-and-SMS enabled Indic-language AI interfaces.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-md hover:shadow-xl hover:border-emerald-200 transition-all group">
              <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl w-fit group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <Sprout className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3">
                1. Smart Crop Recommendations
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Input your state, district, soil type, and farm parameters. The rule-based engine coupled with Gemini evaluates crop suitability, sowing timelines, and outputs top-3 recommendation cards with step-by-step next steps.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-500">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Soil health mapping</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Suitability scores</li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-md hover:shadow-xl hover:border-emerald-200 transition-all group">
              <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl w-fit group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <CloudSun className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3">
                2. Weather & Dry-Spell alerts
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Fetches localized weather inputs, automatically evaluates dry-spell hazards using customized rules, and compiles advice sheets advising when to irrigate or pause chemical fertilizer applications.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-500">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Dry-spell alerts</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> 10-day local forecast</li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-md hover:shadow-xl hover:border-emerald-200 transition-all group">
              <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl w-fit group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3">
                3. Crop Health Visual Diagnosis
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Snap leaf images and upload them with a voice note. Gemini processes the multi-modal payload to spot diseases and generate immediate remedies in regional Indic dialects, offering escalation pathways to human experts.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-500">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Image analysis</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Escalation ticketing</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Expert Escalation & Admin Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.15),transparent_40%)]" />
            
            <div className="grid md:grid-cols-12 gap-8 items-center relative z-10">
              <div className="md:col-span-8 space-y-6">
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold">
                  <Users className="h-3.5 w-3.5" />
                  Kendra / Admin Dashboard
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
                  District Agri-Expert Intervention Center
                </h2>
                <p className="text-slate-300 text-base md:text-lg">
                  Whenever severe diseases are detected or AI confidence is low, the platform escalates the ticket directly to the district center. Officers review cases, review leaf files and voice logs, and type direct advisory notes back to the farmer's dashboard.
                </p>
              </div>

              <div className="md:col-span-4 flex md:justify-end">
                <Link 
                  href="/auth/admin-login"
                  className="bg-emerald-500 text-white font-bold px-8 py-4 rounded-2xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 inline-flex items-center gap-2"
                >
                  Access Expert Portal
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-emerald-600" />
            <span className="font-bold text-slate-800">KrishiVaani AI</span>
            <span>- Hackathon MVP</span>
          </div>
          <p>© 2026 KrishiVaani AI. Built for Google Build with AI Hackathon.</p>
        </div>
      </footer>

    </div>
  );
}
