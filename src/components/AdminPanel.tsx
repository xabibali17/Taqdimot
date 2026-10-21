import React, { useState, useEffect, useRef } from 'react';
import { PaymentReceipt, PromoCode, Language, AppSettings } from '../types';
import { translations } from '../locales/translations';
import { 
  ShieldCheck, BarChart3, CheckCircle2, XCircle, 
  Gift, Send, Key, Lock, ArrowLeft, RefreshCw, 
  Users, TrendingUp, DollarSign, Eye, EyeOff, Sparkles, 
  Settings, Image, Radio, HelpCircle, Save, Upload, LogOut
} from 'lucide-react';

interface AdminPanelProps {
  currentUsername: string;
  onBack: () => void;
  lang: Language;
  onUpdateSettings?: (newSettings: AppSettings) => void;
  onReceiptApproved?: (amount: number) => void;
  onLockSession?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  currentUsername, 
  onBack, 
  lang,
  onUpdateSettings,
  onReceiptApproved,
  onLockSession,
}) => {
  const t = translations[lang];

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [adminPasscode, setAdminPasscode] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  // Active admin tab: Dynamic Settings, Stats, Receipts, Promos, Broadcast
  const [adminTab, setAdminTab] = useState<'settings' | 'stats' | 'receipts' | 'promos' | 'broadcast'>('settings');

  // File input refs for gallery uploads
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Dynamic App Settings State
  const [settings, setSettings] = useState<AppSettings>({
    botName: '@TAQDIMIY_BOT',
    botUsername: '@TAQDIMIY_BOT',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    supportUsername: '@TaqdimiySupport',
    supportText: 'Savollar, to\'lovlar yoki hamkorlik bo\'yicha rasmiy qo\'llab-quvvatlash xizmati bilan bog\'laning.',
    developerInfo: 'Ta\'lim AI & Telegram Bot Dev Team (v3.2 Enterprise)',
    cardNumber: '8600 5304 1892 4108',
    cardHolder: 'RAXMATULLAYEV V. (Uzcard / Humo)',
    channel1: '@taqdimotlar_kanali',
    channel2: '@talim_yangiliklari',
    referralBonusAmount: 5000,
    initialBalanceAmount: 10000,
    tierPrices: {
      standart: 10000,
      premium: 20000,
      pro: 35000,
    },
    servicePrices: {
      referat: 15000,
      mustaqil_ish: 15000,
      kurs_ishi: 30000,
      tezis: 12000,
      test: 8000,
      insho: 10000,
      maqola: 25000,
    },
    welcomeMessage: 'Assalomu alaykum! @TAQDIMIY_BOT xizmatiga xush kelibsiz. Eng tezkor va sifatli taqdimot hamda akademik ishlar bu yerda!',
  });
  const [settingsSaved, setSettingsSaved] = useState<boolean>(false);

  // File Upload from Gallery handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'coverUrl' | 'avatarUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64Data = reader.result;
        setSettings(prev => ({
          ...prev,
          [field]: base64Data
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 14890,
    activeToday: 1840,
    totalGenerations: 42350,
    totalRevenueUz: 84600000,
    pendingReceiptsCount: 2,
    activePromosCount: 4,
    botStatus: 'Online',
  });

  // Receipts
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [receiptLoading, setReceiptLoading] = useState<boolean>(false);

  // Promos
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [newPromoCode, setNewPromoCode] = useState<string>('');
  const [newPromoType, setNewPromoType] = useState<'balance' | 'vip'>('vip');
  const [newPromoValue, setNewPromoValue] = useState<number>(3);
  const [newPromoLimit, setNewPromoLimit] = useState<number>(50);

  // Broadcast
  const [broadcastTitle, setBroadcastTitle] = useState<string>('');
  const [broadcastContent, setBroadcastContent] = useState<string>('');
  const [broadcastSent, setBroadcastSent] = useState<boolean>(false);

  // Bot Token
  const [showToken, setShowToken] = useState<boolean>(false);
  const BOT_TOKEN = '8916622173:AAGgrPrbiuvS3WEU7_lpX792zZZ7ht3-CTU';

  const fetchAdminData = async () => {
    try {
      const setRes = await fetch('/api/settings');
      const setData = await setRes.json();
      if (setData) setSettings(prev => ({ ...prev, ...setData }));

      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      const receiptsRes = await fetch('/api/admin/receipts');
      const receiptsData = await receiptsRes.json();
      setReceipts(receiptsData);

      const promosRes = await fetch('/api/admin/promos');
      const promosData = await promosRes.json();
      setPromos(promosData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [isAuthenticated]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasscode === '1273917582' || adminPasscode === '777' || adminPasscode.toLowerCase() === 'r_vf7') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Noto\'g\'ri maxfiy xavfsizlik kodi!');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSettingsSaved(true);
        try {
          localStorage.setItem('taqdimiy_global_settings', JSON.stringify(settings));
        } catch {}
        if (onUpdateSettings) onUpdateSettings(settings);
        setTimeout(() => setSettingsSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateReceipt = async (id: string, status: 'approved' | 'rejected', amount: number) => {
    setReceiptLoading(true);
    try {
      await fetch(`/api/admin/receipts/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (status === 'approved' && onReceiptApproved) {
        onReceiptApproved(amount);
      }
      fetchAdminData();
    } catch (err) {
      console.error(err);
    } finally {
      setReceiptLoading(false);
    }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim()) return;

    try {
      await fetch('/api/admin/promos/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newPromoCode,
          type: newPromoType,
          value: Number(newPromoValue),
          remaining: Number(newPromoLimit),
        }),
      });
      setNewPromoCode('');
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastContent) return;

    try {
      await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: broadcastTitle,
          content: broadcastContent,
        }),
      });
      setBroadcastSent(true);
      setBroadcastTitle('');
      setBroadcastContent('');
      setTimeout(() => setBroadcastSent(false), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-in fade-in duration-200">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-bold text-white mb-1">
            Maxfiy Boshqaruv Paneli
          </h2>
          <p className="text-xs text-amber-400 font-semibold mb-6">
            Diqqat: Ushbu panel faqat tizim administratori uchun ochiq.
          </p>

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Administrator xavfsizlik kodi
              </label>
              <input
                type="password"
                value={adminPasscode}
                onChange={(e) => setAdminPasscode(e.target.value)}
                placeholder="Parolni kiriting..."
                className="w-full p-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            {authError && (
              <p className="text-xs text-red-400 font-medium">{authError}</p>
            )}

            <button
              type="submit"
              className="w-full min-h-[46px] py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-600/20"
            >
              Kirishni tasdiqlash
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <button
              onClick={onBack}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              Foydalanuvchi interfeysiga qaytish
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 pb-28 space-y-6 animate-in fade-in duration-200">
      {/* Admin Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="min-h-[40px] flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Chiqish</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Boshqaruv Paneli</span>
          </span>
          {onLockSession && (
            <button
              onClick={onLockSession}
              className="min-h-[36px] px-2.5 bg-red-950/60 hover:bg-red-900/60 border border-red-500/30 rounded-lg text-red-300 hover:text-white text-xs flex items-center gap-1 transition-colors"
              title="Sessiyani qulflash"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Qulflash</span>
            </button>
          )}
          <button
            onClick={fetchAdminData}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Yangilash"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Admin Section Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => setAdminTab('settings')}
          className={`min-h-[42px] px-4 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
            adminTab === 'settings'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Settings className="w-4 h-4 text-blue-400" />
          <span>Dinamik Sozlamalar &amp; Rasmlar</span>
        </button>

        <button
          onClick={() => setAdminTab('stats')}
          className={`min-h-[42px] px-4 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
            adminTab === 'stats'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <span>Statistika</span>
        </button>

        <button
          onClick={() => setAdminTab('receipts')}
          className={`min-h-[42px] px-4 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
            adminTab === 'receipts'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <span>To'lov cheklari</span>
          {receipts.filter(r => r.status === 'pending').length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
              {receipts.filter(r => r.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('promos')}
          className={`min-h-[42px] px-4 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
            adminTab === 'promos'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Gift className="w-4 h-4 text-purple-400" />
          <span>Promokod &amp; Kunlik VIP</span>
        </button>

        <button
          onClick={() => setAdminTab('broadcast')}
          className={`min-h-[42px] px-4 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
            adminTab === 'broadcast'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Send className="w-4 h-4 text-sky-400" />
          <span>E'lonlar</span>
        </button>
      </div>

      {/* TAB 1: DYNAMIC SETTINGS */}
      {adminTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6 animate-in fade-in duration-200">
          {/* Hidden File Inputs for Gallery / Mobile Photo Picker */}
          <input
            type="file"
            ref={logoInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageFileChange(e, 'logoUrl')}
          />
          <input
            type="file"
            ref={coverInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageFileChange(e, 'coverUrl')}
          />
          <input
            type="file"
            ref={avatarInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageFileChange(e, 'avatarUrl')}
          />

          {/* Section 1: Visual Media (Logo, Cover Banner, Avatar) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Image className="w-5 h-5 text-blue-400" />
              <span>1. Rasmlar va Muqova (Galereyadan to'g'ridan-to'g'ri yuklash)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Logo */}
              <div className="p-3.5 bg-slate-800/60 border border-slate-700/80 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200">
                    Bot &amp; App Logotipi
                  </label>
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-[10px] font-bold flex items-center gap-1 shadow-sm transition-colors"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Galereyadan</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                    {settings.logoUrl ? (
                      <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-slate-500">Rasm yo'q</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={settings.logoUrl}
                      onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                      placeholder="URL yoki Galereyadan..."
                      className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-[11px] font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Cover Banner */}
              <div className="p-3.5 bg-slate-800/60 border border-slate-700/80 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200">
                    Bosh sahifa muqovasi (Cover)
                  </label>
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-[10px] font-bold flex items-center gap-1 shadow-sm transition-colors"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Galereyadan</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                    {settings.coverUrl ? (
                      <img src={settings.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-slate-500">Rasm yo'q</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={settings.coverUrl}
                      onChange={(e) => setSettings({ ...settings, coverUrl: e.target.value })}
                      placeholder="URL yoki Galereyadan..."
                      className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-[11px] font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Bot Avatar */}
              <div className="p-3.5 bg-slate-800/60 border border-slate-700/80 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200">
                    Bot Avatari
                  </label>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="px-2 py-1 bg-purple-600 hover:bg-purple-500 rounded-lg text-white text-[10px] font-bold flex items-center gap-1 shadow-sm transition-colors"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Galereyadan</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                    {settings.avatarUrl ? (
                      <img src={settings.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-slate-500">Rasm yo'q</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={settings.avatarUrl || ''}
                      onChange={(e) => setSettings({ ...settings, avatarUrl: e.target.value })}
                      placeholder="URL yoki Galereyadan..."
                      className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-[11px] font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Bot Identity & Greetings */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>2. Bot Nomi, Username va Xush Kelibsiz Xabari</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Bot Rasmiy Nomi
                </label>
                <input
                  type="text"
                  value={settings.botName || '@TAQDIMIY_BOT'}
                  onChange={(e) => setSettings({ ...settings, botName: e.target.value })}
                  placeholder="@TAQDIMIY_BOT"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Bot Username
                </label>
                <input
                  type="text"
                  value={settings.botUsername || '@TAQDIMIY_BOT'}
                  onChange={(e) => setSettings({ ...settings, botUsername: e.target.value })}
                  placeholder="@TAQDIMIY_BOT"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Boshlang'ich Tabrik va Xush Kelibsiz Matni
                </label>
                <textarea
                  value={settings.welcomeMessage || ''}
                  onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Support Contacts & Developer Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-400" />
              <span>3. Qo'llab-quvvatlash xizmati (Support) va Dasturchi</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Qo'llab-quvvatlash Telegram nikneymi
                </label>
                <input
                  type="text"
                  value={settings.supportUsername}
                  onChange={(e) => setSettings({ ...settings, supportUsername: e.target.value })}
                  placeholder="@TaqdimiySupport"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Yordam matni tavsifi
                </label>
                <input
                  type="text"
                  value={settings.supportText}
                  onChange={(e) => setSettings({ ...settings, supportText: e.target.value })}
                  placeholder="Savollar va to'lovlar bo'yicha..."
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Dasturchi va Texnologiya tavsifi
                </label>
                <input
                  type="text"
                  value={settings.developerInfo || ''}
                  onChange={(e) => setSettings({ ...settings, developerInfo: e.target.value })}
                  placeholder="Ta'lim AI & Telegram Bot Dev Team..."
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Payment Details (Uzcard / Humo) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>4. To'lov Rekvizitlari (Uzcard / Humo)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Karta raqami</label>
                <input
                  type="text"
                  value={settings.cardNumber}
                  onChange={(e) => setSettings({ ...settings, cardNumber: e.target.value })}
                  placeholder="8600 5304 1892 4108"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Karta egasi F.I.Sh</label>
                <input
                  type="text"
                  value={settings.cardHolder}
                  onChange={(e) => setSettings({ ...settings, cardHolder: e.target.value })}
                  placeholder="RAXMATULLAYEV V."
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Tariff & Service Prices */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-amber-400" />
              <span>5. Barcha Xizmat va Tarif Narxlari (so'mda)</span>
            </h3>

            {/* Taqdimot Tariflari */}
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-2">
                A) Taqdimot tariflari
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Standart tarif</label>
                  <input
                    type="number"
                    value={settings.tierPrices?.standart || 10000}
                    onChange={(e) => setSettings({
                      ...settings,
                      tierPrices: { ...settings.tierPrices, standart: Number(e.target.value) }
                    })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Premium tarif</label>
                  <input
                    type="number"
                    value={settings.tierPrices?.premium || 20000}
                    onChange={(e) => setSettings({
                      ...settings,
                      tierPrices: { ...settings.tierPrices, premium: Number(e.target.value) }
                    })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">PRO tarif (Mukammal vizual)</label>
                  <input
                    type="number"
                    value={settings.tierPrices?.pro || 35000}
                    onChange={(e) => setSettings({
                      ...settings,
                      tierPrices: { ...settings.tierPrices, pro: Number(e.target.value) }
                    })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Akademik Hujjatlar Narxlari */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block mb-2">
                B) Akademik va Matnli Xizmatlar Narxlari
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Referat</label>
                  <input
                    type="number"
                    value={settings.servicePrices?.referat || 15000}
                    onChange={(e) => setSettings({
                      ...settings,
                      servicePrices: { ...settings.servicePrices, referat: Number(e.target.value) } as any
                    })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Mustaqil ish</label>
                  <input
                    type="number"
                    value={settings.servicePrices?.mustaqil_ish || 15000}
                    onChange={(e) => setSettings({
                      ...settings,
                      servicePrices: { ...settings.servicePrices, mustaqil_ish: Number(e.target.value) } as any
                    })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Kurs ishi</label>
                  <input
                    type="number"
                    value={settings.servicePrices?.kurs_ishi || 30000}
                    onChange={(e) => setSettings({
                      ...settings,
                      servicePrices: { ...settings.servicePrices, kurs_ishi: Number(e.target.value) } as any
                    })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Tezis &amp; Maqola</label>
                  <input
                    type="number"
                    value={settings.servicePrices?.tezis || 12000}
                    onChange={(e) => setSettings({
                      ...settings,
                      servicePrices: { ...settings.servicePrices, tezis: Number(e.target.value) } as any
                    })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Channels & Bonuses */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-400" />
              <span>6. Majburiy Kanallar va Foydalanuvchi Bonuslari</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">1-Kanal username</label>
                <input
                  type="text"
                  value={settings.channel1}
                  onChange={(e) => setSettings({ ...settings, channel1: e.target.value })}
                  placeholder="@taqdimotlar_kanali"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">2-Kanal username</label>
                <input
                  type="text"
                  value={settings.channel2}
                  onChange={(e) => setSettings({ ...settings, channel2: e.target.value })}
                  placeholder="@talim_yangiliklari"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Do'st taklif qilish bonusi (so'm)
                </label>
                <input
                  type="number"
                  value={settings.referralBonusAmount || 5000}
                  onChange={(e) => setSettings({ ...settings, referralBonusAmount: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Yangi foydalanuvchi boshlang'ich balansi (so'm)
                </label>
                <input
                  type="number"
                  value={settings.initialBalanceAmount || 10000}
                  onChange={(e) => setSettings({ ...settings, initialBalanceAmount: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 7: Bot Token */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              <span>7. Rasmiy Bot Tokeni: @TAQDIMIY_BOT</span>
            </h3>
            <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl flex items-center justify-between gap-3 text-xs">
              <span className="font-mono text-slate-300 truncate">
                {showToken ? BOT_TOKEN : '8916622173:••••••••••••••••••••••••••••••••••••'}
              </span>
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 text-xs shrink-0"
              >
                {showToken ? 'Yashirish' : 'Ko\'rish'}
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="space-y-3 pt-2">
            <button
              type="submit"
              className="w-full min-h-[52px] py-3.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-black text-sm rounded-2xl transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              <span>Barcha o'zgarishlarni butun botga saqlash (Umrbod)</span>
            </button>

            {settingsSaved && (
              <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-xs text-emerald-300 text-center font-bold animate-in fade-in shadow-lg">
                ✓ Barcha sozlamalar muvaffaqiyatli saqlandi! Butun bot bo'ylab hamma foydalanuvchilar uchun shu zahoti amal qilishni boshladi.
              </div>
            )}
          </div>
        </form>
      )}

      {/* TAB 2: USER STATISTICS */}
      {adminTab === 'stats' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Jami foydalanuvchilar</span>
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-white tabular-nums">
                {stats.totalUsers.toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
                +14% o'sish
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Bugun faol</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white tabular-nums">
                {stats.activeToday.toLocaleString()}
              </div>
              <span className="text-[11px] text-blue-400 font-semibold mt-1 block">
                @TAQDIMIY_BOT faolligi
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Jami yaratilgan ishlar</span>
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-white tabular-nums">
                {stats.totalGenerations.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-400 font-medium mt-1 block">
                Taqdimot, Referat, Testlar
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Jami tushum</span>
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 tabular-nums">
                {(stats.totalRevenueUz / 1000000).toFixed(1)} mln so'm
              </div>
              <span className="text-[11px] text-slate-400 font-medium mt-1 block">
                Karta o'tkazmalari
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RECEIPTS APPROVAL QUEUE */}
      {adminTab === 'receipts' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">
              To'lov cheklarini tasdiqlash navbati
            </h3>
            <span className="text-xs text-slate-400">
              Jami cheklar: {receipts.length} ta
            </span>
          </div>

          <div className="space-y-3">
            {receipts.map((r) => (
              <div
                key={r.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white text-base">
                      {r.amount.toLocaleString()} so'm
                    </span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                      r.status === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : r.status === 'rejected'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {r.status === 'approved' ? 'Tasdiqlangan' : r.status === 'rejected' ? 'Rad etilgan' : 'Kutilmoqda'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300">
                    Foydalanuvchi: <span className="text-white font-bold">{r.fullName}</span> (@{r.username})
                  </div>
                  <div className="text-xs text-slate-500">
                    Karta: **** {r.cardLast4} · {new Date(r.date).toLocaleDateString()}
                  </div>
                </div>

                {r.status === 'pending' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateReceipt(r.id, 'approved', r.amount)}
                      disabled={receiptLoading}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-600/20"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Tasdiqlash &amp; Balansni to'ldirish</span>
                    </button>
                    <button
                      onClick={() => handleUpdateReceipt(r.id, 'rejected', r.amount)}
                      disabled={receiptLoading}
                      className="px-3 py-2 bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Rad etish</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 font-mono">Bajarildi</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PROMO CODES & DAILY VIP */}
      {adminTab === 'promos' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-1">
              Yangi promokod yaratish (Balans yoki Kunlik VIP)
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Promokod orqali foydalanuvchiga bepul so'm balansi yoki maxsus kunlik VIP obuna taqdim etiladi.
            </p>

            <form onSubmit={handleCreatePromo} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Promokod nomi
                </label>
                <input
                  type="text"
                  value={newPromoCode}
                  onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                  placeholder="VIPKUNLIK"
                  required
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono uppercase focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Turi
                </label>
                <select
                  value={newPromoType}
                  onChange={(e) => setNewPromoType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                >
                  <option value="vip">Kunlik VIP (kun)</option>
                  <option value="balance">Balans (so'm)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {newPromoType === 'vip' ? 'Kunlar soni' : 'Summa (so\'m)'}
                </label>
                <input
                  type="number"
                  value={newPromoValue}
                  onChange={(e) => setNewPromoValue(Number(e.target.value))}
                  required
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Faollashtirishlar soni
                </label>
                <input
                  type="number"
                  value={newPromoLimit}
                  onChange={(e) => setNewPromoLimit(Number(e.target.value))}
                  required
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                />
              </div>

              <div className="sm:col-span-4 mt-1">
                <button
                  type="submit"
                  className="w-full min-h-[44px] py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-600/20"
                >
                  Promokodni yaratish
                </button>
              </div>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-3">
              Mavjud faol promokodlar
            </h3>
            <div className="space-y-2.5">
              {promos.map((p, i) => (
                <div
                  key={i}
                  className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-white text-sm mr-2">{p.code}</span>
                    <span className="px-2 py-0.5 rounded-full font-bold uppercase text-[10px] bg-blue-500/20 text-blue-300">
                      {p.type === 'vip' ? `${p.value} Kunlik VIP` : `${p.value.toLocaleString()} so'm`}
                    </span>
                    <span className="text-slate-400 ml-2">Qolgan: {p.remaining} ta</span>
                  </div>
                  <span className="text-emerald-400 font-bold">Faol</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: BROADCAST */}
      {adminTab === 'broadcast' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 animate-in fade-in duration-200">
          <h3 className="text-base font-bold text-white">
            Foydalanuvchilarga xabar tarqatish (Reklama &amp; E'lon)
          </h3>
          <form onSubmit={handleSendBroadcast} className="space-y-3">
            <input
              type="text"
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              placeholder="E'lon sarlavhasi..."
              required
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
            />
            <textarea
              value={broadcastContent}
              onChange={(e) => setBroadcastContent(e.target.value)}
              rows={4}
              placeholder="Xabar matni..."
              required
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="w-full min-h-[46px] py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Barcha foydalanuvchilarga yuborish</span>
            </button>
            {broadcastSent && (
              <p className="text-xs font-bold text-emerald-400 text-center">
                ✓ Xabar yuborildi!
              </p>
            )}
          </form>
        </div>
      )}
    </div>
  );
};
