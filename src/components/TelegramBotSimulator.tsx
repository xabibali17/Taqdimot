import React, { useState, useRef, useEffect } from 'react';
import { Language, UserProfile, ServiceType } from '../types';
import { translations } from '../locales/translations';
import { 
  Send, Bot, CheckCheck, Sparkles, 
  Wallet, ExternalLink, Globe, BookOpen 
} from 'lucide-react';

interface BotMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  buttons?: { label: string; action: string; url?: string }[];
}

interface TelegramBotSimulatorProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  user: UserProfile;
  onOpenWebApp: () => void;
  onSelectService: (service: ServiceType) => void;
  onOpenBalance: () => void;
  onOpenAdmin: () => void;
  onOpenManual: () => void;
  logoUrl?: string;
  botName?: string;
  botUsername?: string;
  avatarUrl?: string;
}

export const TelegramBotSimulator: React.FC<TelegramBotSimulatorProps> = ({
  lang,
  onLanguageChange,
  user,
  onOpenWebApp,
  onSelectService,
  onOpenBalance,
  onOpenAdmin,
  onOpenManual,
  logoUrl,
  botName = '@TAQDIMIY_BOT',
  botUsername = '@TAQDIMIY_BOT',
  avatarUrl,
}) => {
  const effectiveAvatar = avatarUrl || logoUrl;
  const [messages, setMessages] = useState<BotMessage[]>([
    {
      id: 'm-1',
      sender: 'bot',
      text: `👋 Assalomu alaykum, ${user.fullName}!\n\nMen **${botName}** — Taqdimot va Referat platformasining rasmiy AI yordamchisiman.\n\nSizga barcha akademik va ta'limiy ishlarni maksimal darajada **TEZKOR**, **XATOSIZ** va **SODDA** tarzda tayyorlab beraman:\n\n• 📊 **Taqdimot (PRO Mukammal Vizual)**: avtomatik zamonaviy ramkalar va sifatli rasmlar bilan PPTX va PDF yuklab olish;\n• 📑 **Referat va Mustaqil ish**;\n• 🎓 **Kurs ishi va Tezis**;\n• 💳 **Balans (Karta orqali to'lov)** va **Do'stni taklif qil - pul top** (+5 000 so'm).\n\nQuyidagi tugmalardan birini tanlang yoki Web App ni oching:`,
      time: '12:00',
      buttons: [
        { label: '🚀 Mini App ni ochish', action: 'open_webapp' },
        { label: '📊 Taqdimot yaratish (PRO)', action: 'service_taqdimot' },
        { label: '📑 Referat yaratish', action: 'service_referat' },
        { label: '💳 Balansni to\'ldirish', action: 'open_balance' },
        { label: '👥 Do\'stni taklif qilish', action: 'referral' },
        { label: '📖 Qo\'llanma (/manual)', action: 'manual' },
      ],
    },
  ]);

  const [inputVal, setInputVal] = useState<string>('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    const userMsg: BotMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal('');

    // Process Bot reply
    setTimeout(() => {
      let replyText = '';
      let replyButtons: { label: string; action: string }[] | undefined = undefined;

      const lower = text.toLowerCase().trim();

      if (lower === '/start') {
        replyText = `Xush kelibsiz! @TAQDIMIY_BOT xizmatlari quyida keltirilgan:`;
        replyButtons = [
          { label: '🚀 Mini App ni ochish', action: 'open_webapp' },
          { label: '📊 Taqdimot yaratish', action: 'service_taqdimot' },
          { label: '💳 Balans', action: 'open_balance' },
          { label: '📖 Qo\'llanma (/manual)', action: 'manual' },
        ];
      } else if (lower === '/balance' || lower === 'balans') {
        replyText = `💳 Balansingiz: **${user.balance.toLocaleString()} so'm**\nVIP status: ${user.isVip ? 'Faol (' + user.vipDaysRemaining + ' kun)' : 'Oddiy'}\n\nTo'ldirish faqat karta orqali chek yuborish asosida amalga oshiriladi:`;
        replyButtons = [
          { label: 'Karta orqali chek yuborish', action: 'open_balance' },
          { label: 'Do\'stni taklif qilish (+5 000 so\'m)', action: 'referral' },
        ];
      } else if (lower === '/admin_secret' || lower === '/admin') {
      } else if (lower === '/admin') {
        const isChief = user.telegramUsername?.toLowerCase() === '@r_vf7' || user.telegramId === '1273917582';
        if (isChief) {
          replyText = `🔐 Administrator buyrug'i qabul qilindi. Boshqaruv paneliga o'tishingiz mumkin:`;
          replyButtons = [
            { label: '🔐 Boshqaruv panelini ochish', action: 'admin' },
          ];
        } else {
          replyText = `Noma'lum buyruq. Barcha xizmatlar bilan tanishish uchun /start bosing.`;
          replyButtons = [
            { label: '🚀 Mini App ni ochish', action: 'open_webapp' }
          ];
        }
      } else if (lower === '/manual' || lower.includes('yordam') || lower.includes('help') || lower.includes('support')) {
        replyText = `📖 **@TAQDIMIY_BOT Qo'llanmasi (/manual)**\n\n1. Taqdimot yaratish: 'Taqdimot yaratish'ni tanlang va 7 ta sodda qadamda mavzu, muallif va tarifni belgilang.\n2. PRO tarifda slaydlar avtomatik zamonaviy ramkalar va sifatli rasmlar bilan bezatiladi.\n3. Balans: Karta raqamiga o'tkazma qilib, chekni yuklaysiz.\n\nRasmiy qo'llab-quvvatlash: @TaqdimiySupport`;
        replyButtons = [
          { label: 'Yordam xizmati', action: 'support' },
        ];
      } else {
        replyText = `Qabul qilindi! "${text}" mavzusida ishni yaratish uchun quyidagi tugmani bosing:`;
        replyButtons = [
          { label: '🚀 Mini App da boshlash', action: 'open_webapp' },
          { label: '📊 Taqdimot tuzish', action: 'service_taqdimot' },
        ];
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          buttons: replyButtons,
        },
      ]);
    }, 400);
  };

  const handleButtonClick = (action: string) => {
    if (action === 'open_webapp') {
      onOpenWebApp();
    } else if (action === 'service_taqdimot') {
      onSelectService('taqdimot');
    } else if (action === 'service_referat') {
      onSelectService('referat');
    } else if (action === 'open_balance') {
      onOpenBalance();
    } else if (action === 'manual') {
      onOpenManual();
    } else if (action === 'admin') {
      onOpenAdmin();
    } else if (action === 'referral') {
      handleSendMessage('Do\'stni taklif qilish');
    } else if (action === 'support') {
      window.open('https://t.me/TaqdimiySupport', '_blank');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-4 py-4 pb-20 flex flex-col h-[calc(100vh-4rem)]">
      {/* Telegram Chat Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 mb-2 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            {effectiveAvatar ? (
              <img src={effectiveAvatar} alt="Bot Avatar" className="w-9 h-9 rounded-full object-cover border border-slate-700" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-extrabold text-white">{botName}</h2>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1 rounded font-bold">bot</span>
            </div>
            <p className="text-[10px] text-slate-400">Taqdimot &amp; Referat AI · Online</p>
          </div>
        </div>

        <button
          onClick={onOpenWebApp}
          className="min-h-[36px] px-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Mini App</span>
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-3 p-2 rounded-2xl bg-slate-950/40 border border-slate-900/60 scrollbar-thin">
        {messages.map((m) => {
          const isBot = m.sender === 'bot';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-md ${
                  isBot
                    ? 'bg-slate-900 border border-slate-800 text-slate-200'
                    : 'bg-blue-600 text-white font-medium'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                <div
                  className={`text-[9px] mt-1 text-right flex items-center justify-end gap-1 ${
                    isBot ? 'text-slate-500' : 'text-blue-200'
                  }`}
                >
                  <span>{m.time}</span>
                  {!isBot && <CheckCheck className="w-3 h-3" />}
                </div>
              </div>

              {/* Telegram Inline Keyboard Buttons */}
              {isBot && m.buttons && m.buttons.length > 0 && (
                <div className="grid grid-cols-2 gap-1.5 mt-2 max-w-[88%] w-full">
                  {m.buttons.map((btn, bIdx) => (
                    <button
                      key={bIdx}
                      onClick={() => handleButtonClick(btn.action)}
                      className="min-h-[38px] px-3 py-1.5 bg-slate-800/95 hover:bg-blue-600/20 active:bg-blue-600 border border-slate-700/80 hover:border-blue-500/50 rounded-xl text-xs font-semibold text-blue-300 hover:text-white transition-all text-center truncate flex items-center justify-center gap-1"
                    >
                      <span className="truncate">{btn.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="mt-2 bg-slate-900 border border-slate-800 rounded-2xl p-1.5 flex items-center gap-2 shadow-xl">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          placeholder="Mavzuni yozing yoki /start..."
          className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputVal.trim()}
          className={`min-h-[38px] min-w-[38px] rounded-xl flex items-center justify-center transition-all ${
            inputVal.trim()
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
