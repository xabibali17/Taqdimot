import React, { useState, useEffect } from 'react';
import { 
  Language, UserProfile, ServiceType, TaskItem, 
  PresentationData, AcademicDocData, InteractiveQuizData, TextDocData, AppSettings 
} from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { TermsModal } from './components/TermsModal';
import { ServicesGrid } from './components/ServicesGrid';
import { PresentationWizard } from './components/PresentationWizard';
import { PresentationResult } from './components/PresentationResult';
import { AcademicWizard } from './components/AcademicWizard';
import { InteractiveQuizView } from './components/InteractiveQuizView';
import { AiChatView } from './components/AiChatView';
import { AccountView } from './components/AccountView';
import { MyTasksView } from './components/MyTasksView';
import { AdminPanel } from './components/AdminPanel';
import { TelegramBotSimulator } from './components/TelegramBotSimulator';
import { 
  Presentation, BookOpen, 
  ArrowRight, Zap, Sparkles, User, Palette
} from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('uz');
  const [appMode, setAppMode] = useState<'webapp' | 'bot'>('webapp');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);

  // Dynamic Settings (loaded from server and cached locally)
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const cached = localStorage.getItem('taqdimiy_global_settings');
      if (cached) return JSON.parse(cached);
    } catch {}
    return {
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
    };
  });

  // Active view states
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [activePresentation, setActivePresentation] = useState<PresentationData | null>(null);
  const [activeInteractiveTool, setActiveInteractiveTool] = useState<string | null>(null);

  // Current User Profile (Regular ordinary user by default!)
  const [user, setUser] = useState<UserProfile>(() => {
    const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
    const fallbackId = tgUser?.id ? String(tgUser.id) : '589201943';
    return {
      id: tgUser?.id ? String(tgUser.id) : 'usr_8921',
      telegramId: fallbackId,
      telegramUsername: tgUser?.username ? `@${tgUser.username}` : '@talaba_2026',
      fullName: tgUser?.first_name ? `${tgUser.first_name} ${tgUser.last_name || ''}`.trim() : 'Jasur Beknazarov',
      balance: 35000,
      isVip: false,
      vipDaysRemaining: 0,
      referralCode: 'ref_9042',
      referralEarnings: 15000,
      referralsCount: 3,
      completedTasksCount: 4,
    };
  });

  // Chief Admin Session Unlock (Strictly restricted)
  const [sessionAdminUnlocked, setSessionAdminUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem('taqdimiy_admin_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  // Saved Tasks
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: 'task-1',
      type: 'taqdimot',
      title: 'Qayta tiklanuvchi energiya manbalari va yashil iqtisodiyot',
      category: 'presentation',
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      data: {
        id: 'pres-init-1',
        title: 'Qayta tiklanuvchi energiya manbalari va yashil iqtisodiyot',
        subtitle: 'Iqtisodiyot fani bo\'yicha ilmiy taqdimot',
        studentName: 'Jasur Beknazarov',
        subject: 'Yashil iqtisodiyot',
        teacherName: 'dots. Karimov A.',
        tier: 'PRO',
        fontSize: 'O\'rtacha',
        theme: 'Modern Dark',
        lang: 'uz',
        rating: 5,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        slides: [
          {
            slideNumber: 1,
            title: 'Qayta tiklanuvchi energiya manbalari va yashil iqtisodiyot',
            subtitle: 'O\'zbekistonda barqaror rivojlanish istiqbollari',
            contentPoints: [
              'Bajaruvchi: Jasur Beknazarov',
              'Fan: Yashil iqtisodiyot',
              'Ilmiy rahbar: dots. Karimov A.'
            ],
            highlightText: 'Kelajak energetikasi va ekologik barqarorlik',
            speakerNotes: 'Hurmatli domla va talabalar, bugungi mavzumiz energiya manbalariga bag\'ishlanadi.',
            visualLayout: 'hero',
            themeFrame: 'accent-corner-glow',
            imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
            characterName: 'Yetakchi Ekolog-Muhandis',
            characterRole: 'Yashil energetika eksperti',
            characterImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
            characterQuote: 'Quyosh va shamol energiyasidan samarali foydalanish kelajak iqtisodiyotining barqaror kafolatidir.'
          },
          {
            slideNumber: 2,
            title: 'Quyosh va shamol energiyasi salohiyati',
            subtitle: 'Markaziy Osiyodagi tabiiy resurslar tahlili',
            contentPoints: [
              'Yiliga 320 dan ortiq quyoshli kunlar mavjudligi',
              'Quyosh stansiyalarining quvvati 2030 yilga kelib 5 000 MVt ga yetkaziladi',
              'Tabiiy gaz va ko\'mir sarfini 35% ga qisqartirish imkoniyati',
              'Atrof-muhitga chiqarilayotgan karbon chiqindilarining sezilarli kamayishi'
            ],
            highlightText: 'Yillik quyosh nurlanishi: 300+ kun',
            speakerNotes: 'Tahlillarimiz shuni ko\'rsatadiki, geografik joylashuvimiz quyosh stansiyalari uchun eng qulay mintaqalardan biridir.',
            visualLayout: 'stat-callout',
            themeFrame: 'modern-hairline-card',
            imageUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=800&auto=format&fit=crop&q=80',
            characterName: 'Yetakchi Ekolog-Muhandis',
            characterRole: 'Yashil energetika eksperti',
            characterImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
            characterQuote: 'Toza texnologiyalar ekologik xavfsizlik va yangi ish o\'rinlarini barpo etadi.'
          },
          {
            slideNumber: 3,
            title: 'Xulosa va tavsiyalar',
            subtitle: 'Amaliy takliflar va iqtisodiy samaradorlik',
            contentPoints: [
              'Sohaga xususiy va xorijiy investitsiyalarni jalb qilishni kengaytirish',
              'Yashil energetika bo\'yicha malakali kadrlar tayyorlash',
              'Aholi va korxonalar uchun subsidiya hamda soliq imtiyozlarini joriy etish'
            ],
            highlightText: 'Barqaror kelajak — bugungi to\'g\'ri investitsiyada',
            speakerNotes: 'E\'tiboringiz uchun rahmat!',
            visualLayout: 'hero',
            themeFrame: 'accent-corner-glow',
            imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
            characterName: 'Yetakchi Ekolog-Muhandis',
            characterRole: 'Yashil energetika eksperti',
            characterImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
            characterQuote: 'Ilmiy asoslangan tavsiyalar amaliyotga tatbiq etilsa, iqtisodiy o\'sish 2 baravar ortadi.'
          }
        ]
      }
    }
  ]);

  // Fetch settings & check terms on mount
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data) setSettings(prev => ({ ...prev, ...data }));
      })
      .catch(console.error);

    const accepted = localStorage.getItem('taqdimiy_terms_accepted');
    if (!accepted) {
      setShowTermsModal(true);
    }
  }, []);

  const handleAcceptTerms = () => {
    localStorage.setItem('taqdimiy_terms_accepted', 'true');
    setShowTermsModal(false);
  };

  const handleSelectService = (service: ServiceType) => {
    if (service === 'taqdimot' || service === 'oddiy_taqdimot' || service === 'fayldan_taqdimot') {
      setSelectedService('taqdimot');
      setActivePresentation(null);
    } else if (['test', 'krossvord', 'tinglash', 'viktorina'].includes(service)) {
      setSelectedService(service);
      const toolNames: Record<string, string> = {
        test: 'Test (Quiz)',
        krossvord: 'Krossvord',
        tinglash: 'Tinglash mashqi',
        viktorina: 'Viktorina',
      };
      setActiveInteractiveTool(toolNames[service] || 'Test');
    } else {
      setSelectedService(service);
    }
  };

  const handlePresentationComplete = (pres: PresentationData) => {
    setActivePresentation(pres);
    setSelectedService(null);

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      type: 'taqdimot',
      title: pres.title,
      category: 'presentation',
      date: new Date().toISOString(),
      data: pres,
    };
    setTasks((prev) => [newTask, ...prev]);

    const price = pres.tier === 'PRO' 
      ? (settings.tierPrices?.pro || 35000) 
      : pres.tier === 'Premium' 
      ? (settings.tierPrices?.premium || 20000) 
      : (settings.tierPrices?.standart || 10000);

    setUser((prev) => ({
      ...prev,
      balance: Math.max(0, prev.balance - price),
      completedTasksCount: prev.completedTasksCount + 1,
    }));
  };

  const handleSaveAcademicTask = (doc: AcademicDocData | TextDocData) => {
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      type: (selectedService as ServiceType) || 'referat',
      title: doc.title,
      category: 'academic',
      date: new Date().toISOString(),
      data: doc,
    };
    setTasks((prev) => [newTask, ...prev]);
    setUser((prev) => ({
      ...prev,
      completedTasksCount: prev.completedTasksCount + 1,
    }));
  };

  const handleSaveInteractiveTask = (quiz: InteractiveQuizData) => {
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      type: 'test',
      title: quiz.title,
      category: 'interactive',
      date: new Date().toISOString(),
      data: quiz,
    };
    setTasks((prev) => [newTask, ...prev]);
    setUser((prev) => ({
      ...prev,
      completedTasksCount: prev.completedTasksCount + 1,
    }));
  };

  const handleOpenTask = (task: TaskItem) => {
    if (task.category === 'presentation') {
      setActivePresentation(task.data as PresentationData);
      setSelectedService(null);
    } else {
      setSelectedService(task.type);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleUpdateRating = (id: string, rating: number) => {
    if (activePresentation && activePresentation.id === id) {
      setActivePresentation({ ...activePresentation, rating });
    }
    setTasks((prev) =>
      prev.map((t) => {
        if ('slides' in t.data && t.data.id === id) {
          return {
            ...t,
            data: { ...t.data, rating },
          };
        }
        return t;
      })
    );
  };

  // Strict Chief Admin check: ONLY authenticated Chief Admin (@r_vf7 or ID 1273917582) or unlocked via secret PIN
  const isChiefAdmin = 
    sessionAdminUnlocked ||
    user.telegramUsername.toLowerCase() === '@r_vf7' || 
    user.telegramId === '1273917582';

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white border-x border-slate-900 shadow-2xl relative overflow-x-hidden">
      {/* Top Header (Clean, compact, no balance badge, no swiping) */}
      <Header
        lang={lang}
        onLanguageChange={setLang}
        user={user}
        appMode={appMode}
        onToggleAppMode={(mode) => {
          setAppMode(mode);
          setSelectedService(null);
          setActivePresentation(null);
        }}
        onOpenProfile={() => {
          setAppMode('webapp');
          setActiveTab('profile');
          setSelectedService(null);
          setActivePresentation(null);
        }}
        logoUrl={settings.avatarUrl || settings.logoUrl}
        botName={settings.botName || '@TAQDIMIY_BOT'}
      />

      {/* Main Content */}
      <main className="flex-1 w-full overflow-x-hidden">
        {/* TELEGRAM BOT SIMULATOR MODE */}
        {appMode === 'bot' ? (
          <TelegramBotSimulator
            lang={lang}
            onLanguageChange={setLang}
            user={user}
            onOpenWebApp={() => {
              setAppMode('webapp');
              setActiveTab('home');
            }}
            onSelectService={(serv) => {
              setAppMode('webapp');
              handleSelectService(serv);
            }}
            onOpenBalance={() => {
              setAppMode('webapp');
              setActiveTab('profile');
            }}
            onOpenAdmin={() => {
              setAppMode('webapp');
              setActiveTab('admin');
            }}
            onOpenManual={() => {
              setAppMode('webapp');
              setActiveTab('profile');
            }}
            logoUrl={settings.logoUrl}
            avatarUrl={settings.avatarUrl}
            botName={settings.botName}
            botUsername={settings.botUsername}
          />
        ) : (
          /* TELEGRAM MINI APP (WEB APP) MODE */
          <div className="w-full overflow-x-hidden">
            {/* Active Presentation Result */}
            {activePresentation ? (
              <PresentationResult
                presentation={activePresentation}
                onBack={() => setActivePresentation(null)}
                lang={lang}
                onSaveRating={handleUpdateRating}
                userBalance={user.balance}
                settings={settings}
              />
            ) : selectedService === 'taqdimot' ? (
              /* Presentation Wizard with 100+ Design Templates */
              <PresentationWizard
                initialLang={lang}
                onComplete={handlePresentationComplete}
                onCancel={() => setSelectedService(null)}
                userBalance={user.balance}
                isVip={user.isVip}
                settings={settings}
              />
            ) : selectedService && ['test', 'krossvord', 'tinglash', 'viktorina'].includes(selectedService) ? (
              /* Interactive Quiz / Crossword solver */
              <InteractiveQuizView
                toolType={activeInteractiveTool || 'Test (Quiz)'}
                lang={lang}
                onBack={() => setSelectedService(null)}
                onSaveTask={handleSaveInteractiveTask}
              />
            ) : selectedService ? (
              /* Academic Wizard */
              <AcademicWizard
                serviceType={selectedService}
                lang={lang}
                onBack={() => setSelectedService(null)}
                onSaveTask={handleSaveAcademicTask}
              />
            ) : activeTab === 'services' ? (
              /* All Services */
              <ServicesGrid
                onSelectService={handleSelectService}
                lang={lang}
              />
            ) : activeTab === 'tasks' ? (
              /* My Tasks (Vazifalarim) */
              <MyTasksView
                tasks={tasks}
                lang={lang}
                onOpenTask={handleOpenTask}
                onDeleteTask={handleDeleteTask}
              />
            ) : activeTab === 'aichat' ? (
              /* Dedicated AI Chatbot for Bot Guidance and Any Questions */
              <AiChatView
                lang={lang}
                user={user}
                onNavigateToService={handleSelectService}
                onNavigateToTab={(tab) => {
                  setActiveTab(tab);
                  setSelectedService(null);
                  setActivePresentation(null);
                }}
              />
            ) : activeTab === 'profile' ? (
              /* Akkaunt / Profil (User info, Balans, Karta to'lov, Referal, Promokod, Support, Developer, and Chief Admin portal) */
              <AccountView
                user={user}
                lang={lang}
                onUpdateUser={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
                onOpenAdmin={() => setActiveTab('admin')}
                settings={settings}
                isChiefAdmin={isChiefAdmin}
                onUnlockAdmin={() => {
                  setSessionAdminUnlocked(true);
                  try {
                    localStorage.setItem('taqdimiy_admin_unlocked', 'true');
                  } catch {}
                  setActiveTab('admin');
                }}
                onLockAdmin={() => {
                  setSessionAdminUnlocked(false);
                  try {
                    localStorage.removeItem('taqdimiy_admin_unlocked');
                  } catch {}
                }}
              />
            ) : (activeTab === 'admin' && isChiefAdmin) ? (
              /* Chief Admin Panel (Strictly restricted to authorized chief admin) */
              <AdminPanel
                currentUsername={user.telegramUsername}
                onBack={() => setActiveTab('profile')}
                lang={lang}
                onUpdateSettings={(newSet) => {
                  setSettings(prev => ({ ...prev, ...newSet }));
                  try {
                    localStorage.setItem('taqdimiy_global_settings', JSON.stringify({ ...settings, ...newSet }));
                  } catch {}
                }}
                onReceiptApproved={(amount) => {
                  setUser(prev => ({ ...prev, balance: prev.balance + amount }));
                }}
                onLockSession={() => {
                  setSessionAdminUnlocked(false);
                  try {
                    localStorage.removeItem('taqdimiy_admin_unlocked');
                  } catch {}
                  setActiveTab('home');
                }}
              />
            ) : (
              /* Clean, Ultra-Fast Compact Home Screen */
              <div className="w-full px-3.5 py-4 pb-24 space-y-4 animate-in fade-in duration-150">
                {/* Hero Card */}
                <div className="bg-gradient-to-br from-blue-900/60 via-slate-900 to-indigo-950/70 border border-blue-500/25 rounded-3xl p-5 shadow-xl relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-500/10 border border-blue-400/20 rounded-full text-blue-400 text-[10px] font-black mb-2.5">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>Tezkor &amp; Xatosiz AI Platforma</span>
                    </div>

                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug mb-1.5">
                      Taqdimot &amp; Referat Yaratish
                    </h1>

                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      100+ shablonlar, mavzuga mos ramkalar va personaj rasmlari bilan slaydlar tayyorlang. <strong className="text-white">PPTX</strong> va <strong className="text-white">PDF</strong> formatda yuklab oling.
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSelectService('taqdimot')}
                        className="flex-1 min-h-[44px] px-4 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Presentation className="w-4 h-4" />
                        <span>Taqdimot yaratish</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setActiveTab('services')}
                        className="min-h-[44px] px-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors"
                      >
                        Xizmatlar
                      </button>
                    </div>
                  </div>

                  <div className="absolute right-0 bottom-0 w-48 h-48 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
                </div>

                {/* 100+ Shablonlar Banner */}
                <div 
                  onClick={() => handleSelectService('taqdimot')}
                  className="p-3.5 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/50 border border-purple-500/30 rounded-2xl flex items-center justify-between cursor-pointer hover:border-purple-400/50 transition-colors shadow-sm group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Palette className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1">
                        <span>100+ Dizayn Shablonlari</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold">Yangi</span>
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Biznes, IT, Tibbiyot, Tarix va VIP uslublar
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-purple-400">
                    Tanlash →
                  </span>
                </div>

                {/* Core Services Quick Access (Compact Grid) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xs font-extrabold text-white">
                      Asosiy xizmatlar
                    </h2>
                    <button
                      onClick={() => setActiveTab('services')}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-bold"
                    >
                      Barchasi (20+) →
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => handleSelectService('taqdimot')}
                      className="p-3 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/40 rounded-2xl text-left transition-all shadow-sm group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <Presentation className="w-4 h-4" />
                      </div>
                      <h3 className="text-xs font-bold text-white group-hover:text-blue-300">
                        Taqdimot (PRO)
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Ramkalar &amp; Personajlar
                      </p>
                    </button>

                    <button
                      onClick={() => handleSelectService('referat')}
                      className="p-3 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 rounded-2xl text-left transition-all shadow-sm group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <h3 className="text-xs font-bold text-white group-hover:text-emerald-300">
                        Referat
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Boblar &amp; Adabiyotlar
                      </p>
                    </button>

                    <button
                      onClick={() => handleSelectService('kurs_ishi')}
                      className="p-3 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/40 rounded-2xl text-left transition-all shadow-sm group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <h3 className="text-xs font-bold text-white group-hover:text-purple-300">
                        Kurs ishi &amp; Tezis
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Chuqur ilmiy tahlil
                      </p>
                    </button>

                    <button
                      onClick={() => setActiveTab('aichat')}
                      className="p-3 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl text-left transition-all shadow-sm group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-600/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <h3 className="text-xs font-bold text-white group-hover:text-amber-300">
                        AI Maslahatchi
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Savollarga javob olish
                      </p>
                    </button>
                  </div>
                </div>

                {/* Recent Task Quick List */}
                {tasks.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-xs font-extrabold text-white">
                        Oxirgi ishlarim
                      </h2>
                      <button
                        onClick={() => setActiveTab('tasks')}
                        className="text-[11px] text-blue-400 hover:text-blue-300 font-bold"
                      >
                        Barchasi ({tasks.length}) →
                      </button>
                    </div>

                    <div className="space-y-2">
                      {tasks.slice(0, 2).map((task) => (
                        <div
                          key={task.id}
                          onClick={() => handleOpenTask(task)}
                          className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-colors shadow-sm"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                              <Presentation className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-white truncate">
                                {task.title}
                              </h4>
                              <span className="text-[10px] text-slate-400">
                                {new Date(task.date).toLocaleDateString()} · PPTX &amp; PDF
                              </span>
                            </div>
                          </div>

                          <span className="text-xs font-bold text-blue-400 shrink-0 ml-2">
                            Ko'rish →
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Bottom Navigation (Admin tab hidden for all ordinary users) */}
            <BottomNav
              activeTab={selectedService || activePresentation ? '' : activeTab}
              onSelectTab={(tab) => {
                if (tab === 'admin' && !isChiefAdmin) return;
                setActiveTab(tab);
                setSelectedService(null);
                setActivePresentation(null);
              }}
              lang={lang}
              user={user}
              isChiefAdmin={isChiefAdmin}
            />
          </div>
        )}
      </main>

      {/* Terms of Service Modal */}
      <TermsModal
        lang={lang}
        isOpen={showTermsModal}
        onAccept={handleAcceptTerms}
      />
    </div>
  );
}
