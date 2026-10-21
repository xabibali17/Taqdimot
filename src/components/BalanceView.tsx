import React, { useState } from 'react';
import { UserProfile, Language, AppSettings } from '../types';
import { translations } from '../locales/translations';
import { 
  Wallet, CreditCard, Users, Gift, Copy, Check, 
  ExternalLink, Upload, Sparkles, CheckCircle2, ShieldCheck, FileCheck 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BalanceViewProps {
  user: UserProfile;
  lang: Language;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  settings?: AppSettings;
}

export const BalanceView: React.FC<BalanceViewProps> = ({ 
  user, 
  lang, 
  onUpdateUser,
  settings 
}) => {
  const t = translations[lang];

  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [promoStatus, setPromoStatus] = useState<{ message: string; success: boolean } | null>(null);

  // Card receipt form
  const [cardAmount, setCardAmount] = useState<string>('35000');
  const [senderName, setSenderName] = useState<string>(user.fullName || '');
  const [cardLast4, setCardLast4] = useState<string>('');
  const [receiptFile, setReceiptFile] = useState<string>('kvitansiya_chek.jpg');
  const [receiptSubmitted, setReceiptSubmitted] = useState<boolean>(false);
  const [isSubmittingReceipt, setIsSubmittingReceipt] = useState<boolean>(false);

  const cardNumber = settings?.cardNumber || '8600 5304 1892 4108';
  const cardHolder = settings?.cardHolder || 'RAXMATULLAYEV V. (Uzcard / Humo)';
  const referralLink = `https://t.me/TAQDIMIY_BOT?start=${user.referralCode}`;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(
      `@TAQDIMIY_BOT - Taqdimot, Referat va barcha akademik ishlarni professional tarzda tayyorlovchi bot! Ro'yxatdan o'ting va 5 000 so'm bonus oling:\n${referralLink}`
    );
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`, '_blank');
  };

  const handleSubmitCardReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardAmount || !cardLast4) return;

    setIsSubmittingReceipt(true);
    try {
      await fetch('/api/user/submit-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(cardAmount),
          cardLast4,
          fullName: senderName || user.fullName,
          username: user.telegramUsername.replace('@', ''),
        })
      });

      setReceiptSubmitted(true);
      setTimeout(() => {
        setReceiptSubmitted(false);
        setCardLast4('');
      }, 6000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReceipt(false);
    }
  };

  const handleRedeemPromo = async () => {
    if (!promoCodeInput.trim()) return;
    try {
      const res = await fetch('/api/user/redeem-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCodeInput })
      });
      const data = await res.json();
      if (data.success) {
        setPromoStatus({ message: data.message, success: true });
        if (data.promo.type === 'vip') {
          onUpdateUser({
            isVip: true,
            vipDaysRemaining: (user.vipDaysRemaining || 0) + data.promo.value
          });
        } else {
          onUpdateUser({
            balance: user.balance + data.promo.value
          });
        }
        try {
          confetti({ particleCount: 70, spread: 70, origin: { y: 0.5 } });
        } catch {}
        setPromoCodeInput('');
      } else {
        setPromoStatus({ message: data.error || 'Xatolik yuz berdi', success: false });
      }
    } catch (err) {
      setPromoStatus({ message: 'Tarmoq xatosi', success: false });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28 space-y-6 animate-in fade-in duration-200">
      {/* Balance & VIP Overview Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>{t.balance.currentBalance}</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight tabular-nums">
              {user.balance.toLocaleString()} <span className="text-lg font-bold text-blue-400">{t.balance.som}</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Barcha xizmatlar (Taqdimot, Referat, Kurs ishi) to'g'ridan-to'g'ri balansingizdan to'lanadi.
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{t.balance.vipStatus}</span>
              </div>
              <div className="text-base font-bold text-white mt-1">
                {user.isVip ? (
                  <span className="text-amber-400">
                    VIP Faol ({user.vipDaysRemaining} kun)
                  </span>
                ) : (
                  <span className="text-slate-400">Oddiy foydalanuvchi</span>
                )}
              </div>
            </div>
            {!user.isVip && (
              <span className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                Kunlik VIP promokod orqali beriladi
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Top Up Method (Uzcard / Humo with Receipt Upload) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Balansni Karta orqali to'ldirish
            </h3>
            <p className="text-xs text-slate-400">
              Quyidagi karta raqamiga to'lov qilib, chekni (rasm yoki PDF) yuboring.
            </p>
          </div>
        </div>

        {/* Card info card */}
        <div className="p-5 my-4 bg-gradient-to-r from-blue-950/70 via-slate-900 to-slate-900 border border-blue-500/30 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400">
              To'lov uchun karta raqami (Uzcard / Humo)
            </span>
            <span className="text-xs text-emerald-400 font-semibold">24/7 qabul qilinadi</span>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="text-xl sm:text-2xl font-mono font-black text-white tracking-widest select-all">
              {cardNumber}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(cardNumber.replace(/\s+/g, ''));
                alert('Karta raqami nusxalandi!');
              }}
              className="min-h-[36px] px-3 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shrink-0"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Nusxa olish</span>
            </button>
          </div>

          <div className="text-xs text-slate-300 font-medium">
            Karta egasi: <span className="text-white font-semibold">{cardHolder}</span>
          </div>
        </div>

        {/* Receipt Submission Form */}
        <form onSubmit={handleSubmitCardReceipt} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                O'tkazilgan summa (so'm) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={cardAmount}
                onChange={(e) => setCardAmount(e.target.value)}
                placeholder="35000"
                required
                className="w-full p-3 bg-slate-800/70 border border-slate-700 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Yuboruvchi F.I.Sh
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Ism Familiya"
                className="w-full p-3 bg-slate-800/70 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kartangizning oxirgi 4 ta raqami <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                maxLength={4}
                value={cardLast4}
                onChange={(e) => setCardLast4(e.target.value)}
                placeholder="4108"
                required
                className="w-full p-3 bg-slate-800/70 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              To'lov cheki / kvitansiya (Rasm yoki PDF)
            </label>
            <div className="border-2 border-dashed border-slate-700 hover:border-blue-500/60 rounded-xl p-4 text-center cursor-pointer bg-slate-800/40 transition-colors">
              <Upload className="w-5 h-5 text-blue-400 mx-auto mb-1.5" />
              <div className="text-xs text-slate-300 font-medium">
                Chek skrinshoti yoki PDF kvitansiyani tanlang
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Tanlangan: {receiptFile}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmittingReceipt}
            className="w-full min-h-[48px] py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
          >
            <FileCheck className="w-4 h-4" />
            <span>
              {isSubmittingReceipt ? 'Chek yuborilmoqda...' : 'Chekni tasdiqlashga yuborish'}
            </span>
          </button>

          {receiptSubmitted && (
            <div className="p-4 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold">Chekingiz qabul qilindi!</span> Bosh administrator tasdiqlashi bilan hisobingiz to'ldiriladi.
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Referral System ("Do'stni taklif qil - pul top") */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Do'stni taklif qil – pul top
            </h3>
            <p className="text-xs text-slate-400">
              Har bir taklif qilingan faol do'stingiz uchun hisobingizga 5 000 so'm mukofot beriladi!
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-2xl">
            <span className="text-[11px] text-slate-400 block mb-1">
              Taklif qilingan do'stlar
            </span>
            <span className="text-xl font-black text-white tabular-nums">
              {user.referralsCount} ta
            </span>
          </div>

          <div className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-2xl">
            <span className="text-[11px] text-slate-400 block mb-1">
              Referal daromadi
            </span>
            <span className="text-xl font-black text-emerald-400 tabular-nums">
              {user.referralEarnings.toLocaleString()} so'm
            </span>
          </div>
        </div>

        {/* Referral Link Box */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 p-3 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-200 font-mono truncate select-all">
            {referralLink}
          </div>
          <button
            onClick={handleCopyReferral}
            className="min-h-[44px] px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">Nusxalash</span>
          </button>
        </div>

        <button
          onClick={handleShareTelegram}
          className="w-full min-h-[44px] py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md shadow-blue-600/20"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Telegramda do'stlarga yuborish</span>
        </button>
      </div>

      {/* Promo Code Redemption */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 mb-2 text-indigo-400">
          <Gift className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">
            Promokod faollashtirish
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Admin yoki kanallardagi promokodlarni kiritib, bepul balans yoki kunlik VIP oling.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={promoCodeInput}
            onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
            placeholder="Masalan: START2026 yoki VIPKUNLIK"
            className="flex-1 p-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-xs font-mono tracking-wider uppercase focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleRedeemPromo}
            disabled={!promoCodeInput.trim()}
            className={`min-h-[44px] px-5 rounded-xl font-bold text-xs text-white transition-all ${
              promoCodeInput.trim()
                ? 'bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            Faollashtirish
          </button>
        </div>

        {promoStatus && (
          <div className={`mt-3 p-3 rounded-xl text-xs flex items-center gap-2 ${
            promoStatus.success
              ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/60 border border-red-500/40 text-red-300'
          }`}>
            <span>{promoStatus.message}</span>
          </div>
        )}
      </div>
    </div>
  );
};
