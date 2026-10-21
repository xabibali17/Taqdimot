import React, { useState } from 'react';
import { 
  Language, TierLevel, FontSizeOption, DesignTheme, PresentationData, AppSettings 
} from '../types';
import { translations } from '../locales/translations';
import { 
  PRESENTATION_TEMPLATES, TEMPLATE_CATEGORIES, PresentationTemplate 
} from '../data/presentationTemplates';
import { 
  ArrowLeft, ArrowRight, Sparkles, Check, 
  Wand2, Palette, Type, Clock, Image, Layers, Star, Search, User 
} from 'lucide-react';

interface PresentationWizardProps {
  initialLang: Language;
  onComplete: (presentation: PresentationData) => void;
  onCancel: () => void;
  userBalance: number;
  isVip: boolean;
  settings?: AppSettings;
}

export const PresentationWizard: React.FC<PresentationWizardProps> = ({
  initialLang,
  onComplete,
  onCancel,
  userBalance,
  isVip,
  settings,
}) => {
  // Simplified 7 streamlined steps
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [lang, setLang] = useState<Language>(initialLang);
  const [topic, setTopic] = useState<string>('');

  // Step 2 AI Refinement
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [refinedTitle, setRefinedTitle] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestedOutline, setSuggestedOutline] = useState<string[]>([]);
  const [selectedTopicVariant, setSelectedTopicVariant] = useState<string>('');

  // Step 3: Metadata (Student, Subject, Teacher - on one single clean screen)
  const [studentName, setStudentName] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [teacherName, setTeacherName] = useState<string>('');

  // Step 4: Outline
  const [outlineMode, setOutlineMode] = useState<'ai' | 'manual'>('ai');
  const [manualOutlineText, setManualOutlineText] = useState<string>('');

  // Step 5: Tier
  const [tier, setTier] = useState<TierLevel>('PRO');

  // Step 6: Slide Count & Font Size
  const [slideCount, setSlideCount] = useState<number>(10);
  const [fontSize, setFontSize] = useState<FontSizeOption>('O\'rtacha');

  // Step 7: 100+ Templates & Theme
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('biz-01');
  const [selectedCategory, setSelectedCategory] = useState<string>('Barchasi');
  const [templateSearch, setTemplateSearch] = useState<string>('');
  const [theme, setTheme] = useState<DesignTheme>('Modern Dark');

  // Galereyadan shaxsiy rasm yuklash (User uploaded photos)
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);

  // Generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStage, setGenerationStage] = useState<string>('Mavzu tahlil qilinmoqda...');

  const t = translations[lang];

  // AI Refine when completing step 2
  const handleProceedFromStep2 = async () => {
    if (!topic.trim()) return;
    setIsRefining(true);
    try {
      const res = await fetch('/api/gemini/refine-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, lang })
      });
      const data = await res.json();
      setRefinedTitle(data.refinedTitle || topic);
      setSuggestions(data.suggestions || []);
      setSuggestedOutline(data.suggestedOutline || []);
      setSelectedTopicVariant(data.refinedTitle || topic);
    } catch {
      setSelectedTopicVariant(topic);
    } finally {
      setIsRefining(false);
    }
  };

  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setGenerationStage('AI ilmiy reja va slaydlar tuzilmasini yaratmoqda...');

    const outlineArray = outlineMode === 'manual'
      ? manualOutlineText.split('\n').filter(l => l.trim().length > 0)
      : suggestedOutline;

    const chosenTemplate = PRESENTATION_TEMPLATES.find(p => p.id === selectedTemplateId) || PRESENTATION_TEMPLATES[0];

    try {
      setGenerationStage('Mavzuga mos ramkalar, personaj va sifatli rasmlar integratsiya qilinmoqda...');
      
      const res = await fetch('/api/gemini/generate-presentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedTopicVariant || topic,
          studentName,
          subject,
          teacherName,
          outline: outlineArray,
          tier,
          slideCount,
          fontSize,
          theme: chosenTemplate.name,
          templateId: chosenTemplate.id,
          lang
        })
      });

      const data = await res.json();

      const rawSlides = data.slides || [];
      const enrichedSlides = rawSlides.map((s: any, idx: number) => {
        // If user uploaded a custom gallery picture for this slot, use it!
        if (galleryPhotos[idx]) {
          return { ...s, imageUrl: galleryPhotos[idx] };
        }
        return s;
      });

      const newPresentation: PresentationData = {
        id: `pres-${Date.now()}`,
        title: data.title || selectedTopicVariant || topic,
        subtitle: data.subtitle,
        studentName,
        subject,
        teacherName,
        tier,
        slideCount,
        fontSize,
        theme: (chosenTemplate.name as any) || theme,
        templateId: chosenTemplate.id,
        templateName: chosenTemplate.name,
        lang,
        slides: enrichedSlides,
        createdAt: new Date().toISOString()
      };

      setGenerationStage('Taqdimot tayyorlandi!');
      setTimeout(() => {
        setIsGenerating(false);
        onComplete(newPresentation);
      }, 500);
    } catch (err) {
      console.error(err);
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-in fade-in duration-200">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 mx-auto flex items-center justify-center text-blue-400 mb-5">
            <Wand2 className="w-8 h-8 animate-spin" style={{ animationDuration: '2s' }} />
          </div>

          <h3 className="text-xl font-bold text-white mb-2">
            Taqdimot tezkor yaratilmoqda
          </h3>
          
          <p className="text-xs text-blue-400 font-semibold mb-6 animate-pulse">
            {generationStage}
          </p>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full w-3/4 animate-pulse rounded-full" />
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>@TAQDIMIY_BOT yuqori tezlikda generatsiya qilmoqda</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-4 pb-24">
      {/* Top Wizard Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            if (currentStep > 1) setCurrentStep(currentStep - 1);
            else onCancel();
          }}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <span className="text-xs font-bold text-blue-400 tracking-wider uppercase">
            Bosqich {currentStep} dan 7
          </span>
          <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1 mx-auto">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 7) * 100}%` }}
            />
          </div>
        </div>

        <button
          onClick={onCancel}
          className="min-h-[44px] px-3 flex items-center justify-center text-xs text-slate-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* STEP 1: Til tanlash */}
      {currentStep === 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl animate-in fade-in duration-150">
          <h3 className="text-lg font-bold text-white mb-1">
            1. Taqdimot tilini tanlang
          </h3>
          <p className="text-xs text-slate-400 mb-5">
            Taqdimot qaysi tilda shakllantirilishi kerak?
          </p>

          <div className="space-y-2.5">
            {[
              { id: 'uz', label: "O'zbek tili", sub: "Lotin va Kirill standartlari" },
              { id: 'ru', label: "Русский язык", sub: "Международный академический формат" },
              { id: 'en', label: "English", sub: "Global academic & presentation standard" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setLang(item.id as Language)}
                className={`w-full min-h-[50px] p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  lang === item.id
                    ? 'bg-blue-600/10 border-blue-500 text-white shadow-md'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="font-bold text-sm">{item.label}</div>
                  <div className="text-[11px] text-slate-400">{item.sub}</div>
                </div>
                {lang === item.id && (
                  <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(2)}
              className="w-full min-h-[46px] py-3 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              <span>Davom etish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Mavzu kiritish -> AI aniqlashtirish so'rovi */}
      {currentStep === 2 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl animate-in fade-in duration-150">
          <h3 className="text-lg font-bold text-white mb-1">
            2. Taqdimot mavzusi va AI taklifi
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Mavzuni kiriting. AI uni yanada aniq va ilmiy variantlarga aylantirib beradi.
          </p>

          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Masalan: Qayta tiklanuvchi energiya manbalari va yashil iqtisodiyot..."
            rows={3}
            className="w-full p-3.5 bg-slate-800/60 border border-slate-700 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 mb-3"
          />

          {!refinedTitle ? (
            <button
              disabled={!topic.trim() || isRefining}
              onClick={handleProceedFromStep2}
              className={`w-full min-h-[44px] py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                topic.trim() && !isRefining
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isRefining ? (
                <>
                  <Wand2 className="w-4 h-4 animate-spin text-blue-300" />
                  <span>AI mavzuni optimallashtirmoqda...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-300" />
                  <span>AI mavzuni aniqlashtirsin</span>
                </>
              )}
            </button>
          ) : (
            <div className="space-y-2 mt-3 p-3 bg-slate-800/40 border border-slate-700/60 rounded-2xl">
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block mb-1">
                AI tavsiya etgan ilmiy variant:
              </span>
              <button
                onClick={() => setSelectedTopicVariant(refinedTitle)}
                className={`w-full p-3 rounded-xl border text-left text-xs transition-all ${
                  selectedTopicVariant === refinedTitle
                    ? 'bg-blue-600/10 border-blue-500 text-white font-semibold'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                {refinedTitle}
              </button>

              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedTopicVariant(sug)}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all ${
                    selectedTopicVariant === sug
                      ? 'bg-blue-600/10 border-blue-500 text-white font-semibold'
                      : 'bg-slate-800/60 border-slate-700/50 text-slate-300'
                  }`}
                >
                  {sug}
                </button>
              ))}

              <button
                onClick={() => setSelectedTopicVariant(topic)}
                className="w-full text-left text-[11px] text-slate-400 hover:text-slate-200 pt-1"
              >
                Asl variantda qoldirish: "{topic}"
              </button>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              disabled={!topic.trim()}
              onClick={() => {
                if (!selectedTopicVariant) setSelectedTopicVariant(topic);
                setCurrentStep(3);
              }}
              className={`w-full min-h-[46px] py-3 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 ${
                topic.trim()
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Davom etish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Metama'lumotlar (O'quvchi, Fan, O'qituvchi - ixtiyoriy, o'tkazib yuborish imkoniyati) */}
      {currentStep === 3 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl animate-in fade-in duration-150">
          <h3 className="text-lg font-bold text-white mb-1">
            3. Muallif va fan ma'lumotlari
          </h3>
          <p className="text-xs text-slate-400 mb-5">
            Bular slayd muqovasida ko'rsatiladi (ixtiyoriy, to'ldirmasdan o'tkazib yuborishingiz mumkin).
          </p>

          <div className="space-y-3 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                O'quvchi / Talaba F.I.Sh
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Masalan: Jasur Beknazarov"
                className="w-full p-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Fan nomi
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Masalan: Informatika, Iqtisodiyot..."
                className="w-full p-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                O'qituvchi / Ilmiy rahbar
              </label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="Masalan: dots. Karimov A."
                className="w-full p-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex gap-2">
            <button
              onClick={() => setCurrentStep(4)}
              className="w-1/3 min-h-[46px] py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
            >
              O'tkazib yuborish
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="w-2/3 min-h-[46px] py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <span>Davom etish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Reja (AI tuzishi yoki foydalanuvchi kiritishi) */}
      {currentStep === 4 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl animate-in fade-in duration-150">
          <h3 className="text-lg font-bold text-white mb-1">
            4. Taqdimot rejasi
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Rejani AI avtomatik ilmiy tuzsinmi yoki o'zingiz kiritasizmi?
          </p>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => setOutlineMode('ai')}
              className={`p-3 rounded-xl border text-center transition-all ${
                outlineMode === 'ai'
                  ? 'bg-blue-600/10 border-blue-500 text-white font-bold'
                  : 'bg-slate-800/40 border-slate-700 text-slate-400'
              }`}
            >
              <Sparkles className="w-4 h-4 mx-auto mb-1 text-blue-400" />
              <span className="text-xs">AI avtomatik tuzsin</span>
            </button>
            <button
              onClick={() => setOutlineMode('manual')}
              className={`p-3 rounded-xl border text-center transition-all ${
                outlineMode === 'manual'
                  ? 'bg-blue-600/10 border-blue-500 text-white font-bold'
                  : 'bg-slate-800/40 border-slate-700 text-slate-400'
              }`}
            >
              <Type className="w-4 h-4 mx-auto mb-1 text-slate-300" />
              <span className="text-xs">O'zim kiritaman</span>
            </button>
          </div>

          {outlineMode === 'ai' ? (
            <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-1.5 text-xs text-slate-300">
              <span className="font-bold text-blue-400 block mb-1">
                Tavsiya etiladigan tuzilma:
              </span>
              <div>1. Muqova va dolzarblik</div>
              <div>2. Nazariy tushunchalar va asoslar</div>
              <div>3. Amaliy tahlillar va statistika</div>
              <div>4. Muammolar va istiqbolli yechimlar</div>
              <div>5. Xulosa va adabiyotlar</div>
            </div>
          ) : (
            <textarea
              value={manualOutlineText}
              onChange={(e) => setManualOutlineText(e.target.value)}
              placeholder="Har bir reja bandini yangi qatordan yozing..."
              rows={4}
              className="w-full p-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          )}

          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(5)}
              className="w-full min-h-[46px] py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Davom etish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Tarif tanlash (Standart, Premium, PRO) */}
      {currentStep === 5 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl animate-in fade-in duration-150">
          <h3 className="text-lg font-bold text-white mb-1">
            5. Tarifni tanlang
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            PRO tarifda sun'iy intellekt avtomatik zamonaviy ramkalar va sifatli rasmlarni joylashtiradi!
          </p>

          <div className="space-y-3 mb-6">
            {/* PRO TIER HIGHLIGHT */}
            <button
              onClick={() => {
                setTier('PRO');
                setSlideCount(10);
              }}
              className={`w-full p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                tier === 'PRO'
                  ? 'bg-gradient-to-r from-blue-900/40 via-slate-900 to-indigo-900/40 border-blue-500 text-white ring-1 ring-blue-500 shadow-xl'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-black text-base text-white">💎 PRO</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 font-bold text-[10px] uppercase border border-cyan-400/30">
                    Mukammal Vizual
                  </span>
                </div>
                <span className="text-sm font-black text-blue-400">
                  {settings?.tierPrices?.pro?.toLocaleString() || '9,000'} so'm
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                • Barcha rasmlarni eng kuchli AI chizadi.<br />
                • Mavzuga mos naqshli ramkalar (Blueprint, Islimiy, Oltin).<br />
                • Har bir betga mos professional illyustratsiya va personajlar.
              </p>
            </button>

            {/* Premium Tier */}
            <button
              onClick={() => {
                setTier('Premium');
                setSlideCount(8);
              }}
              className={`w-full p-3.5 rounded-2xl border text-left transition-all ${
                tier === 'Premium'
                  ? 'bg-blue-600/10 border-blue-500 text-white font-semibold shadow-md'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-white">✨ Premium</span>
                  <span className="text-[10px] text-amber-400 font-bold">⭐ tavsiya</span>
                </div>
                <span className="text-xs font-bold text-blue-400">
                  {settings?.tierPrices?.premium?.toLocaleString() || '6,000'} so'm
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Muqova va rasmlarning yarmi — eng kuchli AI. Odam yoki yozuv kerak bo'lgan betlar birinchi navbatda beriladi.
              </p>
            </button>

            {/* Standart Tier */}
            <button
              onClick={() => {
                setTier('Standart');
                setSlideCount(6);
              }}
              className={`w-full p-3.5 rounded-2xl border text-left transition-all ${
                tier === 'Standart'
                  ? 'bg-blue-600/10 border-blue-500 text-white font-semibold shadow-md'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-white">📄 Standart</span>
                <span className="text-xs font-bold text-blue-400">
                  {settings?.tierPrices?.standart?.toLocaleString() || '3,000'} so'm
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Muqovani eng kuchli AI chizadi. Ichki rasmlarni eng oddiy (tezkor) AI chizadi.
              </p>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(6)}
              className="w-full min-h-[46px] py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Davom etish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: Slaydlar soni, Shrift va Shaxsiy Galereya Rasmlari */}
      {currentStep === 6 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl animate-in fade-in duration-150 space-y-5">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              6. Hajm va Rasmlar
            </h3>
            <p className="text-xs text-slate-400">
              Slaydlar soni, shrift va xohlasangiz o'z shaxsiy rasmlaringizni qo'shing.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Slaydlar soni: <span className="text-blue-400 font-bold">{slideCount} ta slayd</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[6, 8, 10, 14].map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => setSlideCount(cnt)}
                    className={`min-h-[40px] py-2 rounded-xl text-xs font-bold border transition-all ${
                      slideCount === cnt
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {cnt} slayd
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Shrift o'lchami va matn zichligi:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'Kam', label: 'Kam' },
                  { id: 'O\'rtacha', label: 'O\'rtacha' },
                  { id: 'Ko\'p', label: 'Ko\'p' },
                  { id: 'Maksimal', label: 'Maksimal' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFontSize(f.id as FontSizeOption)}
                    className={`min-h-[40px] py-2 rounded-xl text-xs font-semibold border transition-all ${
                      fontSize === f.id
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Galereyadan Shaxsiy Rasm Yuklash (As requested) */}
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Image className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Galereyadan shaxsiy rasm yuklash</span>
                  </span>
                  <p className="text-[10px] text-slate-400">
                    O'zingizning rasmlaringiz slaydlar ichiga boyitilib joylanadi
                  </p>
                </div>
                <label className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1">
                  <span>Rasm tanlash</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      files.forEach(file => {
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === 'string') {
                            setGalleryPhotos(prev => [...prev, reader.result as string]);
                          }
                        };
                        reader.readAsDataURL(file);
                      });
                    }}
                  />
                </label>
              </div>

              {galleryPhotos.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {galleryPhotos.map((photo, pIdx) => (
                    <div key={pIdx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-blue-500/40 shrink-0 group">
                      <img src={photo} alt="Yuklangan rasm" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setGalleryPhotos(prev => prev.filter((_, i) => i !== pIdx))}
                        className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px] shadow"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <span className="text-[10px] text-emerald-400 font-bold shrink-0">
                    ✓ {galleryPhotos.length} ta rasm tayyor
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(7)}
              className="w-full min-h-[46px] py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Davom etish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: 100+ Dizayn shablonlarini tanlash */}
      {currentStep === 7 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl animate-in fade-in duration-150 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-400">
              <Palette className="w-5 h-5 text-blue-400" />
              <h3 className="text-base sm:text-lg font-black text-white">
                7. Dizayn shabloni (100+)
              </h3>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
              {PRESENTATION_TEMPLATES.length} ta shablon
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Mavzuingizga mos keluvchi ranglar, professional ramkalar va personaj uslubini tanlang:
          </p>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
              placeholder="Shablon yoki soha bo'yicha qidirish..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Categories Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {TEMPLATE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Templates Scrollable Grid */}
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1 overscroll-contain">
            {PRESENTATION_TEMPLATES.filter((tpl) => {
              const matchCat = selectedCategory === 'Barchasi' || tpl.category === selectedCategory;
              const matchSearch = !templateSearch.trim() || 
                tpl.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
                tpl.category.toLowerCase().includes(templateSearch.toLowerCase()) ||
                tpl.characterRole.toLowerCase().includes(templateSearch.toLowerCase());
              return matchCat && matchSearch;
            }).map((tpl) => {
              const isSelected = selectedTemplateId === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500 shadow-md'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Visual Color Swatch */}
                    <div 
                      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tpl.bgGradient} border flex items-center justify-center shrink-0 shadow-sm`}
                      style={{ borderColor: tpl.accentColor }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tpl.accentColor }} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-bold text-white truncate">
                          {tpl.name}
                        </h4>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                          {tpl.badge}
                        </span>
                      </div>

                      <p className="text-[10px] text-blue-400 font-medium truncate mt-0.5">
                        {tpl.category}
                      </p>

                      <p className="text-[9px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                        <User className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                        <span>Personaj: {tpl.characterRole}</span>
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700'
                    }`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Template Summary */}
          {(() => {
            const currentTpl = PRESENTATION_TEMPLATES.find(p => p.id === selectedTemplateId);
            return currentTpl ? (
              <div className="p-2.5 bg-slate-950/90 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Tanlangan shablon:</span>
                <span className="font-bold text-white flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentTpl.accentColor }} />
                  {currentTpl.name} ({currentTpl.badge})
                </span>
              </div>
            ) : null;
          })()}

          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={handleStartGeneration}
              className="w-full min-h-[48px] py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:opacity-95 active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2"
            >
              <Wand2 className="w-4 h-4 text-white" />
              <span>Taqdimotni yaratish (PPTX &amp; PDF)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
