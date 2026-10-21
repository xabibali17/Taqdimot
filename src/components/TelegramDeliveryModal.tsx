import React, { useState } from 'react';
import { PresentationData, AppSettings } from '../types';
import { 
  X, Check, Download, FileText, Star, Share2, 
  Edit3, Folder, ExternalLink, Sparkles, Clock, CheckCheck, ChevronLeft, MoreVertical,
  Bell, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface TelegramDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  presentation: PresentationData;
  onDownloadPptx: () => void;
  onDownloadPdf: () => void;
  userBalance?: number;
  onSaveRating?: (rating: number) => void;
  onEdit?: () => void;
  settings?: AppSettings;
}

export const TelegramDeliveryModal: React.FC<TelegramDeliveryModalProps> = ({
  isOpen,
  onClose,
  presentation,
  onDownloadPptx,
  onDownloadPdf,
  userBalance = 0,
  onSaveRating,
  onEdit,
  settings,
}) => {
  const [selectedRating, setSelectedRating] = useState<number>(presentation.rating || 5);
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const botUsername = settings?.botUsername || '@TAQDIMIY_BOT';
  const botName = settings?.botName || '@TAQDIMIY_BOT';
  const botAvatar = settings?.avatarUrl || settings?.logoUrl;

  const handleRate = (stars: number) => {
    setSelectedRating(stars);
    setRatingSubmitted(true);
    if (onSaveRating) onSaveRating(stars);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  const handleShareToTelegram = () => {
    const text = encodeURIComponent(
      `📊 "${presentation.title}" mavzusidagi tayyor taqdimot fayllari (PPTX va PDF) tayyorlandi!\n\n🤖 ${botUsername} orqali tezkor va sifatli taqdimot yarating.`
    );
    window.open(`https://t.me/share/url?url=https://t.me/${botUsername.replace('@', '')}&text=${text}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md bg-[#0F1826] border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        >
          {/* Telegram Header Bar */}
          <div className="px-3.5 py-2.5 bg-[#17212B] border-b border-slate-800 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full hover:bg-slate-800/80 flex items-center justify-center text-slate-300 transition-colors"
                title="Yopish"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                {botAvatar ? (
                  <img src={botAvatar} alt="Bot" className="w-8 h-8 rounded-full object-cover border border-blue-400/50 shadow-md" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-xs shadow-md">
                    {botName.replace('@', '').slice(0, 1) || 'T'}
                  </div>
                )}
                <div>
                  <h3 className="text-xs font-bold leading-tight truncate max-w-[170px]">
                    {botName}
                  </h3>
                  <p className="text-[10px] text-slate-400 leading-none">
                    {botUsername} · Rasmiy Bot
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleShareToTelegram}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-blue-400 transition-colors"
                title="Ulashish"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sticky Ad Banner (Majburiy reklama ko'rsatuvi) */}
          <div className="px-3 py-1.5 bg-[#1E2C3A] border-b border-slate-800/80 flex items-center justify-between text-[11px] shrink-0">
            <div className="flex items-center gap-1.5 text-slate-300 truncate">
              <span className="font-bold text-amber-400 shrink-0">Reklama:</span>
              <span className="truncate">
                {botUsername} orqali 100+ tayyor slayd shablonlari va referatlarni yuklang 👆
              </span>
            </div>
            <span className="text-[10px] text-blue-400 font-mono shrink-0 ml-2">
              {botUsername}
            </span>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#0E1621] overscroll-contain">
            {/* Status indicator bubble: Shaxsiy bildirishnoma va vaqti */}
            <div className="bg-[#182533] border border-blue-500/30 rounded-2xl p-3 max-w-[92%] text-xs text-slate-200 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px]">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>Shaxsiy Bildirishnoma: Buyurtmangiz tayyor!</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Siz buyurtma bergan <strong>"{presentation.title}"</strong> mavzusidagi fayllar tayyorlandi va shaxsiy xabar orqali yuborildi.
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800">
                <span className="flex items-center gap-1 text-emerald-400 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>Yetkazilgan vaqt: {currentTime}</span>
                </span>
                <span className="text-blue-300 font-mono font-bold">{botUsername}</span>
              </div>
            </div>

            {/* PPTX Document Delivery Card */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-[#182533] border border-blue-500/40 rounded-2xl p-3 max-w-[92%] shadow-md space-y-2.5"
            >
              <div className="flex items-center gap-3">
                <div 
                  onClick={onDownloadPptx}
                  className="w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white flex items-center justify-center cursor-pointer shadow-md transition-all shrink-0"
                  title="PPTX ni yuklab olish"
                >
                  <Download className="w-5 h-5 animate-pulse" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white truncate">
                    {presentation.title}.pptx
                  </h4>
                  <p className="text-[10px] text-blue-400 font-medium">
                    1.4 MB · PowerPoint taqdimot
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-slate-200 space-y-1 bg-[#131D27] p-2.5 rounded-xl border border-slate-800">
                <p className="flex items-start gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{presentation.title}</span>
                </p>
                <p className="text-amber-400 text-[10px] font-semibold flex items-center gap-1">
                  <span>🎁 Bu safar PPTX animatsiyali — PRO'dan sovg'a (bir martalik)</span>
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <button
                  onClick={onDownloadPptx}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold rounded-lg transition-colors flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>PPTX Yuklash</span>
                </button>
                <span className="flex items-center gap-1">
                  <span>{currentTime}</span>
                  <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                </span>
              </div>
            </motion.div>

            {/* PDF Document Delivery Card */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-[#182533] border border-sky-500/40 rounded-2xl p-3 max-w-[92%] shadow-md space-y-2.5"
            >
              <div className="flex items-center gap-3">
                <div 
                  onClick={onDownloadPdf}
                  className="w-11 h-11 rounded-full bg-sky-600 hover:bg-sky-500 active:scale-95 text-white flex items-center justify-center cursor-pointer shadow-md transition-all shrink-0"
                  title="PDF ni ko'rish va yuklash"
                >
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white truncate">
                    {presentation.title}.pdf
                  </h4>
                  <p className="text-[10px] text-sky-400 font-medium">
                    1.6 MB · Adobe PDF Hujjat
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-slate-200 space-y-1 bg-[#131D27] p-2.5 rounded-xl border border-slate-800">
                <p className="flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Tayyor! (⏱️ 2 daq 45 s)</span>
                </p>
                <p className="text-[10px] text-slate-300 flex items-center gap-1">
                  <span>💳 Balans: {userBalance.toLocaleString()} so'm</span>
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <button
                  onClick={onDownloadPdf}
                  className="px-3 py-1 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-bold rounded-lg transition-colors flex items-center gap-1"
                >
                  <FileText className="w-3 h-3" />
                  <span>PDF Ko'rish</span>
                </button>
                <span className="flex items-center gap-1">
                  <span>{currentTime}</span>
                  <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                </span>
              </div>
            </motion.div>

            {/* Official Bot Username & Reklama stamp */}
            <div className="bg-gradient-to-r from-blue-950/60 via-[#182533] to-indigo-950/60 border border-blue-500/30 rounded-2xl p-3 text-center space-y-1 shadow-sm">
              <div className="flex items-center justify-center gap-1.5 text-xs text-white font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Rasmiy Bot: <strong>{botUsername}</strong></span>
              </div>
              <p className="text-[10px] text-slate-300 leading-snug">
                Talabalar va tadqiqotchilar uchun tezkor taqdimot va ilmiy ishlar platformasi. Slaydlarni do'stlaringizga ham ulashing!
              </p>
              <div className="pt-0.5">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-[10px] text-blue-400 font-mono font-bold">
                  {botUsername} · 24/7 Avtomatlashtirilgan xizmat
                </span>
              </div>
            </div>

            {/* Inline 5-Star Rating Buttons */}
            <div className="bg-[#182533] border border-slate-800 rounded-2xl p-2.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white text-[11px]">
                  Natijani baholang:
                </span>
                {ratingSubmitted && (
                  <span className="text-[10px] text-emerald-400 font-bold">
                    ✓ Rahmat! ({selectedRating} yulduz)
                  </span>
                )}
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                      selectedRating >= star
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                        : 'bg-[#131D27] text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span>{star}</span>
                    <Star className={`w-3.5 h-3.5 ${selectedRating >= star ? 'fill-amber-400' : ''}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Telegram Action Buttons (Tahrirlash / Boshqa format) */}
            <div className="space-y-1.5 pt-1">
              <button
                onClick={() => {
                  onClose();
                  if (onEdit) onEdit();
                }}
                className="w-full py-2.5 px-3 bg-[#182533] hover:bg-[#203042] active:scale-[0.98] border border-slate-800 rounded-xl text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                <span>✏️ Tahrirlash (Slaydlarni sozlash)</span>
              </button>

              <button
                onClick={handleShareToTelegram}
                className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>✈️ Telegram Shaxsiy Xabarga Yuborish</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
