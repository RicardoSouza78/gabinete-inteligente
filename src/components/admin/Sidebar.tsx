'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, FileText, Globe, FolderTree, 
  Image as ImageIcon, MessageSquareWarning, MessageSquare, 
  Compass, Sun, Moon, Sparkles, Newspaper, FileBarChart2, Mic2, MessageCircle
} from 'lucide-react';
import { store } from '@/lib/store';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Feed de IA', href: '/admin/monitoramento', icon: Sparkles },
  { name: 'Motor de IA (Boletim)', href: '/admin/boletim', icon: FileText },
  { name: 'Fontes Monitoradas', href: '/admin/fontes', icon: Globe },
  { name: 'Diário Oficial', href: '/admin/diario-oficial', icon: Newspaper },
  { name: 'Relatório Semanal (PDF)', href: '/admin/relatorio-semanal', icon: FileBarChart2 },
  { name: 'Transcrição Plenária', href: '/admin/transcricao', icon: Mic2 },
  { name: 'Alertas WhatsApp', href: '/admin/whatsapp', icon: MessageCircle },
  { name: 'Dossiês', href: '/admin/dossies', icon: FolderTree },
  { name: 'Media Room', href: '/admin/media', icon: ImageIcon },
  { name: 'Demandas', href: '/admin/demandas', icon: MessageSquareWarning },
  { name: 'Bate-papo IA', href: '/admin/chat', icon: MessageSquare },
  { name: 'Roteiro Aberto', href: '/admin/roadmap', icon: Compass },
];

const RodrigoSaLogo = () => (
  <div className="flex flex-col items-start select-none w-full whitespace-nowrap">
    <div className="flex items-center gap-1.5 leading-none">
      <span className="text-[32px] font-black tracking-tighter text-logo-text font-sans">
        RODRIGO
      </span>
      <div className="bg-accent px-2.5 py-1 rounded-[10px] flex items-center justify-center overflow-visible">
        <span className="text-[25px] font-black text-accent-foreground leading-none font-sans">
          SÁ
        </span>
      </div>
    </div>
    <span className="text-[10px] font-black tracking-[0.27em] mt-1.5 text-logo-subtext font-sans uppercase">
      VEREADOR DE MANAUS
    </span>
  </div>
);

export function Sidebar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Read theme from store on mount
    setTheme(store.getTheme());
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    store.setTheme(nextTheme);
  };

  return (
    <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-xl hidden md:flex flex-col h-screen sticky top-0 shrink-0">
      <div className="p-6 border-b border-border flex items-center justify-start">
        <RodrigoSaLogo />
      </div>
      
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActive 
                ? 'bg-primary/10 border border-primary/20 text-primary font-medium' 
                : 'text-zinc-400 hover:text-foreground hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-zinc-500'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      {/* Botão Seletor de Tema & Perfil Assessor */}
      <div className="p-4 border-t border-border space-y-4">
        
        {/* Alternador de Tema */}
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold bg-zinc-900/60 hover:bg-zinc-800/80 border border-border text-zinc-400 hover:text-foreground transition-all duration-200 cursor-pointer"
        >
          <span className="flex items-center gap-2">
            {theme === 'dark' ? (
              <>
                <Moon className="w-4 h-4 text-primary" />
                Modo Escuro
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                Modo Claro
              </>
            )}
          </span>
          <span className="text-[10px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded uppercase">Alternar</span>
        </button>

        <div className="flex items-center gap-3 px-3 py-2 border-t border-border/40 pt-4">
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
            AS
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Assessor</p>
            <p className="text-xs text-zinc-500">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
