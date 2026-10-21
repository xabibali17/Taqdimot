import React, { useState } from 'react';
import { ServiceType, ServiceCategory, Language } from '../types';
import { translations } from '../locales/translations';
import { 
  Presentation, FileSpreadsheet, Sparkles, BookOpen, 
  GraduationCap, HelpCircle, FileText, CheckCircle, 
  Layers, Volume2, Gamepad2, Award, Globe, 
  UserCheck, AlignLeft, Send, ArrowRight 
} from 'lucide-react';

interface ServicesGridProps {
  onSelectService: (service: ServiceType) => void;
  lang: Language;
}

export const ServicesGrid: React.FC<ServicesGridProps> = ({ onSelectService, lang }) => {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'all'>('all');
  const t = translations[lang];

  const serviceIcons: Record<ServiceType, any> = {
    taqdimot: Presentation,
    oddiy_taqdimot: Layers,
    fayldan_taqdimot: FileSpreadsheet,
    infografika: Sparkles,
    referat: BookOpen,
    mustaqil_ish: GraduationCap,
    tezis: Award,
    kurs_ishi: FileText,
    dars_rejasi: CheckCircle,
    diplom: GraduationCap,
    test: HelpCircle,
    krossvord: Gamepad2,
    tinglash: Volume2,
    viktorina: Award,
    insho: AlignLeft,
    maqola: FileText,
    tarjima: Globe,
    rezyume: UserCheck,
    konspekt: AlignLeft,
    motivatsion_xat: Send,
  };

  const categories: { id: ServiceCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'Barchasi' },
    { id: 'presentation', label: t.categories.presentation },
    { id: 'academic', label: t.categories.academic },
    { id: 'interactive', label: t.categories.interactive },
    { id: 'text', label: t.categories.text },
  ];

  const serviceCategoryMap: Record<ServiceType, ServiceCategory> = {
    taqdimot: 'presentation',
    oddiy_taqdimot: 'presentation',
    fayldan_taqdimot: 'presentation',
    infografika: 'presentation',
    referat: 'academic',
    mustaqil_ish: 'academic',
    tezis: 'academic',
    kurs_ishi: 'academic',
    dars_rejasi: 'academic',
    diplom: 'academic',
    test: 'interactive',
    krossvord: 'interactive',
    tinglash: 'interactive',
    viktorina: 'interactive',
    insho: 'text',
    maqola: 'text',
    tarjima: 'text',
    rezyume: 'text',
    konspekt: 'text',
    motivatsion_xat: 'text',
  };

  const serviceKeys = Object.keys(serviceCategoryMap) as ServiceType[];
  const filteredServices = activeCategory === 'all'
    ? serviceKeys
    : serviceKeys.filter(k => serviceCategoryMap[k] === activeCategory);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-28">
      {/* Hero Banner / Highlight */}
      <div className="bg-gradient-to-br from-blue-900/60 via-slate-900 to-indigo-950/60 border border-blue-500/20 rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-400/20 rounded-full text-blue-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Ta'lim Ekotizimi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            Professional Taqdimot va Akademik Ishlar
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5">
            Slaydlar (PPTX va PDF), Referat, Mustaqil ish, Testlar va Maqolalarni sun'iy intellekt yordamida bir necha daqiqada tayyorlang.
          </p>

          <button
            onClick={() => onSelectService('taqdimot')}
            className="min-h-[46px] px-5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all"
          >
            <span>Taqdimot yaratish</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Floating gradient decoration */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Category Filter Pills (Functional interactive tab controls) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 scrollbar-thin">
        {categories.map((c) => {
          const isActive = activeCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredServices.map((key) => {
          const service = t.services[key];
          const Icon = serviceIcons[key] || FileText;
          return (
            <button
              key={key}
              onClick={() => onSelectService(key)}
              className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-5 text-left transition-all duration-200 group flex flex-col justify-between shadow-lg relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 group-hover:bg-blue-600/10 border border-slate-700/60 group-hover:border-blue-500/30 flex items-center justify-center text-slate-300 group-hover:text-blue-400 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  {service?.tag && (
                    <span className="text-[10px] font-semibold text-slate-400 group-hover:text-blue-400 transition-colors">
                      {service.tag}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors mb-1.5">
                  {service?.title || key}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {service?.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 group-hover:text-blue-400 font-medium">
                <span>Yaratish</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
