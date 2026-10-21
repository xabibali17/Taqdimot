import React from 'react';
import { Home, Grid, FolderCheck, Sparkles, User, ShieldCheck } from 'lucide-react';
import { Language, UserProfile } from '../types';
import { translations } from '../locales/translations';

interface BottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  lang: Language;
  user?: UserProfile;
  isChiefAdmin?: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  admin?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ 
  activeTab, 
  onSelectTab, 
  lang,
  user,
  isChiefAdmin: isChiefAdminProp
}) => {
  const t = translations[lang];

  // Check if current user is Chief Administrator
  const isChiefAdmin = 
    isChiefAdminProp ?? (
      user?.telegramUsername?.toLowerCase() === '@r_vf7' ||
      user?.telegramId === '1273917582'
    );

  const baseItems: NavItem[] = [
    { id: 'home', label: t.topNav.home, icon: Home },
    { id: 'services', label: t.topNav.services, icon: Grid },
    { id: 'tasks', label: t.topNav.myTasks, icon: FolderCheck },
    { id: 'aichat', label: 'AI Chat', icon: Sparkles, highlight: true },
    { id: 'profile', label: 'Akkaunt', icon: User },
  ];

  const items: NavItem[] = isChiefAdmin 
    ? [...baseItems, { id: 'admin', label: 'Admin', icon: ShieldCheck, admin: true }]
    : baseItems;

  const colsClass = isChiefAdmin ? 'grid-cols-6' : 'grid-cols-5';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 pb-safe">
      <div className={`w-full max-w-md mx-auto grid ${colsClass} h-15 items-center px-1`}>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`min-h-[44px] flex flex-col items-center justify-center transition-all relative py-1 px-0.5 ${
                isActive 
                  ? item.admin 
                    ? 'text-red-400 font-bold' 
                    : item.highlight 
                    ? 'text-blue-400 font-bold' 
                    : 'text-blue-400 font-bold' 
                  : item.admin
                  ? 'text-red-400/70 hover:text-red-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.highlight && !isActive ? (
                <div className="relative">
                  <Icon className="w-5 h-5 text-blue-400" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
                </div>
              ) : (
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              )}
              
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap truncate max-w-[54px] leading-tight">
                {item.label}
              </span>
              
              {isActive && (
                <span className={`absolute bottom-0.5 w-1.5 h-1 rounded-full ${item.admin ? 'bg-red-400' : 'bg-blue-400'}`} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
