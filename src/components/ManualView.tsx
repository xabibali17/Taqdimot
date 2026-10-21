import React, { useState } from 'react';
import { Language, AppSettings } from '../types';
import { translations } from '../locales/translations';
import { BookOpen, MessageSquare, ExternalLink, ShieldCheck, Lock } from 'lucide-react';

interface ManualViewProps {
  lang: Language;
  settings?: AppSettings;
  onOpenSecretAdmin?: () => void;
}

export const ManualView: React.FC<ManualViewProps> = ({ 
  lang, 
  settings, 
  onOpenSecretAdmin 
}) => {
  const t = translations[lang];
  const [secretClickCount, setSecretClickCount] = useState<number>(0);

  const handleSecretTap = () => {
    const next = secretClickCount + 1;
    setSecretClickCount(next);
    if (next >= 5) {
      setSecretClickCount(0);
      if (onOpenSecretAdmin) onOpenSecretAdmin();
    }
  };

  const supportUser = settings?.supportUsername || '@TaqdimiySupport';

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-28 space-y-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              @TAQDIMIY_BOT Qo'llanmasi
            </h1>
            <p className="text-xs text-slate-400">
              Platforma xizmatlaridan maksimal darajada tezkor va xatosiz foydalanish yo'riqnomasi
            </p>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-3.5 my-6">
          <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-2xl space-y-1.5">
            <h3 className="text-xs sm:text-sm font-bold text-blue-300">
              1. Taqdimot yaratish qanday amalga oshiriladi?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Xizmatlar bo'limidan "Taqdimot"ni tanlang. 7 ta soddalashtirilgan qadamda til, mavzu, muallif, reja va tarifni belgilang. PRO tarifida AI avtomatik zamonaviy ramkalar va sifatli rasmlarni joylashtirib, PPTX va PDF formatlarda bir vaqtda taqdim etadi.
            </p>
          </div>

          <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-2xl space-y-1.5">
            <h3 className="text-xs sm:text-sm font-bold text-blue-300">
              2. Balansni qanday to'ldirish mumkin?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Balans bo'limida ko'rsatilgan Uzcard/Humo karta raqamiga to'lov qilasiz va chekni (rasm yoki PDF) yuklaysiz. Chek administrator tomonidan tasdiqlanishi bilan mablag' balansingizga qo'shiladi.
            </p>
          </div>

          <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-2xl space-y-1.5">
            <h3 className="text-xs sm:text-sm font-bold text-blue-300">
              3. Do'stlarni taklif qilib qanday pul topish mumkin?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Balans bo'limidagi shaxsiy referal havolangizni nusxalab, do'stlaringizga yuboring. Har bir taklif etilgan faol do'stingiz uchun hisobingizga 5 000 so'm bonus beriladi.
            </p>
          </div>
        </div>

        {/* Dynamic Support Section */}
        <div className="p-5 bg-gradient-to-r from-blue-950/70 to-slate-900 border border-blue-500/30 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span>Qo'llab-quvvatlash xizmati</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {settings?.supportText || "Barcha savollar, takliflar yoki to'lov bo'yicha masalalar bo'yicha qo'llab-quvvatlash xizmati bilan bog'laning:"}
          </p>

          <a
            href={`https://t.me/${supportUser.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
          >
            <span>Bog'lanish: {supportUser}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Subtle hidden secret trigger for chief admin only */}
        <div className="mt-8 text-center pt-4 border-t border-slate-800/60">
          <button
            onClick={handleSecretTap}
            className="text-[10px] text-slate-600 hover:text-slate-500 transition-colors select-none"
          >
            @TAQDIMIY_BOT v2.6.4 · Barcha huquqlar himoyalangan
          </button>
        </div>
      </div>
    </div>
  );
};
