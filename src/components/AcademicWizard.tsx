import React, { useState } from 'react';
import { Language, AcademicDocData, TextDocData, ServiceType } from '../types';
import { translations } from '../locales/translations';
import { 
  ArrowLeft, Wand2, Download, Printer, Copy, Check, 
  BookOpen, FileText, Sparkles, Star 
} from 'lucide-react';

interface AcademicWizardProps {
  serviceType: ServiceType;
  lang: Language;
  onBack: () => void;
  onSaveTask: (data: AcademicDocData | TextDocData) => void;
}

export const AcademicWizard: React.FC<AcademicWizardProps> = ({
  serviceType,
  lang,
  onBack,
  onSaveTask,
}) => {
  const t = translations[lang];
  const serviceInfo = t.services[serviceType] || { title: serviceType, desc: '' };

  const [topic, setTopic] = useState<string>('');
  const [studentName, setStudentName] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [teacherName, setTeacherName] = useState<string>('');
  const [pages, setPages] = useState<number>(serviceType === 'kurs_ishi' || serviceType === 'diplom' ? 25 : 10);
  const [details, setDetails] = useState<string>('');

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [resultData, setResultData] = useState<AcademicDocData | TextDocData | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(0);

  const isTextType = ['insho', 'maqola', 'tarjima', 'rezyume', 'konspekt', 'motivatsion_xat'].includes(serviceType);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);

    try {
      if (isTextType) {
        const res = await fetch('/api/gemini/generate-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            docType: serviceInfo.title,
            topic,
            details,
            lang,
          }),
        });
        const data = await res.json();
        const textDoc: TextDocData = {
          id: `doc-${Date.now()}`,
          docType: serviceInfo.title,
          title: data.title || topic,
          content: data.content,
          keyHighlights: data.keyHighlights,
          wordCount: data.wordCount,
          createdAt: new Date().toISOString(),
        };
        setResultData(textDoc);
        onSaveTask(textDoc);
      } else {
        const res = await fetch('/api/gemini/generate-academic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            docType: serviceInfo.title,
            topic,
            studentName,
            subject,
            teacherName,
            pages,
            lang,
          }),
        });
        const data = await res.json();
        const academicDoc: AcademicDocData = {
          id: `acad-${Date.now()}`,
          docType: serviceInfo.title,
          title: data.title || topic,
          studentName,
          subject,
          teacherName,
          introduction: data.introduction,
          chapters: data.chapters || [],
          conclusion: data.conclusion,
          bibliography: data.bibliography || [],
          createdAt: new Date().toISOString(),
        };
        setResultData(academicDoc);
        onSaveTask(academicDoc);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadWord = () => {
    if (!resultData) return;
    let text = '';
    if ('chapters' in resultData) {
      text += `${resultData.docType.toUpperCase()}\n\n`;
      text += `Mavzu: ${resultData.title}\n`;
      if (resultData.studentName) text += `Bajaruvchi: ${resultData.studentName}\n`;
      if (resultData.subject) text += `Fan: ${resultData.subject}\n`;
      if (resultData.teacherName) text += `Ilmiy rahbar: ${resultData.teacherName}\n\n`;
      text += `KIRISH\n${resultData.introduction}\n\n`;
      resultData.chapters.forEach((ch) => {
        text += `${ch.title}\n`;
        ch.sections.forEach((sec) => {
          text += `\n${sec.title}\n${sec.text}\n`;
        });
        text += '\n';
      });
      text += `XULOSA\n${resultData.conclusion}\n\n`;
      text += `FOYDALANILGAN ADABIYOTLAR\n`;
      resultData.bibliography.forEach((b) => (text += `${b}\n`));
    } else {
      text = `${resultData.docType.toUpperCase()}\n\nMavzu: ${resultData.title}\n\n${resultData.content}`;
    }

    const blob = new Blob([text], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resultData.title.substring(0, 25)}_TalimAI.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!resultData) return;
    let full = '';
    if ('chapters' in resultData) {
      full = `${resultData.title}\n\nKIRISH:\n${resultData.introduction}\n\n` +
        resultData.chapters.map(c => `${c.title}\n` + c.sections.map(s => `${s.title}\n${s.text}`).join('\n\n')).join('\n\n') +
        `\n\nXULOSA:\n${resultData.conclusion}`;
    } else {
      full = resultData.content;
    }
    navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 pb-28">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="min-h-[44px] flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.wizard.prev}</span>
        </button>
        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
          {serviceInfo.title}
        </span>
      </div>

      {!resultData ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{serviceInfo.title} yaratish</h2>
              <p className="text-xs text-slate-400">{serviceInfo.desc}</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mavzu nomi <span className="text-red-400">*</span>
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Masalan: Raqamli iqtisodiyot sharoitida bank tizimini rivojlantirish"
                rows={3}
                className="w-full p-3.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {!isTextType && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Talaba / Muallif (F.I.Sh)
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Masalan: Jasur Beknazarov"
                    className="w-full p-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Fan / Yo'nalish
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Masalan: Bank ishi va audit"
                    className="w-full p-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Ilmiy rahbar / O'qituvchi
                  </label>
                  <input
                    type="text"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder="Masalan: prof. Qosimov E."
                    className="w-full p-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Taxminiy hajm (sahifa)
                  </label>
                  <select
                    value={pages}
                    onChange={(e) => setPages(Number(e.target.value))}
                    className="w-full p-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value={5}>5-7 sahifa (Qisqa)</option>
                    <option value={10}>10-15 sahifa (Standart)</option>
                    <option value={25}>20-30 sahifa (Katta / Kurs ishi)</option>
                    <option value={50}>40-60 sahifa (Diplom)</option>
                  </select>
                </div>
              </div>
            )}

            {isTextType && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Qo'shimcha talab yoki ko'rsatmalar
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Masalan: Qaysi tashkilotga, qanday uslubda va nimalarga ko'proq urg'u berish kerak..."
                  rows={3}
                  className="w-full p-3.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>

          <button
            disabled={!topic.trim() || isGenerating}
            onClick={handleGenerate}
            className={`w-full min-h-[50px] py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all shadow-lg ${
              topic.trim() && !isGenerating
                ? 'bg-blue-600 hover:bg-blue-500 active:scale-[0.98] shadow-blue-600/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isGenerating ? (
              <>
                <Wand2 className="w-5 h-5 animate-spin text-blue-300" />
                <span>AI materialni yozmoqda (1-2 daqiqa)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-blue-300" />
                <span>Hujjatni shakllantirish</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* Result View */
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-4 h-4" />
              Muvaffaqiyatli tayyorlandi!
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="min-h-[38px] px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Nusxalash</span>
              </button>
              <button
                onClick={() => window.print()}
                className="min-h-[38px] px-3 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
              <button
                onClick={handleDownloadWord}
                className="min-h-[38px] px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Word (.doc)</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 text-slate-200 shadow-2xl space-y-6">
            <div className="border-b border-slate-800 pb-4 text-center">
              <span className="text-xs uppercase tracking-widest text-blue-400 font-bold block mb-1">
                {resultData.docType}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {resultData.title}
              </h1>
            </div>

            {'chapters' in resultData ? (
              <div className="space-y-6 text-sm leading-relaxed">
                <div>
                  <h3 className="text-base font-bold text-blue-300 mb-2">KIRISH</h3>
                  <p className="text-slate-300 text-justify">{resultData.introduction}</p>
                </div>

                {resultData.chapters.map((ch, idx) => (
                  <div key={idx} className="space-y-4 pt-2">
                    <h2 className="text-base font-bold text-white border-l-2 border-blue-500 pl-3">
                      {ch.title}
                    </h2>
                    {ch.sections.map((sec, sIdx) => (
                      <div key={sIdx} className="space-y-1.5 pl-2">
                        <h4 className="font-semibold text-slate-200 text-xs text-blue-400">
                          {sec.title}
                        </h4>
                        <p className="text-slate-300 text-justify text-xs sm:text-sm">
                          {sec.text}
                        </p>
                      </div>
                    ))}
                  </div>
                ))}

                <div className="pt-4">
                  <h3 className="text-base font-bold text-blue-300 mb-2">XULOSA</h3>
                  <p className="text-slate-300 text-justify">{resultData.conclusion}</p>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    FOYDALANILGAN ADABIYOTLAR
                  </h3>
                  <ul className="text-xs text-slate-400 space-y-1">
                    {resultData.bibliography.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-sm leading-relaxed">
                <div className="whitespace-pre-wrap text-slate-200 font-sans">
                  {resultData.content}
                </div>
              </div>
            )}
          </div>

          {/* Rating */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-center">
            <span className="text-xs text-slate-400 block mb-2">Natijani baholang:</span>
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <Star className={`w-5 h-5 ${rating >= s ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                </button>
              ))}
            </div>
            {rating > 0 && <span className="text-xs text-emerald-400 mt-1 block">Baholandi! ({rating}/5)</span>}
          </div>
        </div>
      )}
    </div>
  );
};
