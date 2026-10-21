import React from 'react';
import { Language, UserProfile } from '../types';
import { Globe, Bot, Smartphone, Sparkles, User } from 'lucide-react';

interface HeaderProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  user: UserProfile;
  appMode: 'webapp' | 'bot';
  onToggleAppMode: (mode: 'webapp' | 'bot') => void;
  onOpenProfile: () => void;
  logoUrl?: string;
  botName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onLanguageChange,
  user,
  appMode,
  onToggleAppMode,
  onOpenProfile,
  logoUrl,
  botName = '@TAQDIMIY_BOT',
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="w-full max-w-md mx-auto px-3 h-13 flex items-center justify-between gap-2">
        {/* Brand title & logo */}
        <div 
          onClick={onOpenProfile}
          className="flex items-center gap-2 cursor-pointer group"
          title="Profilni ko'rish"
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              className="w-7 h-7 rounded-lg object-cover border border-slate-700 shadow-sm shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-extrabold tracking-tight text-white whitespace-nowrap leading-tight group-hover:text-blue-400 transition-colors">
                {botName}
              </span>
              {user.isVip && (
                <span className="text-[8px] font-bold uppercase tracking-wider px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 leading-none">
                  VIP
                </span>
              )}
            </div>
            <span className="text-[9px] text-slate-400 font-medium leading-none">
              Taqdimot &amp; Referat AI
            </span>
          </div>
        </div>

        {/* Right Controls: Mode switcher + Language + Profile icon */}
        <div className="flex items-center gap-1.5">
          {/* Mode Switcher: Web App vs Telegram Bot */}
          <div className="flex items-center p-0.5 bg-slate-800/90 rounded-lg border border-slate-700/60">
            <button
              onClick={() => onToggleAppMode('webapp')}
              className={`flex items-center gap-1 px-2 py-0.8 text-[11px] font-semibold rounded-md transition-all whitespace-nowrap ${
                appMode === 'webapp'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Mini App"
            >
              <Smartphone className="w-3 h-3" />
              <span>App</span>
            </button>
            <button
              onClick={() => onToggleAppMode('bot')}
              className={`flex items-center gap-1 px-2 py-0.8 text-[11px] font-semibold rounded-md transition-all whitespace-nowrap ${
                appMode === 'bot'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Telegram Bot"
            >
              <Bot className="w-3 h-3" />
              <span>Bot</span>
            </button>
          </div>

          {/* Language Switcher */}
          <div className="relative group">
            <button
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors whitespace-nowrap"
              title="Tilni tanlash"
            >
              <Globe className="w-3 h-3 text-blue-400" />
              <span className="uppercase text-[10px]">{lang}</span>
            </button>
            <div className="absolute right-0 top-full mt-1.5 w-24 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 hidden group-hover:block z-50">
              <button
                onClick={() => onLanguageChange('uz')}
                className={`w-full text-left px-2.5 py-1 text-xs flex items-center justify-between ${
                  lang === 'uz' ? 'text-blue-400 font-bold bg-slate-800/50' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>O'zbek</span>
                {lang === 'uz' && <span className="text-[9px]">✓</span>}
              </button>
              <button
                onClick={() => onLanguageChange('ru')}
                className={`w-full text-left px-2.5 py-1 text-xs flex items-center justify-between ${
                  lang === 'ru' ? 'text-blue-400 font-bold bg-slate-800/50' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>Русский</span>
                {lang === 'ru' && <span className="text-[9px]">✓</span>}
              </button>
              <button
                onClick={() => onLanguageChange('en')}
                className={`w-full text-left px-2.5 py-1 text-xs flex items-center justify-between ${
                  lang === 'en' ? 'text-blue-400 font-bold bg-slate-800/50' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>English</span>
                {lang === 'en' && <span className="text-[9px]">✓</span>}
              </button>
            </div>
          </div>

          {/* User Profile Mini Icon (Compact) */}
          <button
            onClick={onOpenProfile}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            title="Akkaunt"
          >
            <User className="w-3.5 h-3.5 text-blue-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
