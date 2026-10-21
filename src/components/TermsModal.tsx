import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../locales/translations';

interface TermsModalProps {
  lang: Language;
  onAccept: () => void;
  isOpen: boolean;
}

export const TermsModal: React.FC<TermsModalProps> = ({ lang, onAccept, isOpen }) => {
  const t = translations[lang];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">
          {t.termsModal.title}
        </h3>

        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          {t.termsModal.body}
        </p>

        <div className="space-y-2 mb-6">
          <div className="flex items-start gap-2 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{t.termsModal.bullet1}</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{t.termsModal.bullet2}</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{t.termsModal.bullet3}</span>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onAccept}
            className="w-full min-h-[48px] py-3 px-4 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
          >
            {t.termsModal.acceptBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
