import React, { useState, useRef, useEffect } from 'react';
import { Language, UserProfile, ServiceType } from '../types';
import { 
  Send, Sparkles, Bot, User, ArrowRight, 
  HelpCircle, Presentation, BookOpen, Wallet, Gift, ShieldCheck, RefreshCw 
} from 'lucide-react';

interface AiChatViewProps {
  lang: Language;
  user: UserProfile;
  onNavigateToService?: (service: ServiceType) => void;
  onNavigateToTab?: (tab: string) => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  quickAction?: {
    label: string;
    action: () => void;
  };
}

export const AiChatView: React.FC<AiChatViewProps> = ({
  lang,
  user,
  onNavigateToService,
  onNavigateToTab
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Assalomu alaykum, ${user.fullName}! Men @TAQDIMIY_BOT ning rasmiy sun'iy intellekt yordamchisiman.

Sizga bot bo'yicha har qanday yo'riqnoma berishim, 100+ shablonlar haqida so'zlab berishim, taqdimot yoki referat tuzishga yordam berishim va istalgan ilmiy-ta'limiy savolingizga javob berishim mumkin. 

Qanday savolingiz bor?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const quickPrompts = [
    { label: 'Taqdimot qanday yaratiladi?', text: 'Taqdimot yaratish bosqichlari va qoidalarini tushuntirib bering.' },
    { label: '100+ Shablonlar qanday?', text: 'Qanday dizayn shablonlari mavjud va mavzuga mos personaj nima?' },
    { label: 'Balans to\'ldirish tartibi', text: 'Balansni karta orqali chek bilan qanday to\'ldiraman?' },
    { label: 'Referat & Kurs ishi', text: 'Referat va kurs ishlari qanday tartibda tayyorlanadi?' },
    { label: 'Promokod va VIP status', text: 'Promokod qanday kiritiladi va VIP ning qanday foydasi bor?' },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/ai-assistant-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          lang,
          userName: user.fullName
        }),
      });

      const data = await res.json();
      
      const aiReplyText = data.reply || 
        "Kechirasiz, tizimda qisqa uzilish yuz berdi. Iltimos, qayta urinib ko'ring yoki qo'llab-quvvatlash xizmatiga murojaat qiling.";

      // Determine if a quick action button is relevant
      let quickAction: { label: string; action: () => void } | undefined = undefined;
      const lower = query.toLowerCase();
      if (lower.includes('taqdimot') || lower.includes('slayd') || lower.includes('shablon')) {
        quickAction = {
          label: 'Taqdimot yaratishni boshlash →',
          action: () => onNavigateToService?.('taqdimot')
        };
      } else if (lower.includes('balans') || lower.includes('to\'lov') || lower.includes('karta') || lower.includes('chek')) {
        quickAction = {
          label: 'Akkaunt / Balans bo\'limiga o\'tish →',
          action: () => onNavigateToTab?.('profile')
        };
      } else if (lower.includes('referat') || lower.includes('kurs ishi') || lower.includes('mustaqil ish')) {
        quickAction = {
          label: 'Akademik ishlarga o\'tish →',
          action: () => onNavigateToTab?.('services')
        };
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: aiReplyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quickAction,
        },
      ]);
    } catch {
      // Offline / intelligent fallback response
      let fallbackText = "Savolingiz qabul qilindi. @TAQDIMIY_BOT xizmatida siz barcha ilmiy taqdimotlarni (100+ shablonlar, mavzuga mos ramkalar va personajlar bilan) hamda referat, kurs ishi, testlarni maksimal tezkor va sifatli yaratishingiz mumkin.";
      const lower = query.toLowerCase();
      
      if (lower.includes('taqdimot')) {
        fallbackText = `Taqdimot yaratish juda sodda:
1. "Xizmatlar" yoki Bosh sahifadan "Taqdimot (PRO)"ni tanlang.
2. Tilni tanlang va mavzuni kiriting.
3. AI mavzuni tahlil qilib professional nom taklif etadi.
4. O'quvchi va o'qituvchi ismini kiriting (o'tkazib yuborish mumkin).
5. 100+ turdagi dizayn shablonlaridan birini tanlang.
6. "Yaratish" tugmasini bosing — 2 daqiqada PPTX va PDF yuklab olish uchun tayyor bo'ladi!`;
      } else if (lower.includes('balans') || lower.includes('karta') || lower.includes('to\'lov') || lower.includes('chek')) {
        fallbackText = `Balansni to'ldirish uchun:
1. Pastki "Akkaunt" bo'limiga o'ting.
2. Ko'rsatilgan Uzcard/Humo karta raqamiga to'lov qiling.
3. O'tkazilgan summani va chek rasmini yuklab, yuborish tugmasini bosing.
4. Administrator chekni tekshirib tasdiqlashi bilanoq mablag' hisobingizga tushadi.`;
      } else if (lower.includes('vip') || lower.includes('promokod')) {
        fallbackText = `Promokod va VIP status:
"Akkaunt" bo'limida maxsus promokod maydoniga masalan: START2026 yoki VIPKUNLIK kodini kiriting.
VIP status ega bo'lsangiz:
- Barcha 108 ta premium shablonlar ochiq bo'ladi;
- Rasmlar va ramkalar yuqori sifatda yaratiladi;
- Generatsiya jarayoni tezlashadi.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: fallbackText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col h-[calc(100vh-3.5rem)] pb-16 bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top AI Status Bar */}
      <div className="px-3.5 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>AI Yordamchi Chat</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            </h2>
            <p className="text-[10px] text-slate-400">
              Bot bo'yicha ko'rsatma va savollaringizga javob
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: `welcome-${Date.now()}`,
                sender: 'ai',
                text: "Chat tozalandi. Qanday yangi savolingiz bor?",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              }
            ]);
          }}
          className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800/80 rounded-lg border border-slate-700/60 text-[10px] flex items-center gap-1"
          title="Chatni tozalash"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Tozalash</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 overscroll-contain">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
          >
            <div className="flex items-start gap-1.5 max-w-[88%]">
              {msg.sender === 'ai' && (
                <div className="w-6 h-6 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap break-words shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                {msg.text}

                {msg.quickAction && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={msg.quickAction.action}
                      className="w-full py-1.5 px-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-bold rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition-all"
                    >
                      <span>{msg.quickAction.label}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <span className="text-[9px] text-slate-500 px-1">
              {msg.time}
            </span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
            <div className="w-6 h-6 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-3 py-2 rounded-2xl rounded-tl-none">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] text-slate-400 ml-1.5">AI javob yozmoqda...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Chips */}
      <div className="px-2.5 py-1.5 bg-slate-900/60 border-t border-slate-800/80 shrink-0 overflow-x-auto no-scrollbar flex items-center gap-1.5">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p.text)}
            className="px-2.5 py-1 bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white rounded-lg text-[10px] font-semibold whitespace-nowrap shrink-0 transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-2.5 bg-slate-900 border-t border-slate-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-1.5"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Savolingiz yoki mavzuni yozing..."
            className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-xl flex items-center justify-center transition-all shrink-0 shadow-md shadow-blue-600/30"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
