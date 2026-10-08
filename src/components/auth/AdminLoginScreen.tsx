import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Shield, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Landmark, 
  ArrowLeft,
  KeyRound,
  Sparkles,
  Fingerprint
} from 'lucide-react';

export const AdminLoginScreen: React.FC = () => {
  const { language, toggleLanguage, adminLogin, setAppMode } = useApp();

  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUsername || !adminPassword) {
      setErrorMessage(language === 'mr' ? 'कृपया प्रशासक युझरनेम आणि पासवर्ड प्रविष्ट करा.' : 'Please enter Admin username and password.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    const success = await adminLogin(adminUsername, adminPassword);
    setIsSubmitting(false);

    if (!success) {
      setErrorMessage(
        language === 'mr' 
          ? 'अवैध ॲडमिन युझरनेम किंवा पासवर्ड. कृपया पुन्हा प्रयत्न करा (उदा. admin / admin123).' 
          : 'Invalid Admin username or password. Please try again (e.g. admin / admin123).'
      );
    }
  };

  const handleReturnToPublic = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
    }
    setAppMode('gateway');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white flex flex-col justify-between p-4 md:p-8 font-sans selection:bg-purple-600 selection:text-white relative overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Top Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6 border-b border-white/10 relative z-10">
        <button
          onClick={handleReturnToPublic}
          className="flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl border border-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'mr' ? 'सार्वजनिक पोर्टलवर परत जा' : 'Return to Public Portal'}</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
            {language === 'mr' ? 'गोपनीय प्रशासकीय प्रवेश' : 'Restricted Admin Access'}
          </span>
        </div>
      </header>

      {/* Main Login Box */}
      <main className="max-w-md w-full mx-auto my-auto py-8 relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl text-white rounded-3xl shadow-2xl p-6 md:p-8 border border-purple-500/30 space-y-6 relative">
          
          {/* Top Security Icon & Badge */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-500 p-4 flex items-center justify-center shadow-xl shadow-purple-900/40 border border-purple-400/40">
              <ShieldCheck className="w-full h-full text-white" />
            </div>
            
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              {language === 'mr' ? 'मुख्य प्रशासक लॉगिन' : 'Super Admin Portal'}
            </h1>
            <p className="text-xs text-purple-200/70 font-medium">
              {language === 'mr' 
                ? 'आपली ग्रामपंचायत - सुरक्षित सिस्टीम ॲडमिनिस्ट्रेशन' 
                : 'Aapli Gram Panchayat - Master System Administration'}
            </p>
          </div>

          {/* Credentials Helper Box */}
          <div className="p-3 bg-purple-950/60 border border-purple-500/40 rounded-2xl flex items-center justify-between text-xs text-purple-200 shadow-inner">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <span className="font-extrabold block text-purple-100 text-[11px]">
                  {language === 'mr' ? 'मास्टर ॲडमिन क्रेडेंशियल्स:' : 'Admin Credentials:'}
                </span>
                <span className="text-[10px] font-mono text-purple-300">
                  User: <strong>admin</strong> | Pass: <strong>admin123</strong>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setAdminUsername('admin');
                setAdminPassword('admin123');
              }}
              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-[10px] transition-all active:scale-95 shadow-xs shrink-0"
            >
              ✨ {language === 'mr' ? 'ऑटो-फिल' : 'Auto Fill'}
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-950/70 border border-red-500/50 text-red-200 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {language === 'mr' ? 'प्रशासक युझरनेम / अधिकृत ईमेल' : 'Admin Username or Official Email'} <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="admin किंवा admin@grampanchayat.gov.in"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs md:text-sm rounded-xl border border-purple-500/30 bg-slate-950/70 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {language === 'mr' ? 'गुप्त पासवर्ड (Master Password)' : 'Master Password'} <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-xs md:text-sm rounded-xl border border-purple-500/30 bg-slate-950/70 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs md:text-sm rounded-xl shadow-lg shadow-purple-900/50 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 border border-purple-400/40 mt-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>
                {isSubmitting 
                  ? (language === 'mr' ? 'प्रमाणीकरण करत आहे...' : 'Authenticating...') 
                  : (language === 'mr' ? 'प्रशासक पॅनेलमध्ये प्रवेश करा' : 'Login to Admin Workspace')}
              </span>
            </button>
          </form>

          {/* Security Notice */}
          <div className="pt-4 border-t border-white/10 text-center">
            <p className="text-[10px] text-slate-400">
              🔒 256-Bit SSL Encrypted • Direct Role-Based Authorization
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto pt-6 text-center text-xs text-slate-500 relative z-10">
        <p>© 2026 महाराष्ट्र शासन • आपली ग्रामपंचायत सुरक्षित प्रशासन महापोर्टल</p>
      </footer>
    </div>
  );
};
