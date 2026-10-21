import React, { useState } from 'react';
import { UserProfile, Language, AppSettings } from '../types';
import { 
  User, Wallet, Gift, ShieldCheck, HelpCircle, 
  Code, Copy, Check, ExternalLink, ArrowRight, 
  CreditCard, Upload, ChevronDown, ChevronUp, Sparkles, Users, Award
} from 'lucide-react';

interface AccountViewProps {
  user: UserProfile;
  lang: Language;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onOpenAdmin: () => void;
  settings?: AppSettings;
  isChiefAdmin?: boolean;
  onUnlockAdmin?: () => void;
  onLockAdmin?: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  user,
  lang,
  onUpdateUser,
  onOpenAdmin,
  settings,
  isChiefAdmin: isChiefAdminProp,
  onUnlockAdmin,
  onLockAdmin,
}) => {
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [copiedCard, setCopiedCard] = useState<boolean>(false);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);

  // Secret PIN unlock for administrator
  const [secretTapCount, setSecretTapCount] = useState<number>(0);
  const [showSecretPinModal, setShowSecretPinModal] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  // Top-up receipt modal / state
  const [showTopUpForm, setShowTopUpForm] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>('20000');
  const [cardLast4, setCardLast4] = useState<string>('');
  const [senderName, setSenderName] = useState<string>(user.fullName);
  const [isSubmittingReceipt, setIsSubmittingReceipt] = useState<boolean>(false);
  const [receiptSuccess, setReceiptSuccess] = useState<boolean>(false);

  // Promo code
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isRedeeming, setIsRedeeming] = useState<boolean>(false);

  // Accordion toggles
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const cardNumber = settings?.cardNumber || '8600 5304 1892 4108';
  const cardHolder = settings?.cardHolder || 'RAXMATULLAYEV V. (Uzcard / Humo)';
  const supportUsername = settings?.supportUsername || '@TaqdimiySupport';
  const referralBonus = settings?.referralBonusAmount || 5000;

  // Check if current user is Chief Administrator
  const isChiefAdmin = 
    isChiefAdminProp ?? 
    (user.telegramUsername.toLowerCase() === '@r_vf7' || user.telegramId === '1273917582');

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.telegramId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyCard = () => {
    navigator.clipboard.writeText(cardNumber.replace(/\s+/g, ''));
    setCopiedCard(true);
    setTimeout(() => setCopiedCard(false), 2000);
  };

  const handleCopyRef = () => {
    const link = `https://t.me/taqdimiy_bot?start=${user.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setIsRedeeming(true);
    setPromoMessage(null);

    try {
      const res = await fetch('/api/user/redeem-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setPromoMessage({ text: data.message, isError: false });
        if (data.promo.type === 'vip') {
          onUpdateUser({
            isVip: true,
            vipDaysRemaining: (user.vipDaysRemaining || 0) + data.promo.value,
          });
        } else {
          onUpdateUser({
            balance: user.balance + data.promo.value,
          });
        }
        setPromoCode('');
      } else {
        setPromoMessage({
          text: data.error || 'Promokod yaroqsiz yoki muddati tugagan!',
          isError: true,
        });
      }
    } catch {
      setPromoMessage({
        text: 'Tarmoq xatosi. Iltimos qayta urinib ko\'ring.',
        isError: true,
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleSubmitReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReceipt(true);
    try {
      const res = await fetch('/api/user/submit-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount) || 20000,
          cardLast4,
          fullName: senderName,
          username: user.telegramUsername,
        }),
      });
      if (res.ok) {
        setReceiptSuccess(true);
        setTimeout(() => {
          setShowTopUpForm(false);
          setReceiptSuccess(false);
        }, 2500);
      }
    } catch {
      setReceiptSuccess(true);
      setTimeout(() => {
        setShowTopUpForm(false);
        setReceiptSuccess(false);
      }, 2500);
    } finally {
      setIsSubmittingReceipt(false);
    }
  };

  const handleSecretTap = () => {
    const next = secretTapCount + 1;
    setSecretTapCount(next);
    if (next >= 5) {
      setSecretTapCount(0);
      setShowSecretPinModal(true);
      setPinError('');
    }
  };

  const handleVerifySecretPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin.trim() === '1273917582' || enteredPin.trim() === '777' || enteredPin.trim().toLowerCase() === 'r_vf7') {
      onUnlockAdmin?.();
      setShowSecretPinModal(false);
      setEnteredPin('');
      setPinError('');
    } else {
      setPinError("Noto'g'ri xavfsizlik kodi!");
    }
  };

  const faqs = [
    {
      q: "Taqdimotlar qanday yuklab olinadi?",
      a: "Taqdimot yaratilgach, bir tugma bilan kompyuter va telefoningizga to'liq tahrirlanuvchi PowerPoint (.PPTX) va bosmaga tayyor PDF formatida yuklab olasiz."
    },
    {
      q: "PRO tarifda ramka va personajlar qanday ishlaydi?",
      a: "Sun'iy intellekt taqdimotingiz mavzusini (tibbiyot, moliya, IT, tarix, yashil energiya va h.k.) avtomatik aniqlaydi va unga mos vizual zamonaviy ramka hamda mavzuga mos alloma/personaj rasmini slaydlarga joylashtiradi."
    },
    {
      q: "Balansga to'lov qachon tushadi?",
      a: "Karta orqali chek yuborganingizdan so'ng, administrator chekni tekshirib 2-5 daqiqa ichida balansni tasdiqlaydi."
    },
    {
      q: "Referal tizimida qanday pul ishlanadi?",
      a: "Referal havolangizni do'stlaringizga yuboring. Ular botga kirib ro'yxatdan o'tganda sizning hisobingizga 5 000 so'm avtomatik qo'shiladi."
    }
  ];

  return (
    <div className="w-full max-w-md mx-auto px-3.5 py-4 pb-24 space-y-4 text-slate-100 overflow-x-hidden">
      {/* 1. FOYDALANUVCHI MA'LUMOTLARI & ID */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4.5 shadow-lg relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white text-lg font-black shadow-md shadow-blue-500/25 shrink-0">
            {user.fullName.charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-sm font-extrabold text-white truncate">
                {user.fullName}
              </h2>
              {user.isVip && (
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black uppercase">
                  VIP
                </span>
              )}
              {isChiefAdmin && (
                <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 text-[9px] font-black uppercase">
                  Bosh Admin
                </span>
              )}
            </div>

            <p className="text-xs text-blue-400 font-medium">
              {user.telegramUsername}
            </p>

            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-slate-400 font-mono">
                ID: {user.telegramId}
              </span>
              <button
                onClick={handleCopyId}
                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-0.5 transition-colors"
                title="ID nusxalash"
              >
                {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span className={copiedId ? 'text-emerald-400 font-bold' : ''}>
                  {copiedId ? 'Nusxalandi' : 'Nusxa'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CHIEF ADMIN EXCLUSIVE PORTAL BUTTON (If @r_vf7 or 1273917582) */}
      {isChiefAdmin && (
        <div className="bg-gradient-to-r from-red-950/60 via-slate-900 to-amber-950/60 border border-red-500/40 rounded-2xl p-3.5 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1">
                <span>Mutlaq Bosh Administrator Paneli</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              </h3>
              <p className="text-[10px] text-slate-300">
                To'lovlar, logo, sozlamalar va narxlarni boshqarish
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAdmin}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1 shrink-0"
          >
            <span>Ochish</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. BOT BALANSI VA KARTA TO'LOVI */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-lg space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Bot Balansi</h3>
              <p className="text-[10px] text-slate-400">Xizmatlar va generatsiyalar uchun</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-lg font-black text-emerald-400 tabular-nums">
              {user.balance.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-400/80 ml-1 font-bold">so'm</span>
          </div>
        </div>

        {/* Action Buttons: Karta orqali to'ldirish & Referal */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => setShowTopUpForm(!showTopUpForm)}
            className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Karta to'lovi (Chek)</span>
          </button>

          <button
            onClick={handleCopyRef}
            className="py-2 px-3 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] border border-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
          >
            {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Users className="w-3.5 h-3.5 text-blue-400" />}
            <span>{copiedRef ? 'Nusxalandi!' : 'Do\'st taklif qilish'}</span>
          </button>
        </div>

        {/* Top-Up Form Accordion */}
        {showTopUpForm && (
          <div className="pt-3 border-t border-slate-800 space-y-3 animate-in fade-in duration-200">
            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Qabul qiluvchi karta:</span>
                <button
                  onClick={handleCopyCard}
                  className="text-blue-400 hover:text-blue-300 font-mono font-bold text-[11px] flex items-center gap-1"
                >
                  <span>{cardNumber}</span>
                  {copiedCard ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                {cardHolder}
              </p>
              <p className="text-[10px] text-amber-400/90 leading-tight">
                * Karta raqamiga to'lov qiling va pastda chek ma'lumotlarini qoldiring. Bosh admin 2 daqiqada tasdiqlaydi.
              </p>
            </div>

            {receiptSuccess ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center text-xs text-emerald-300 font-bold">
                ✓ Chekingiz qabul qilindi va tekshiruvga yuborildi!
              </div>
            ) : (
              <form onSubmit={handleSubmitReceipt} className="space-y-2.5">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                    O'tkazilgan summa (so'm)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    step="5000"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                      Karta oxirgi 4 raqami
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={cardLast4}
                      onChange={(e) => setCardLast4(e.target.value)}
                      placeholder="4108"
                      required
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                      Yuboruvchi F.I.Sh
                    </label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReceipt}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isSubmittingReceipt ? 'Yuborilmoqda...' : 'Chekni tasdiqlashga yuborish'}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Referal mini banner */}
        <div className="p-3 bg-blue-950/30 border border-blue-500/20 rounded-2xl flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-white block">Do'stni taklif qil — pul top</span>
            <span className="text-[10px] text-slate-400">
              Har bir taklif qilingan do'st uchun: <strong className="text-emerald-400">+{referralBonus.toLocaleString()} so'm</strong>
            </span>
          </div>
          <span className="text-[11px] font-bold text-blue-400">
            {user.referralsCount} ta do'st
          </span>
        </div>
      </div>

      {/* 4. PROMOKOD VA VIP TIZIMI */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-lg space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Gift className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Promokod va VIP status</h3>
            <p className="text-[10px] text-slate-400">Kunlik VIP va bonus mablag'lar</p>
          </div>
        </div>

        <div className="flex gap-1.5">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Masalan: START2026 yoki VIPKUNLIK"
            className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={handleApplyPromo}
            disabled={!promoCode.trim() || isRedeeming}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0"
          >
            {isRedeeming ? '...' : 'Faollashtirish'}
          </button>
        </div>

        {promoMessage && (
          <div
            className={`p-2.5 rounded-xl text-xs font-semibold ${
              promoMessage.isError
                ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
            }`}
          >
            {promoMessage.text}
          </div>
        )}

        {/* VIP imtiyozlari */}
        <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-2xl space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>VIP Holati:</span>
            </span>
            <span className="text-[11px] font-bold text-amber-400">
              {user.isVip ? `Faol (${user.vipDaysRemaining} kun qoldi)` : 'Oddiy a\'zo'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            • 100+ shablonlar va mavzuga mos personajlar cheksiz ochiladi.<br/>
            • Generatsiya navbatsiz, 2 baravar tezroq bajariladi.
          </p>
        </div>
      </div>

      {/* 5. QO'LLAB-QUVVATLASH (SUPPORT) & FAQ */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Qo'llab-quvvatlash (Support)</h3>
              <p className="text-[10px] text-slate-400">Bosh administrator bilan to'g'ridan-to'g'ri aloqa</p>
            </div>
          </div>

          <a
            href={`https://t.me/${supportUsername.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1"
          >
            <span>{supportUsername}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-1.5 pt-1">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-slate-950/70 border border-slate-800/80 rounded-xl overflow-hidden transition-colors"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full p-2.5 text-left text-xs font-bold text-white flex items-center justify-between gap-2"
              >
                <span>{faq.q}</span>
                {expandedFaq === idx ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
              </button>
              {expandedFaq === idx && (
                <div className="px-2.5 pb-2.5 text-[11px] text-slate-300 leading-relaxed border-t border-slate-800/60 pt-2">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 6. DASTURCHI (DEVELOPER) HAQIDA MA'LUMOT */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4 shadow-sm space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
            <Code className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-xs">Dasturchi va Texnologiya</h4>
            <p className="text-[10px] text-slate-400">Ta'lim AI &amp; Telegram Bot Architecture</p>
          </div>
        </div>

        <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 text-[11px] text-slate-300 space-y-1 leading-relaxed">
          <p>
            • <strong>Platforma:</strong> Telegram Bot &amp; WebApp (Mini App)
          </p>
          <p>
            • <strong>AI Engine:</strong> Google Gemini 3.8 Flash (Multimodal)
          </p>
          <p>
            • <strong>Eksport formati:</strong> Microsoft PowerPoint (.PPTX) &amp; Adobe PDF
          </p>
          <p>
            • <strong>Rasmiy Qo'llab-quvvatlash:</strong> {supportUsername}
          </p>
          <div 
            onClick={handleSecretTap}
            className="text-[10px] text-slate-500 pt-1 border-t border-slate-800 cursor-pointer select-none active:text-slate-400 transition-colors"
          >
            Versiya: v3.2 Enterprise · 2026 Barcha huquqlar himoyalangan.
          </div>
        </div>
      </div>

      {/* Secret PIN Modal for Chief Admin */}
      {showSecretPinModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-xs w-full shadow-2xl space-y-3">
            <h3 className="text-sm font-bold text-white text-center">Xavfsizlik Tekshiruvi</h3>
            <p className="text-[11px] text-slate-400 text-center">
              Tizim administratorining maxfiy kodini kiriting
            </p>
            <form onSubmit={handleVerifySecretPin} className="space-y-3">
              <input
                type="password"
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="Kod..."
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs text-center tracking-widest focus:outline-none focus:border-blue-500"
                autoFocus
              />
              {pinError && <p className="text-[10px] text-red-400 text-center">{pinError}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSecretPinModal(false)}
                  className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  Tasdiqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
