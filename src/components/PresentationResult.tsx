import React, { useState, useRef } from 'react';
import { PresentationData, Language, AppSettings } from '../types';
import { exportToPptx } from '../utils/pptxExport';
import { TelegramDeliveryModal } from './TelegramDeliveryModal';
import { 
  Download, Printer, ChevronLeft, ChevronRight, Star, 
  Copy, Check, MessageSquare, ArrowLeft, Image as ImageIcon, Sparkles, 
  Send, Upload, Palette, Layers, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PresentationResultProps {
  presentation: PresentationData;
  onBack: () => void;
  lang: Language;
  onSaveRating?: (id: string, rating: number, comment?: string) => void;
  onEdit?: () => void;
  userBalance?: number;
  settings?: AppSettings;
}

export type FrameType = 'blueprint' | 'islimiy' | 'minimal' | 'gold_bezel' | 'cyber_grid';

export const PresentationResult: React.FC<PresentationResultProps> = ({
  presentation,
  onBack,
  lang,
  onSaveRating,
  onEdit,
  userBalance = 35000,
  settings,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [userRating, setUserRating] = useState<number>(presentation.rating || 5);
  const [showDeliveryModal, setShowDeliveryModal] = useState<boolean>(false);
  const [selectedFrame, setSelectedFrame] = useState<FrameType>('blueprint');
  
  // Custom uploaded photos by slide index
  const [customSlideImages, setCustomSlideImages] = useState<Record<number, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const slides = presentation.slides;
  const currentSlide = slides[currentSlideIndex] || slides[0];
  const isPro = presentation.tier === 'PRO';

  // Current active image (user uploaded or AI curated)
  const currentImageUrl = customSlideImages[currentSlideIndex] || currentSlide.imageUrl;

  const handlePptxDownload = async () => {
    setIsExporting(true);
    try {
      // Create clone with custom images if any
      const presentationToExport = {
        ...presentation,
        slides: presentation.slides.map((s, idx) => ({
          ...s,
          imageUrl: customSlideImages[idx] || s.imageUrl,
        }))
      };
      await exportToPptx(presentationToExport);
    } catch (err) {
      console.error('PPTX export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleCopyText = () => {
    let fullText = `# ${presentation.title}\n\n`;
    slides.forEach((s) => {
      fullText += `## ${s.slideNumber}. ${s.title}\n`;
      if (s.subtitle) fullText += `*${s.subtitle}*\n\n`;
      s.contentPoints.forEach((pt) => {
        fullText += `- ${pt}\n`;
      });
      if (s.highlightText) fullText += `\n> ${s.highlightText}\n`;
      if (s.speakerNotes) fullText += `\nSpeaker Notes: ${s.speakerNotes}\n`;
      fullText += '\n---\n\n';
    });

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCustomSlideImages(prev => ({
            ...prev,
            [currentSlideIndex]: reader.result as string
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const isOutlineSlide = 
    currentSlide.slideNumber === 2 || 
    currentSlide.title.toLowerCase().includes('reja') || 
    currentSlide.title.toLowerCase().includes('mundarija');

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-4 pb-28 space-y-4">
      {/* Hidden File Input for Custom Gallery Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleGalleryUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Top back & primary action strip */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <button
          onClick={onBack}
          className="min-h-[40px] flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Orqaga</span>
        </button>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Telegram Shaxsiy Xabarga Yuborish Button (As requested) */}
          <button
            onClick={() => setShowDeliveryModal(true)}
            className="min-h-[38px] px-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 active:scale-[0.98] text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-500/25 flex items-center gap-1.5 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Shaxsiy xabarga yuborish</span>
          </button>

          <button
            onClick={handleCopyText}
            className="min-h-[38px] px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl flex items-center gap-1 transition-colors"
            title="Matnni nusxalash"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Nusxalash</span>
          </button>

          {/* DUAL FORMAT DELIVERY: PDF */}
          <button
            onClick={handlePrintPdf}
            className="min-h-[38px] px-3 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors shadow-sm"
            title="PDF formatda ko'rish va chop etish"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF</span>
          </button>

          {/* DUAL FORMAT DELIVERY: PPTX */}
          <button
            onClick={handlePptxDownload}
            disabled={isExporting}
            className="min-h-[38px] px-3.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Yuklanmoqda...' : 'PPTX'}</span>
          </button>
        </div>
      </div>

      {/* Frame Style & Upload Controls Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 flex items-center justify-between gap-2 flex-wrap text-xs">
        {/* Frame Style selector pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Palette className="w-3 h-3 text-blue-400" />
            <span>Ramka:</span>
          </span>
          {[
            { id: 'blueprint', label: '📐 Blueprint (Texnik)' },
            { id: 'cyber_grid', label: '⚡ Kiber / Smart (IMG_6378)' },
            { id: 'islimiy', label: '🕌 Islimiy Naqsh (Milliy)' },
            { id: 'gold_bezel', label: '👑 Oltin Bezel (IMG_6377)' },
            { id: 'minimal', label: '◻️ Minimalist' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFrame(f.id as FrameType)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors shrink-0 ${
                selectedFrame === f.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Gallery Image Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white border border-slate-700 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors shrink-0"
        >
          <Upload className="w-3 h-3 text-cyan-400" />
          <span>Galereyadan rasm yuklash</span>
        </button>
      </div>

      {/* Main Slide Canvas (Styled based on IMG_6376 Blueprint aesthetics & IMG_6378 Cyber) */}
      <div 
        className={`rounded-3xl p-5 sm:p-8 shadow-2xl relative min-h-[460px] flex flex-col justify-between overflow-hidden transition-all text-slate-100 ${
          selectedFrame === 'blueprint'
            ? 'bg-[#0B1528] border-2 border-[#1E3A8A]/80 ring-1 ring-blue-500/30'
            : selectedFrame === 'cyber_grid'
            ? 'bg-[#060D1A] border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/30'
            : selectedFrame === 'islimiy'
            ? 'bg-gradient-to-br from-[#0A192F] via-[#0D1F3C] to-[#0A192F] border-2 border-amber-500/40'
            : selectedFrame === 'gold_bezel'
            ? 'bg-gradient-to-br from-black via-zinc-950 to-neutral-950 border-2 border-amber-500/50'
            : 'bg-slate-900 border border-slate-800'
        }`}
      >
        {/* Decorative Technical Blueprint Marks (like IMG_6376) */}
        {selectedFrame === 'blueprint' && (
          <>
            <div className="absolute top-3 left-4 text-[9px] font-mono text-blue-400/60 uppercase tracking-widest pointer-events-none">
              GRID // LAT: 41.2995° N · LON: 69.2401° E
            </div>
            <div className="absolute top-3 right-4 px-2 py-0.5 border border-blue-400/40 rounded text-[10px] font-mono text-blue-300">
              {String(currentSlide.slideNumber).padStart(2, '0')}
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(#1E3A8A_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
          </>
        )}

        {/* Cyber Grid Tech Marks (like IMG_6378) */}
        {selectedFrame === 'cyber_grid' && (
          <>
            <div className="absolute top-3 left-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[9px] font-mono text-cyan-300 uppercase tracking-wider">
                CYBER-PRO // SLIDE {String(currentSlide.slideNumber).padStart(2, '0')}
              </span>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-500/10 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d40a_1px,transparent_1px),linear-gradient(to_bottom,#06b6d40a_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
          </>
        )}

        {/* Islimiy Milliy Naqsh Accents */}
        {selectedFrame === 'islimiy' && (
          <>
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-sky-400 to-amber-500" />
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-sky-400 to-amber-500" />
            <div className="absolute top-3 right-3 text-[10px] font-black uppercase text-amber-300 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/40">
              🕌 Islimiy Naqshli PRO
            </div>
          </>
        )}

        {/* Gold Bezel Frame Accents (like IMG_6377) */}
        {selectedFrame === 'gold_bezel' && (
          <>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />
            <div className="absolute top-3 right-3 text-[10px] font-black uppercase text-amber-300 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/50">
              👑 Oltin Bezel Premium
            </div>
          </>
        )}

        {/* Slide 1: Cover Page */}
        {currentSlide.slideNumber === 1 ? (
          <div className="my-auto py-6 relative z-10 space-y-4">
            <div className="w-12 h-1 bg-blue-500 rounded-full mb-3" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-snug">
              {currentSlide.title}
            </h1>
            {currentSlide.subtitle && (
              <p className="text-sm sm:text-base text-slate-300 font-medium">
                {currentSlide.subtitle}
              </p>
            )}

            <div className="pt-6 border-t border-blue-500/30 text-xs font-mono text-blue-300/80 space-y-1">
              <p>TALABA: {presentation.studentName || 'Jasur Beknazarov'}</p>
              {presentation.subject && <p>FAN: {presentation.subject}</p>}
              {presentation.teacherName && <p>O'QITUVCHI: {presentation.teacherName}</p>}
            </div>
          </div>
        ) : isOutlineSlide ? (
          /* Slide 2: Reja / Mundarija timeline layout (Exactly like IMG_6376) */
          <div className="my-auto py-4 relative z-10 space-y-5">
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-blue-400 block">
                MUNDARIJA
              </span>
              <h2 className="text-2xl font-black text-white">Reja</h2>
            </div>

            {/* Horizontal Timeline Track */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              {currentSlide.contentPoints.slice(0, 5).map((point, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black font-mono text-white">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="h-0.5 bg-white/80 w-full" />
                  <p className="text-[11px] text-slate-300 leading-snug line-clamp-3">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Standard Slide Content */
          <div className="relative z-10 flex-1 flex flex-col justify-between py-2">
            {/* Header */}
            <div className="mb-4">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                {currentSlide.title}
              </h2>
              {currentSlide.subtitle && (
                <p className="text-xs sm:text-sm text-blue-400 font-semibold mt-1">
                  {currentSlide.subtitle}
                </p>
              )}
              <div className="w-16 h-0.5 bg-blue-500/60 mt-2" />
            </div>

            {/* Body */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 my-auto py-2">
              {/* Content Points */}
              <div className={`${currentImageUrl ? 'md:col-span-7' : 'md:col-span-12'} space-y-2.5`}>
                {currentSlide.contentPoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="text-blue-400 font-mono font-bold mt-0.5 text-xs">+</span>
                    <span className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                      {point}
                    </span>
                  </div>
                ))}

                {currentSlide.highlightText && (
                  <div className="mt-3 p-3 bg-slate-950/60 border border-blue-500/30 rounded-xl text-xs">
                    <span className="font-bold text-blue-400 uppercase tracking-wider text-[10px] block mb-1">
                      Asosiy ta'kid:
                    </span>
                    <p className="text-slate-200 italic font-medium">
                      "{currentSlide.highlightText}"
                    </p>
                  </div>
                )}
              </div>

              {/* Slide Thematic Image / Personal Gallery Photo */}
              {currentImageUrl && (
                <div className="md:col-span-5 flex flex-col justify-center space-y-2">
                  <div className="relative rounded-2xl overflow-hidden border-2 border-blue-500/40 shadow-xl group bg-slate-950">
                    {/* Technical Frame Badge like F-04 in IMG_6376 */}
                    <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-slate-900/90 border border-blue-400/50 rounded text-[9px] font-mono text-blue-300">
                      F-{String(currentSlideIndex + 1).padStart(2, '0')}
                    </div>

                    <img
                      src={currentImageUrl}
                      alt={currentSlide.title}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-2">
                      <span className="text-[10px] font-bold text-blue-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        {customSlideImages[currentSlideIndex] ? 'Shaxsiy rasm' : 'AI Mavzuga mos rasm'}
                      </span>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2 py-0.5 bg-blue-600/80 hover:bg-blue-600 text-[9px] font-bold text-white rounded transition-colors"
                      >
                        O'zgartirish
                      </button>
                    </div>
                  </div>

                  {/* Character Card if present */}
                  {currentSlide.characterName && (
                    <div className="p-2 bg-slate-950/80 border border-blue-500/20 rounded-xl flex items-center gap-2 text-xs">
                      {currentSlide.characterImage && (
                        <img
                          src={currentSlide.characterImage}
                          alt="Character"
                          className="w-8 h-8 rounded-lg object-cover border border-blue-400/40"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-white truncate">
                          {currentSlide.characterName}
                        </p>
                        <p className="text-[9px] text-blue-300 truncate">
                          {currentSlide.characterRole}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Slide Footer */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between relative z-10 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                showNotes ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Spiker nutqi</span>
            </button>
            <span className="text-slate-500 font-bold text-[11px] hidden sm:inline">
              @TAQDIMIY_BOT · {presentation.tier}
            </span>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              disabled={currentSlideIndex === 0}
              onClick={() => setCurrentSlideIndex(currentSlideIndex - 1)}
              className={`min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl transition-colors ${
                currentSlideIndex === 0 ? 'bg-slate-800/40 text-slate-600 cursor-not-allowed' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-slate-300 font-mono px-2">
              {currentSlideIndex + 1} / {slides.length}
            </span>

            <button
              disabled={currentSlideIndex === slides.length - 1}
              onClick={() => setCurrentSlideIndex(currentSlideIndex + 1)}
              className={`min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl transition-colors ${
                currentSlideIndex === slides.length - 1 ? 'bg-slate-800/40 text-slate-600 cursor-not-allowed' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Speaker Notes Drawer */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs space-y-1.5 shadow-lg"
          >
            <span className="font-bold text-blue-400 block uppercase tracking-wider text-[11px]">
              🎤 {currentSlide.slideNumber}-slayd spiker nutqi (Taqdimotda so'zlash uchun):
            </span>
            <p className="text-slate-200 leading-relaxed italic">
              "{currentSlide.speakerNotes || 'Ushbu slayd bo\'yicha mavzuning asosiy g\'oyalari va ilmiy amaliy ahamiyati bayon etiladi.'}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Telegram Shaxsiy Xabar Modal (IMG_6375 uslubida) */}
      <TelegramDeliveryModal
        isOpen={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
        presentation={presentation}
        onDownloadPptx={handlePptxDownload}
        onDownloadPdf={handlePrintPdf}
        userBalance={userBalance}
        onSaveRating={(r) => {
          setUserRating(r);
          if (onSaveRating) onSaveRating(presentation.id, r);
        }}
        onEdit={onEdit}
        settings={settings}
      />
    </div>
  );
};
