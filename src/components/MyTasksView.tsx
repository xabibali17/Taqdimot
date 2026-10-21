import React, { useState } from 'react';
import { TaskItem, Language, PresentationData, AcademicDocData, InteractiveQuizData, TextDocData } from '../types';
import { translations } from '../locales/translations';
import { 
  FolderCheck, Search, Trash2, ExternalLink, 
  Download, FileText, Presentation, HelpCircle, Star 
} from 'lucide-react';
import { exportToPptx } from '../utils/pptxExport';

interface MyTasksViewProps {
  tasks: TaskItem[];
  lang: Language;
  onOpenTask: (task: TaskItem) => void;
  onDeleteTask: (taskId: string) => void;
}

export const MyTasksView: React.FC<MyTasksViewProps> = ({
  tasks,
  lang,
  onOpenTask,
  onDeleteTask,
}) => {
  const t = translations[lang];
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === 'all' || task.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  const handleDownloadPptx = async (e: React.MouseEvent, presData: PresentationData) => {
    e.stopPropagation();
    try {
      await exportToPptx(presData);
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    if (type.includes('taqdimot')) return Presentation;
    if (type.includes('test') || type.includes('krossvord')) return HelpCircle;
    return FileText;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderCheck className="w-5 h-5 text-blue-400" />
            <span>{t.tasks.title}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Avval yaratilgan barcha slaydlar, referatlar va testlarni boshqaring hamda yuklab oling.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Qidiruv..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {[
          { id: 'all', label: 'Barchasi' },
          { id: 'presentation', label: 'Taqdimotlar' },
          { id: 'academic', label: 'Akademik ishlar' },
          { id: 'interactive', label: 'Testlar' },
          { id: 'text', label: 'Matnlar' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterCategory(tab.id)}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterCategory === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
          <FolderCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {t.tasks.empty}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const Icon = getIcon(task.type);
            const isPresentation = 'slides' in task.data;

            return (
              <div
                key={task.id}
                onClick={() => onOpenTask(task)}
                className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg group"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <span className="capitalize">{task.type.replace('_', ' ')}</span>
                      <span>·</span>
                      <span>{new Date(task.date).toLocaleDateString()}</span>
                      {isPresentation && (
                        <>
                          <span>·</span>
                          <span className="text-blue-400">{(task.data as PresentationData).slides.length} ta slayd</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {isPresentation && (
                    <button
                      onClick={(e) => handleDownloadPptx(e, task.data as PresentationData)}
                      className="min-h-[36px] px-3 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-blue-500/30"
                      title="PPTX yuklab olish"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PPTX</span>
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTask(task.id);
                    }}
                    className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-500 hover:text-red-400 bg-slate-800 hover:bg-slate-700/60 rounded-xl transition-colors"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="min-h-[36px] px-3 bg-slate-800 group-hover:bg-blue-600 text-slate-300 group-hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors">
                    <span>{t.tasks.view}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
