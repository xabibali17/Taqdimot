import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'server-data');
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.warn('Could not create data dir:', err);
  }
}
const SETTINGS_FILE = path.join(DATA_DIR, 'bot_settings.json');
const PROMOS_FILE = path.join(DATA_DIR, 'bot_promos.json');

const app = express();
const httpServer = http.createServer(app);
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '25mb' }));

// Initialize Google Gemini API SDK if key is present
const aiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (aiApiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: aiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Initial default settings
const DEFAULT_SETTINGS = {
  botName: '@TAQDIMIY_BOT',
  botUsername: '@TAQDIMIY_BOT',
  logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
  coverUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80',
  avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
  supportUsername: '@TaqdimiySupport',
  supportText: 'Savollar, to\'lovlar yoki hamkorlik bo\'yicha rasmiy qo\'llab-quvvatlash xizmati bilan bog\'laning.',
  developerInfo: 'Ta\'lim AI & Telegram Bot Dev Team (v3.2 Enterprise)',
  cardNumber: '8600 5304 1892 4108',
  cardHolder: 'RAXMATULLAYEV V. (Uzcard / Humo)',
  channel1: '@taqdimotlar_kanali',
  channel2: '@talim_yangiliklari',
  referralBonusAmount: 5000,
  initialBalanceAmount: 10000,
  tierPrices: {
    standart: 10000,
    premium: 20000,
    pro: 35000,
  },
  servicePrices: {
    referat: 15000,
    mustaqil_ish: 15000,
    kurs_ishi: 30000,
    tezis: 12000,
    test: 8000,
    insho: 10000,
    maqola: 25000,
  },
  welcomeMessage: 'Assalomu alaykum! @TAQDIMIY_BOT xizmatiga xush kelibsiz. Eng tezkor va sifatli taqdimot hamda akademik ishlar bu yerda!',
};

function loadDiskSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (err) {
    console.warn('Failed to load settings from disk:', err);
  }
  return DEFAULT_SETTINGS;
}

// In-memory demo store for dynamic admin settings & state
const state = {
  settings: loadDiskSettings(),
  receipts: [
    {
      id: 'REC-901',
      userId: 'usr_8921',
      username: 'talaba_2026',
      fullName: 'Jasur Beknazarov',
      amount: 35000,
      paymentMethod: 'Karta (Uzcard / Humo)',
      cardLast4: '4108',
      receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
      status: 'pending',
      date: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'REC-902',
      userId: 'user_103',
      username: 'aziza_k',
      fullName: 'Aziza Karimova',
      amount: 20000,
      paymentMethod: 'Karta (Humo)',
      cardLast4: '8831',
      receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
      status: 'pending',
      date: new Date(Date.now() - 3600000 * 5).toISOString(),
    }
  ],
  promoCodes: [
    { code: 'START2026', type: 'balance', value: 15000, remaining: 100, active: true },
    { code: 'VIPKUNLIK', type: 'vip', value: 1, remaining: 50, active: true },
    { code: 'TAQDIMIY', type: 'balance', value: 20000, remaining: 80, active: true },
    { code: 'PROVIP', type: 'vip', value: 7, remaining: 30, active: true },
  ],
  announcements: [
    {
      id: 'ann-1',
      title: '@TAQDIMIY_BOT yangilanishi: PRO tarifda avtomatik ramkalar va rasmlar!',
      content: 'Endi PRO tarifida har bir slayd uchun mavzuga mos maxsus zamonaviy ramkalar va yuqori sifatli rasmlar avtomatik joylashtiriladi.',
      date: '2026-10-19',
      views: 2840
    }
  ],
  stats: {
    totalUsers: 14890,
    activeToday: 1840,
    totalGenerations: 42350,
    totalRevenueUz: 84600000,
  }
};

// --- DYNAMIC SETTINGS APIS ---
app.get('/api/settings', (req, res) => {
  res.json(state.settings);
});

app.post('/api/admin/settings', (req, res) => {
  state.settings = {
    ...state.settings,
    ...req.body
  };
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(state.settings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing settings to disk:', err);
  }
  res.json({ success: true, settings: state.settings });
});

// Image upload from gallery / camera
app.post('/api/admin/upload-image', (req, res) => {
  const { imageData } = req.body;
  if (!imageData) {
    return res.status(400).json({ error: 'Rasm ma\'lumoti topilmadi' });
  }
  res.json({ success: true, url: imageData });
});

// --- GEMINI APIS ---

// 1. Refine topic endpoint
app.post('/api/gemini/refine-topic', async (req, res) => {
  const { topic, lang = 'uz' } = req.body;
  if (!topic) {
    return res.status(400).json({ error: 'Mavzu kiritilishi shart' });
  }

  const prompt = `Foydalanuvchi taqdimot yoki akademik ish yaratmoqchi.
Mavzu: "${topic}"
Til: ${lang === 'ru' ? 'Rus tili' : lang === 'en' ? 'Ingliz tili' : 'O\'zbek tili'}.

Mavzuni yanada aniq va professional shaklda qayta taklif qiling.
Quyidagi JSON formatda javob bering (faqat JSON):
{
  "refinedTitle": "Aniq va professional nom",
  "suggestions": [
    "1-variant: Chuqurlashtirilgan yondashuv",
    "2-variant: Zamonaviy amaliy tahlil"
  ],
  "suggestedOutline": [
    "Kirish va dolzarblik",
    "Nazariy asoslar",
    "Amaliy tahlil va ko'rsatkichlar",
    "Xulosa va takliflar"
  ]
}`;

  try {
    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.6,
        },
      });

      const text = response.text || '{}';
      try {
        const parsed = JSON.parse(text);
        return res.json(parsed);
      } catch {}
    }
  } catch (error) {
    console.warn('Gemini topic refine error, fallback:', error);
  }

  return res.json({
    refinedTitle: `${topic}: Zamonaviy holat, tahlil va rivojlanish istiqbollari`,
    suggestions: [
      `${topic}: Nazariy asoslar va amaliy tadbiq`,
      `${topic} sohasidagi yangi innovatsiyalar va tahlil`
    ],
    suggestedOutline: [
      'Kirish va mavzuning dolzarbligi',
      'Asosiy tushunchalar va ilmiy asoslar',
      'Hozirgi kundagi amaliy jarayonlar va tahlillar',
      'Xulosa, takliflar va foydalanilgan adabiyotlar'
    ]
  });
});

// Curated high quality educational image map for themes
const curatedImagePool = [
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
];

// 2. Generate Presentation
app.post('/api/gemini/generate-presentation', async (req, res) => {
  const {
    topic,
    studentName,
    subject,
    teacherName,
    outline,
    tier = 'PRO',
    slideCount = 8,
    fontSize = 'O\'rtacha',
    theme = 'Modern Dark',
    lang = 'uz'
  } = req.body;

  const count = Number(slideCount) || (tier === 'PRO' ? 10 : tier === 'Premium' ? 8 : 6);
  const langPrompt = lang === 'ru' ? 'Rus tili' : lang === 'en' ? 'Ingliz tili' : 'O\'zbek tili';

  const prompt = `Professional taqdimot yaratish:
Mavzu: "${topic}"
Til: ${langPrompt}
Muallif: "${studentName || 'Talaba'}"
Fan: "${subject || 'Umumiy'}"
O'qituvchi: "${teacherName || ''}"
Tarif: ${tier}
Slaydlar soni: ${count} ta
Shrift: ${fontSize}
Mavzu dizayni: ${theme}

MUHIM TALAB: Mavzuga mos bir mashhur alloma yoki zamonaviy mutaxassis personajini aniqlang (masalan tibbiyotda Ibn Sino/Shifokor, IT da Al-Xorazmiy/Kiber-mutaxassis, astronomiyada Mirzo Ulug'bek, biznesda Moliya tahlilchisi, tarixda Amir Temur va h.k.). Har bir slaydga personajning roli, ismi va qisqa iqtibosini (characterQuote) biriktiring.

Talablar:
- 1-slayd sarlavha va muallif ma'lumotlari.
- Qolgan slaydlarda: aniq, ixcham 3-4 ta asosiy punktlar (contentPoints), 1 ta kuchli ta'kid (highlightText), spiker nutqi (speakerNotes) va mavzuga mos 1 ta inglizcha kalit so'z (imageKeyword: masalan "technology", "solar energy", "analytics", "education", "business", "innovation").

Quyidagi JSON formatda qat'iy javob bering (faqat JSON):
{
  "title": "Mavzu sarlavhasi",
  "subtitle": "Qisqa tavsif",
  "characterName": "Personaj ismi (masalan Al-Xorazmiy yoki Bosh mutaxassis)",
  "characterRole": "Personajning sohasi va lavozimi",
  "characterQuote": "Mavzuga oid dono fikr yoki yo'naltiruvchi iqtibos",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Slayd sarlavhasi",
      "subtitle": "Kichik izoh",
      "contentPoints": ["1-punkt", "2-punkt", "3-punkt"],
      "highlightText": "Asosiy ta'kid",
      "speakerNotes": "Spiker nutqi",
      "visualLayout": "hero",
      "imageKeyword": "technology",
      "characterQuote": "Slayd bo'yicha personaj tavsiyasi"
    }
  ]
}`;

  try {
    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.6,
        },
      });

      const text = response.text || '';
      try {
        const parsed = JSON.parse(text);
        if (parsed.slides && Array.isArray(parsed.slides)) {
          // Identify topic persona category
          const lowerTopic = String(topic).toLowerCase();
          let charImg = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
          let defaultCharName = 'Al-Xorazmiy / AI Ekspert';
          let defaultCharRole = 'Bosh ilmiy maslahatchi';

          if (lowerTopic.includes('tibb') || lowerTopic.includes('shifo') || lowerTopic.includes('kasal') || lowerTopic.includes('dori') || lowerTopic.includes('yurak')) {
            charImg = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80';
            defaultCharName = 'Abu Ali ibn Sino / Shifokor';
            defaultCharRole = 'Tibbiy ilmiy ekspert';
          } else if (lowerTopic.includes('quyosh') || lowerTopic.includes('energiya') || lowerTopic.includes('yashil') || lowerTopic.includes('eko') || lowerTopic.includes('tabiat') || lowerTopic.includes('suv')) {
            charImg = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80';
            defaultCharName = 'Yetakchi Ekolog-Muhandis';
            defaultCharRole = 'Yashil energetika eksperti';
          } else if (lowerTopic.includes('iqtisod') || lowerTopic.includes('biznes') || lowerTopic.includes('bank') || lowerTopic.includes('moliya') || lowerTopic.includes('savdo')) {
            charImg = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80';
            defaultCharName = 'Bosh Moliya Strategi';
            defaultCharRole = 'Investitsiya va biznes tahlilchisi';
          } else if (lowerTopic.includes('tarix') || lowerTopic.includes('temur') || lowerTopic.includes('bobur') || lowerTopic.includes('madaniyat') || lowerTopic.includes('ipak yo\'li')) {
            charImg = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80';
            defaultCharName = 'Sohibqiron Amir Temur / Tarixchi';
            defaultCharRole = 'Tarixiy tadqiqotlar akademigi';
          } else if (lowerTopic.includes('maktab') || lowerTopic.includes('ta\'lim') || lowerTopic.includes('pedagog') || lowerTopic.includes('dars') || lowerTopic.includes('metod')) {
            charImg = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80';
            defaultCharName = 'Oliy Toifali Metodist-Ustoz';
            defaultCharRole = 'Pedagogika fanlari doktori';
          } else if (lowerTopic.includes('huquq') || lowerTopic.includes('qonun') || lowerTopic.includes('sud') || lowerTopic.includes('konstitutsiya') || lowerTopic.includes('advokat')) {
            charImg = 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80';
            defaultCharName = 'Bosh Yurist & Sud Arbitri';
            defaultCharRole = 'Konstitutsiyaviy huquq eksperti';
          }

          const resolvedName = parsed.characterName || defaultCharName;
          const resolvedRole = parsed.characterRole || defaultCharRole;

          // Enhance with PRO frames, curated images and thematic character
          parsed.slides = parsed.slides.map((s: any, idx: number) => ({
            ...s,
            themeFrame: tier === 'PRO' ? (idx % 2 === 0 ? 'accent-corner-glow' : 'modern-hairline-card') : undefined,
            imageUrl: tier === 'PRO' ? curatedImagePool[idx % curatedImagePool.length] : undefined,
            characterName: resolvedName,
            characterRole: resolvedRole,
            characterImage: charImg,
            characterQuote: s.characterQuote || parsed.characterQuote || 'Ilmiy tahlil va aniq metodologiya muvaffaqiyat garovidir.',
          }));
          return res.json(parsed);
        }
      } catch {}
    }
  } catch (err) {
    console.warn('Gemini presentation generation error, using fallback:', err);
  }

  // Fast quality fallback
  const fallbackSlides = [
    {
      slideNumber: 1,
      title: topic,
      subtitle: subject ? `${subject} fani bo'yicha taqdimot` : 'Mustaqil taqdimot ishi',
      contentPoints: [
        `Mavzu: ${topic}`,
        studentName ? `Bajaruvchi: ${studentName}` : 'Bajaruvchi: Talaba',
        subject ? `Fan: ${subject}` : 'Fan: Ixtisoslik',
        teacherName ? `Qabul qildi: ${teacherName}` : 'Qabul qildi: O\'qituvchi'
      ],
      highlightText: 'Dolzarb ilmiy-amaliy tahlillar',
      speakerNotes: `Assalomu alaykum hurmatli domla va talabalar! Bugungi ${topic} mavzusidagi taqdimotimizni boshlaymiz.`,
      visualLayout: 'hero',
      themeFrame: 'accent-corner-glow',
      imageUrl: curatedImagePool[0]
    },
    {
      slideNumber: 2,
      title: 'Mavzuning dolzarbligi va maqsadlari',
      subtitle: 'Nima uchun bu yo\'nalish muhim?',
      contentPoints: [
        `${topic} sohasi jadal rivojlanib, yangi bosqichga ko'tarilmoqda`,
        'Zamonaviy texnologiyalar va yangi metodologiyalar tatbiqi yuqori samara bermoqda',
        'Jarayonlarni tizimlashtirish va avtomatlashtirish ehtiyoji mavjud',
        'Iqtisodiy va ijtimoiy sohalarga bevosita ijobiy ta\'siri kundan-kunga oshmoqda'
      ],
      highlightText: 'Sohaviy samaradorlik: +35% o\'sish',
      speakerNotes: 'Mavzuning dolzarbligi shundaki, zamonaviy axborot jamiyatida bu yo\'nalish yetakchi omillardan biridir.',
      visualLayout: 'split-columns',
      themeFrame: 'modern-hairline-card',
      imageUrl: curatedImagePool[1]
    },
    {
      slideNumber: 3,
      title: 'Asosiy tushunchalar va uslubiyat',
      subtitle: 'Ilmiy-tadqiqot metodlari',
      contentPoints: [
        'Fundamental qoidalar va tushunchalar tizimi',
        'Tahlil usullari: qiyosiy, statistik va empirik metodlar',
        'Ma\'lumotlarni to\'plash va sifat nazoratini ta\'minlash',
        'Xalqaro standartlar va mahalliy qonunchilik talablari'
      ],
      highlightText: 'Metodologik aniqlik — ishonchli natijalar garovi',
      speakerNotes: 'Tadqiqot jarayonida ilg\'or metodlar qo\'llanilib, qiyosiy tahlillar orqali xulosalar shakllantirildi.',
      visualLayout: 'grid-cards',
      themeFrame: 'accent-corner-glow',
      imageUrl: curatedImagePool[2]
    },
    {
      slideNumber: 4,
      title: 'Tahliliy ko\'rsatkichlar va statistika',
      subtitle: 'Raqamlar va empirik natijalar',
      contentPoints: [
        'Samaradorlik ko\'rsatkichi an\'anaviy usullarga nisbatan 40% ga yuqori',
        'Vaqt sarfi va ortiqcha xarajatlar sezilarli darajada optimallashtiriladi',
        'Foydalanuvchilar qoniqish darajasi 88% dan yuqori qayd etilgan',
        'Avtomatlashtirilgan mexanizmlar xatoliklar sonini 4 barobarga kamaytiradi'
      ],
      highlightText: '+40% Samaradorlik | 4x Kamroq xatolik',
      speakerNotes: 'Grafik va tahlillar shuni ko\'rsatadiki, yangicha yondashuv sezilarli o\'sish beradi.',
      visualLayout: 'stat-callout',
      themeFrame: 'modern-hairline-card',
      imageUrl: curatedImagePool[3]
    },
    {
      slideNumber: 5,
      title: 'Mavjud muammolar va yechimlar',
      subtitle: 'Rivojlanish istiqbollari',
      contentPoints: [
        'Malakali kadrlarni tayyorlash va qayta o\'qitish tizimini kuchaytirish',
        'Moddiy-texnik va dasturiy ta\'minot bazasini yangilash zarurati',
        'Sohaviy integratsiya va xalqaro tajriba almashinuvini yo\'lga qo\'yish',
        'Amaliyotga innovatsion raqamli vositalarni kengroq joriy qilish'
      ],
      highlightText: 'Kompleks strategik yondashuv zarur',
      speakerNotes: 'Aniqlangan muammolar bo\'yicha amaliy takliflar ishlab chiqildi.',
      visualLayout: 'grid-cards',
      themeFrame: 'accent-corner-glow',
      imageUrl: curatedImagePool[4]
    },
    {
      slideNumber: 6,
      title: 'Xulosa va tavsiyalar',
      subtitle: 'Asosiy natijalar va manbalar',
      contentPoints: [
        `${topic} mavzusi har tomonlama o'rganilib, ijobiy xulosalar qilindi`,
        'Tavsiyalar amaliyotga tatbiq etilsa, soha samaradorligi yanada oshadi',
        'O\'zbekiston Respublikasi Qonun hujjatlari ma\'lumotlari milliy bazasi',
        'Zamonaviy ilmiy jurnallar va xalqaro platformalar materiallari',
        'E\'tiboringiz uchun katta rahmat!'
      ],
      highlightText: 'Savol va muhokamalar uchun ochiqmiz',
      speakerNotes: 'Taqdimotimiz o\'z nihoyasiga yetdi. E\'tiboringiz uchun rahmat!',
      visualLayout: 'hero',
      themeFrame: 'modern-hairline-card',
      imageUrl: curatedImagePool[5]
    }
  ];

  return res.json({
    title: topic,
    subtitle: subject ? `${subject} fani bo'yicha taqdimot` : 'Ta\'limiy taqdimot',
    slides: fallbackSlides.slice(0, count)
  });
});

// 3. Generate Academic Documents
app.post('/api/gemini/generate-academic', async (req, res) => {
  const { docType, topic, studentName, subject, teacherName, pages = 10, lang = 'uz' } = req.body;

  const prompt = `Akademik hujjat tayyorlang: ${docType}.
Mavzu: "${topic}"
Talaba: "${studentName || 'Talaba'}"
Fan: "${subject || 'Ixtisoslik'}"
Ilmiy rahbar: "${teacherName || 'O\'qituvchi'}"
Hajm: ~${pages} sahifa talablariga mos
Til: ${lang === 'ru' ? 'Rus tili' : lang === 'en' ? 'Ingliz tili' : 'O\'zbek tili'}

Quyidagi JSON formatda qaytaring:
{
  "title": "${topic}",
  "docType": "${docType}",
  "studentName": "${studentName || ''}",
  "subject": "${subject || ''}",
  "teacherName": "${teacherName || ''}",
  "introduction": "Batafsil kirish...",
  "chapters": [
    {
      "title": "I BOB. Nazariy asoslar",
      "sections": [
        { "title": "1.1. Mavzuning mohiyati", "text": "Matn..." },
        { "title": "1.2. Zamonaviy tahlillar", "text": "Matn..." }
      ]
    },
    {
      "title": "II BOB. Amaliy tahlil",
      "sections": [
        { "title": "2.1. Hozirgi holat ko'rsatkichlari", "text": "Matn..." },
        { "title": "2.2. Yechim yo'llari", "text": "Matn..." }
      ]
    }
  ],
  "conclusion": "Xulosa...",
  "bibliography": [
    "1. O'zbekiston Respublikasi Qonun hujjatlari to'plami.",
    "2. Ilmiy monografiyalar va darsliklar."
  ]
}`;

  try {
    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.5,
        },
      });

      const text = response.text || '';
      try {
        const parsed = JSON.parse(text);
        return res.json(parsed);
      } catch {}
    }
  } catch (err) {
    console.warn('Gemini academic generator error:', err);
  }

  return res.json({
    title: topic,
    docType: docType || 'Referat',
    studentName: studentName || 'Talaba',
    subject: subject || 'Fan',
    teacherName: teacherName || 'O\'qituvchi',
    introduction: `Bugungi kunda jahon miqyosida va mamlakatimizda ${topic} masalasi eng dolzarb ilmiy-amaliy yo'nalishlardan biri hisoblanadi. Mazkur ishning asosiy maqsadi ${topic} sohasidagi asosiy nazariy qoidalar va amaliy mexanizmlarni tizimli tahlil qilish hamda ilmiy takliflar ishlab chiqishdan iboratdir.`,
    chapters: [
      {
        title: `I BOB. ${topic}ning nazariy asoslari`,
        sections: [
          {
            title: `1.1. Mavzuning mohiyati va asosiy tushunchalari`,
            text: `${topic} ijtimoiy-iqtisodiy va ilmiy sohada muhim ahamiyatga ega bo'lib, uning zamonaviy modellari tizimli yondashuvni talab etadi.`
          },
          {
            title: `1.2. Ilg'or xorijiy va milliy tajriba qiyosiy tahlili`,
            text: `Rivojlangan davlatlar tajribasida mazkur yo'nalish bo'yicha joriy etilgan innovatsion usullar yuqori samaradorlik ko'rsatmoqda.`
          }
        ]
      },
      {
        title: `II BOB. Amaliy tahlil va rivojlantirish istiqbollari`,
        sections: [
          {
            title: `2.1. Sohadagi hozirgi amaliy holat va mavjud muammolar`,
            text: `Empirik ma'lumotlar tahlili shuni ko'rsatadiki, tizimda resurslardan unumli foydalanish va jarayonlarni raqamlashtirish dolzarb bo'lib qolmoqda.`
          },
          {
            title: `2.2. Samaradorlikni oshirish bo'yicha ilmiy-amaliy takliflar`,
            text: `Tadqiqot natijalari asosida jarayonlarni avtomatlashtirish va sifat nazorati mexanizmini kuchaytirish tavsiya etiladi.`
          }
        ]
      }
    ],
    conclusion: `Tadqiqot davomida ${topic} mavzusi atroflicha o'rganildi. Ishlab chiqilgan ilmiy xulosalar va amaliy tavsiyalar sohani yanada rivojlantirishga xizmat qiladi.`,
    bibliography: [
      '1. O\'zbekiston Respublikasi Qonun hujjatlari to\'plami.',
      '2. Ilmiy monografiyalar va darsliklar.',
      '3. Zamonaviy ilmiy jurnallar va elektron manbalar.'
    ]
  });
});

// 4. Generate Interactive (Test, Krossvord, etc.)
app.post('/api/gemini/generate-interactive', async (req, res) => {
  const { toolType, topic, questionCount = 5, difficulty = 'O\'rtacha', lang = 'uz' } = req.body;

  const prompt = `Interaktiv ta'lim vositasi yarating: ${toolType}.
Mavzu: "${topic}"
Savollar soni: ${questionCount}
Til: ${lang === 'ru' ? 'Rus tili' : lang === 'en' ? 'Ingliz tili' : 'O\'zbek tili'}

Quyidagi JSON formatda qaytaring:
{
  "toolType": "${toolType}",
  "title": "${topic}",
  "questions": [
    {
      "id": 1,
      "question": "Savol matni?",
      "options": ["A variant", "B variant", "C variant", "D variant"],
      "correctAnswer": 0,
      "explanation": "Qisqa izoh"
    }
  ],
  "crosswordWords": [
    { "word": "TERMIN", "clue": "Ta'rif", "direction": "across", "start": [0, 0] }
  ]
}`;

  try {
    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.6,
        },
      });

      const text = response.text || '';
      try {
        const parsed = JSON.parse(text);
        return res.json(parsed);
      } catch {}
    }
  } catch (err) {
    console.warn('Gemini interactive generator error:', err);
  }

  return res.json({
    toolType: toolType || 'Test',
    title: topic,
    questions: [
      {
        id: 1,
        question: `${topic} bo'yicha asosiy tushuncha qaysi?`,
        options: ['Fundamental parametr', 'Boshlang\'ich aksioma', 'Nazariy mezon', 'Empirik indeks'],
        correctAnswer: 0,
        explanation: 'Mazkur sohada fundamental parametrlar asosiy o\'lchov hisoblanadi.'
      },
      {
        id: 2,
        question: `${topic}ning asosiy amaliy maqsadi nima?`,
        options: ['Jarayonlarni optimallashtirish', 'Faqat statistik hisob', 'Xarajatlarni oshirish', 'Cheklovlarni ko\'paytirish'],
        correctAnswer: 0,
        explanation: 'Asosiy maqsad samaradorlikni oshirish va resurslarni tejashdir.'
      },
      {
        id: 3,
        question: 'Zamonaviy davrda mazkur yo\'nalishda qaysi texnologiyalar eng ko\'p qo\'llaniladi?',
        options: ['Sun\'iy intellekt va avtomatlashtirish', 'Qo\'lda jadvallar', 'Mexanik relelar', 'Arxiv qog\'ozlari'],
        correctAnswer: 0,
        explanation: 'Sun\'iy intellekt va raqamli texnologiyalar jarayonni tubdan tezlashtirdi.'
      }
    ],
    crosswordWords: [
      { word: 'TAHLIL', clue: 'Ma\'lumotlarni chuqur o\'rganish usuli', direction: 'across', start: [0, 0] },
      { word: 'TIZIM', clue: 'O\'zaro bog\'liq elementlar yig\'indisi', direction: 'down', start: [0, 0] }
    ]
  });
});

// 5. Generate Text Docs (Insho, Maqola, Tarjima, Rezyume, etc.)
app.post('/api/gemini/generate-text', async (req, res) => {
  const { docType, topic, details, lang = 'uz' } = req.body;

  const prompt = `Yozma hujjat tayyorlang: ${docType}.
Mavzu: "${topic}"
Qo'shimcha: "${details || ''}"
Til: ${lang === 'ru' ? 'Rus tili' : lang === 'en' ? 'Ingliz tili' : 'O\'zbek tili'}

JSON formatda qaytaring:
{
  "title": "${topic}",
  "docType": "${docType}",
  "content": "To'liq matn...",
  "wordCount": 350
}`;

  try {
    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.6,
        },
      });

      const text = response.text || '';
      try {
        const parsed = JSON.parse(text);
        return res.json(parsed);
      } catch {}
    }
  } catch (err) {
    console.warn('Gemini text generator error:', err);
  }

  return res.json({
    title: topic,
    docType: docType || 'Insho',
    content: `SARLAVHA: ${topic}\n\nKIRISH:\n${topic} masalasi bugungi kunda inson tafakkuri va amaliy faoliyatining muhim yo'nalishlaridan birini tashkil etadi.\n\nASOSIY QISM:\nMavzu tahlili shuni ko'rsatadiki, to'g'ri strategiya va izchillik muvaffaqiyat garovidir. Birinchidan, asosiy maqsadlarni belgilash kerak. Ikkinchidan, zamonaviy usullardan unumli foydalanish talab etiladi.\n\nXULOSA:\nShunday qilib, ${topic} istiqbolli yo'nalish bo'lib, unga mas'uliyat bilan yondashish kutilgan natijalarni beradi.`,
    wordCount: 300
  });
});

// 6. Dedicated AI Assistant Chat (bot guidance and any educational question)
app.post('/api/gemini/ai-assistant-chat', async (req, res) => {
  const { message, lang = 'uz', userName = 'Foydalanuvchi' } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Xabar kiritilmagan' });
  }

  const prompt = `Siz @TAQDIMIY_BOT va unga bog'langan Telegram Mini App platformasining rasmiy, do'stona va professional Sun'iy Intellekt Maslahatchisisiz.
Foydalanuvchi ismi: "${userName}".
Tanlangan til: ${lang === 'ru' ? 'Rus tili' : lang === 'en' ? 'Ingliz tili' : 'O\'zbek tili'}.

Foydalanuvchi savoli: "${message}".

Sizning vazifangiz:
1. Agar savol @TAQDIMIY_BOT bo'yicha bo'lsa:
   - Taqdimot yaratish (100+ shablonlar, mavzuga mos ramkalar va alloma/personaj rasmlari, PPTX va PDF yuklab olish).
   - Referat, mustaqil ish, kurs ishi, tezis yoki testlar yaratish.
   - Balansni to'ldirish ("Akkaunt" bo'limida Uzcard/Humo karta raqamiga to'lov qilib, chek yuborish orqali administrator tasdiqlashi).
   - "Do'stni taklif qil - pul top" referal tizimi (har bir do'st uchun 5,000 so'm bonus).
   - Promokod va kunlik VIP tizimi (masalan START2026, VIPKUNLIK).
   - Rasmiy yordam va qo'llab-quvvatlash: @TaqdimiySupport.
2. Agar savol ta'lim, fan, metodologiya yoki umumiy mavzuda bo'lsa:
   - Juda aniq, ixcham, qiziqarli va professional javob bering.

Javobingiz o'ta cho'zilib ketmasin (2-4 ta ixcham xatboshi), do'stona va tushunarli bo'lsin.
Faqat bevosita javob matnini qaytaring:`;

  try {
    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          temperature: 0.7,
        },
      });

      const reply = response.text || '';
      if (reply.trim()) {
        return res.json({ reply: reply.trim() });
      }
    }
  } catch (err) {
    console.warn('Gemini chat assistant error:', err);
  }

  // Smart fallback
  return res.json({
    reply: `Assalomu alaykum, ${userName}! @TAQDIMIY_BOT xizmatida 100+ shablonlar, mavzuga mos ramkalar va personajlar bilan PPTX/PDF taqdimotlar hamda referat, kurs ishlari tayyorlashingiz mumkin. Balansni "Akkaunt" bo'limidan karta orqali to'ldirishingiz mumkin. Qo'shimcha savolingiz bormi?`
  });
});

// --- ADMIN & MANAGEMENT APIS ---

app.get('/api/admin/stats', (req, res) => {
  res.json({
    ...state.stats,
    pendingReceiptsCount: state.receipts.filter(r => r.status === 'pending').length,
    activePromosCount: state.promoCodes.filter(p => p.active).length,
    botStatus: 'Online',
    botUsername: '@TAQDIMIY_BOT',
    chiefAdmin: state.settings.supportUsername,
  });
});

app.get('/api/admin/receipts', (req, res) => {
  res.json(state.receipts);
});

// Approve/Reject Receipt
app.post('/api/admin/receipts/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'approved' or 'rejected'
  const receipt = state.receipts.find(r => r.id === id);
  if (!receipt) {
    return res.status(404).json({ error: 'Chek topilmadi' });
  }
  receipt.status = status;
  if (status === 'approved') {
    state.stats.totalRevenueUz += receipt.amount;
  }
  res.json({ success: true, receipt });
});

// Submit user receipt (Card transfer only)
app.post('/api/user/submit-receipt', (req, res) => {
  const { amount, cardLast4, fullName, username = 'user' } = req.body;
  const newReceipt = {
    id: `REC-${Math.floor(100 + Math.random() * 900)}`,
    userId: 'usr_8921',
    username,
    fullName: fullName || 'Foydalanuvchi',
    amount: Number(amount) || 20000,
    paymentMethod: 'Karta orqali chek',
    cardLast4: cardLast4 || '0000',
    receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
    status: 'pending',
    date: new Date().toISOString(),
  };
  state.receipts.unshift(newReceipt);
  res.json({ success: true, receipt: newReceipt });
});

// Promo codes
app.get('/api/admin/promos', (req, res) => {
  res.json(state.promoCodes);
});

app.post('/api/admin/promos/create', (req, res) => {
  const { code, type, value, remaining } = req.body;
  if (!code || !type || !value) {
    return res.status(400).json({ error: 'Barcha maydonlarni to\'ldiring' });
  }
  const newPromo = {
    code: String(code).toUpperCase().trim(),
    type,
    value: Number(value),
    remaining: Number(remaining) || 50,
    active: true
  };
  state.promoCodes.push(newPromo);
  res.json({ success: true, promo: newPromo });
});

// Redeem promo code
app.post('/api/user/redeem-promo', (req, res) => {
  const { code } = req.body;
  const cleanCode = String(code || '').toUpperCase().trim();
  const promo = state.promoCodes.find(p => p.code === cleanCode && p.active && p.remaining > 0);
  
  if (!promo) {
    return res.status(400).json({ error: 'Promokod yaroqsiz yoki muddati tugagan!' });
  }

  promo.remaining -= 1;
  res.json({
    success: true,
    message: promo.type === 'vip' 
      ? `Tabriklaymiz! Sizga ${promo.value} kunlik VIP taqdim etildi!` 
      : `Tabriklaymiz! Balansingizga ${promo.value.toLocaleString()} so'm qo'shildi!`,
    promo
  });
});

// Broadcast announcements
app.get('/api/announcements', (req, res) => {
  res.json(state.announcements);
});

app.post('/api/admin/announcements', (req, res) => {
  const { title, content } = req.body;
  const newAnn = {
    id: `ann-${Date.now()}`,
    title,
    content,
    date: new Date().toISOString().split('T')[0],
    views: 0
  };
  state.announcements.unshift(newAnn);
  res.json({ success: true, announcement: newAnn });
});

// Mount Vite or serve static
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
