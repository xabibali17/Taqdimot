import React, { useState } from 'react';
import { Language, InteractiveQuizData } from '../types';
import { translations } from '../locales/translations';
import { 
  ArrowLeft, CheckCircle2, XCircle, Wand2, 
  HelpCircle, Printer, Award, RotateCcw, Volume2 
} from 'lucide-react';

interface InteractiveQuizViewProps {
  toolType: string;
  lang: Language;
  onBack: () => void;
  onSaveTask: (data: InteractiveQuizData) => void;
}

export const InteractiveQuizView: React.FC<InteractiveQuizViewProps> = ({
  toolType,
  lang,
  onBack,
  onSaveTask,
}) => {
  const t = translations[lang];
  const [topic, setTopic] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<string>('O\'rta');
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [quizData, setQuizData] = useState<InteractiveQuizData | null>(null);

  // Solving state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  // Audio speech synthesis for listening dialogue
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);

    try {
      const res = await fetch('/api/gemini/generate-interactive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolType,
          topic,
          questionCount,
          difficulty,
          lang,
        }),
      });
      const data = await res.json();
      const newQuiz: InteractiveQuizData = {
        id: `quiz-${Date.now()}`,
        toolType: data.toolType || toolType,
        title: data.title || topic,
        questions: data.questions || [],
        crosswordWords: data.crosswordWords || [],
        listeningDialogue: data.listeningDialogue,
        createdAt: new Date().toISOString(),
      };
      setQuizData(newQuiz);
      setSelectedAnswers({});
      setSubmitted(false);
      setScore(0);
      onSaveTask(newQuiz);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectAnswer = (qId: number, optionIdx: number) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const handleSubmitQuiz = () => {
    if (!quizData) return;
    let correctCount = 0;
    quizData.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correctCount += 1;
      }
    });
    setScore(correctCount);
    setSubmitted(true);
  };

  const handlePlayDialogue = () => {
    if (!quizData?.listeningDialogue?.audioScript) return;
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
        return;
      }
      const utter = new SpeechSynthesisUtterance(quizData.listeningDialogue.audioScript);
      utter.rate = 0.9;
      utter.onend = () => setIsPlayingAudio(false);
      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utter);
    }
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
          {toolType}
        </span>
      </div>

      {!quizData ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
            <HelpCircle className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-bold text-white mb-1">
            {toolType} yaratish
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Mavzuni kiriting va AI bir zumda to'g'ri javoblari hamda tushuntirishlari bilan interaktiv material tuzib beradi.
          </p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mavzu nomi <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Masalan: O'zbekiston tarixi, Ingliz tili grammatikasi, Fizika qonunlari..."
                className="w-full p-3.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Savollar soni
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full p-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value={5}>5 ta savol (Tezkor)</option>
                  <option value={10}>10 ta savol (Standart)</option>
                  <option value={15}>15 ta savol (Imtihon)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Qiyinlik darajasi
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="Oson">Oson (Boshlang'ich)</option>
                  <option value="O'rta">O'rta (Maktab / Litsey)</option>
                  <option value="Murakkab">Murakkab (Universitet)</option>
                </select>
              </div>
            </div>
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
                <span>AI materialni tuzmoqda...</span>
              </>
            ) : (
              <span>Yaratishni boshlash</span>
            )}
          </button>
        </div>
      ) : (
        /* Interactive Quiz / Tool Active View */
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {quizData.title}
            </h2>
            <button
              onClick={() => window.print()}
              className="min-h-[38px] px-3 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Chop etish (PDF)</span>
            </button>
          </div>

          {/* Listening Dialogue player if available */}
          {quizData.listeningDialogue && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4" />
                  Audio Dialog (Tinglash matni)
                </span>
                <button
                  onClick={handlePlayDialogue}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                    isPlayingAudio ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-600 text-white'
                  }`}
                >
                  {isPlayingAudio ? 'To\'xtatish' : 'Ovozli tinglash (TTS)'}
                </button>
              </div>
              <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                {quizData.listeningDialogue.audioScript}
              </p>
            </div>
          )}

          {/* Crossword words view if available */}
          {quizData.crosswordWords && quizData.crosswordWords.length > 0 && toolType === 'Krossvord' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <h3 className="text-sm font-bold text-white">Krossvord savollari va kalit so'zlari:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quizData.crosswordWords.map((cw, i) => (
                  <div key={i} className="p-3 bg-slate-800/60 border border-slate-700 rounded-xl text-xs">
                    <span className="font-bold text-blue-400">{i + 1}. ({cw.direction === 'across' ? 'Yotiq' : 'Tik'})</span>
                    <p className="text-slate-300 mt-1">{cw.clue}</p>
                    <span className="text-[10px] text-slate-500 font-mono mt-1 block">Javob: {cw.word} ({cw.word.length} harf)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Multiple choice questions */}
          <div className="space-y-4">
            {quizData.questions.map((q, idx) => {
              const selected = selectedAnswers[q.id];
              return (
                <div
                  key={q.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h3 className="text-sm font-semibold text-white leading-relaxed">
                      {q.question}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selected === optIdx;
                      const isCorrect = q.correctAnswer === optIdx;
                      
                      let optionStyle = 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800';
                      if (submitted) {
                        if (isCorrect) {
                          optionStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-300 font-semibold';
                        } else if (isSelected) {
                          optionStyle = 'bg-red-500/10 border-red-500 text-red-300 font-semibold';
                        }
                      } else if (isSelected) {
                        optionStyle = 'bg-blue-600/10 border-blue-500 text-white font-semibold ring-1 ring-blue-500';
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={submitted}
                          onClick={() => handleSelectAnswer(q.id, optIdx)}
                          className={`w-full min-h-[44px] p-3 rounded-xl border text-left text-xs flex items-center justify-between transition-all ${optionStyle}`}
                        >
                          <span>{opt}</span>
                          {submitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                          {submitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {submitted && q.explanation && (
                    <div className="mt-3 p-3 bg-blue-950/40 border border-blue-800/40 rounded-xl text-xs text-blue-300">
                      <span className="font-bold">Izoh: </span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit / Score Action */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
            {!submitted ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(selectedAnswers).length === 0}
                className={`w-full min-h-[48px] py-3 rounded-xl font-bold text-sm text-white transition-all ${
                  Object.keys(selectedAnswers).length > 0
                    ? 'bg-blue-600 hover:bg-blue-500 active:scale-[0.98] shadow-lg shadow-blue-600/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Javoblarni tekshirish
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-amber-400">
                  <Award className="w-6 h-6" />
                  <span className="text-lg font-black">
                    Natija: {score} / {quizData.questions.length} (
                    {Math.round((score / quizData.questions.length) * 100)}%)
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedAnswers({});
                    setSubmitted(false);
                    setScore(0);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl flex items-center gap-2 mx-auto transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Qayta yechish</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
