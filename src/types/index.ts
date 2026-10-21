export type Language = 'uz' | 'ru' | 'en';

export type ServiceCategory = 
  | 'presentation' // Taqdimot va vizual
  | 'academic'     // Akademik hujjatlar
  | 'interactive'  // Test va interaktiv
  | 'text';        // Matn va rasmiy

export type ServiceType =
  // Taqdimot va vizual
  | 'taqdimot'
  | 'oddiy_taqdimot'
  | 'fayldan_taqdimot'
  | 'infografika'
  // Akademik hujjatlar
  | 'referat'
  | 'mustaqil_ish'
  | 'tezis'
  | 'kurs_ishi'
  | 'dars_rejasi'
  | 'diplom'
  // Test va interaktiv
  | 'test'
  | 'krossvord'
  | 'tinglash'
  | 'viktorina'
  // Matn va rasmiy
  | 'insho'
  | 'maqola'
  | 'tarjima'
  | 'rezyume'
  | 'konspekt'
  | 'motivatsion_xat';

export type TierLevel = 'Standart' | 'Premium' | 'PRO';
export type FontSizeOption = 'Kam' | 'O\'rtacha' | 'Ko\'p' | 'Maksimal';
export type DesignTheme = 'Modern Dark' | 'Minimalist Light' | 'Academic Navy' | 'Emerald Tech' | 'Gold Luxury';

export interface PresentationTemplate {
  id: string;
  name: string;
  category: string;
  bgGradient: string;
  accentColor: string;
  textColor: string;
  cardColor: string;
  fontFamily: string;
  frameStyle: string;
}

export interface SlideData {
  slideNumber: number;
  title: string;
  subtitle?: string;
  contentPoints: string[];
  highlightText?: string;
  speakerNotes?: string;
  visualLayout?: 'hero' | 'split-columns' | 'grid-cards' | 'stat-callout' | 'summary-list';
  // PRO Tier Visual Features:
  imageUrl?: string;
  imageKeyword?: string;
  themeFrame?: string;
  // Mavzuga mos personaj rasmi va iqtibosi:
  characterName?: string;
  characterRole?: string;
  characterImage?: string;
  characterQuote?: string;
}

export interface PresentationData {
  id: string;
  title: string;
  subtitle?: string;
  subject?: string;
  studentName?: string;
  teacherName?: string;
  tier: TierLevel;
  slideCount?: number;
  fontSize: FontSizeOption;
  theme: DesignTheme;
  templateId?: string;
  templateName?: string;
  lang: Language;
  slides: SlideData[];
  createdAt: string;
  rating?: number;
  ratingComment?: string;
}

export interface AcademicDocData {
  id: string;
  docType: string;
  title: string;
  studentName?: string;
  subject?: string;
  teacherName?: string;
  introduction: string;
  chapters: {
    title: string;
    sections: { title: string; text: string }[];
  }[];
  conclusion: string;
  bibliography: string[];
  createdAt: string;
  rating?: number;
}

export interface InteractiveQuizData {
  id: string;
  toolType: string;
  title: string;
  questions: {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }[];
  crosswordWords?: {
    word: string;
    clue: string;
    direction: 'across' | 'down';
    start: [number, number];
  }[];
  listeningDialogue?: {
    audioScript: string;
    comprehensionQuestions: {
      question: string;
      options: string[];
      answer: number;
    }[];
  };
  createdAt: string;
}

export interface TextDocData {
  id: string;
  docType: string;
  title: string;
  content: string;
  keyHighlights?: string[];
  wordCount?: number;
  createdAt: string;
}

export interface TaskItem {
  id: string;
  type: ServiceType;
  title: string;
  category: ServiceCategory;
  date: string;
  data: PresentationData | AcademicDocData | InteractiveQuizData | TextDocData;
}

export interface UserProfile {
  id: string;
  telegramId: string;
  telegramUsername: string;
  fullName: string;
  balance: number; // in UZS (so'm)
  isVip: boolean;
  vipDaysRemaining: number;
  referralCode: string;
  referralEarnings: number;
  referralsCount: number;
  completedTasksCount: number;
}

export interface PaymentReceipt {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  amount: number;
  paymentMethod: string;
  cardLast4: string;
  receiptUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export interface PromoCode {
  code: string;
  type: 'balance' | 'vip';
  value: number; // so'm or days
  remaining: number;
  active: boolean;
}

export interface AppSettings {
  botName: string;
  botUsername: string;
  logoUrl: string;
  coverUrl: string;
  avatarUrl?: string;
  supportUsername: string;
  supportId?: string;
  supportText: string;
  developerInfo: string;
  cardNumber: string;
  cardHolder: string;
  channel1: string;
  channel2: string;
  referralBonusAmount: number;
  initialBalanceAmount?: number;
  tierPrices: {
    standart: number;
    premium: number;
    pro: number;
  };
  servicePrices?: {
    referat: number;
    mustaqil_ish: number;
    kurs_ishi: number;
    tezis: number;
    test: number;
    insho: number;
    maqola: number;
  };
  welcomeMessage: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}
