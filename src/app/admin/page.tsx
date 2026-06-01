'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, FileText, Globe, FolderTree, MessageSquareWarning, 
  TrendingUp, Activity, Award, ShieldAlert, Sparkles, Plus, AlertCircle, Play
} from 'lucide-react';
import { store } from '@/lib/store';

export default function AdminDashboard() {
  // Dynamic stats
  const [sourcesCount, setSourcesCount] = useState(0);
  const [dossiersCount, setDossiersCount] = useState(0);
  const [pendingDemands, setPendingDemands] = useState(0);
  const [newsCount, setNewsCount] = useState(0);
  const [competitors, setCompetitors] = useState<any[]>([]);

  // Scenario Simulator States
  const [simulateCategory, setSimulateCategory] = useState('Geral');
  const [simulatedScenario, setSimulatedScenario] = useState('realista');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>({
    risk: 'Baixo',
    sentiment: 'Majoritariamente Neutro/Positivo',
    action: 'Manter a cobertura regular e focar na divulgação das conquistas da Zona Leste.'
  });

  useEffect(() => {
    const loadStoreData = () => {
      const sources = store.get('sources') || [];
      const dossiers = store.get('dossiers') || [];
      const demands = store.get('demands') || [];
      const news = store.get('news') || [];
      const comps = store.get('competitors') || [];

      setSourcesCount(sources.filter((s: any) => s.status === 'ativo').length);
      setDossiersCount(dossiers.length);
      setPendingDemands(demands.filter((d: any) => d.status === 'Novo').length);
      setNewsCount(news.length);
      setCompetitors(comps);
    };

    loadStoreData();

    // Listen to store updates
    window.addEventListener('storage', loadStoreData);
    return () => window.removeEventListener('storage', loadStoreData);
  }, []);

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      if (simulatedScenario === 'otimista') {
        setSimulationResult({
          risk: 'Nulo',
          sentiment: 'Altamente Positivo (80%+)',
          action: 'Acelerar publicações no Media Room. Lançar o Press Release oficial para A Crítica imediatamente. Impulsionar posts de Instagram.'
        });
      } else if (simulatedScenario === 'pessimista') {
        setSimulationResult({
          risk: 'Crítico / Crise Elevada',
          sentiment: 'Majoritariamente Negativo (70%+)',
          action: 'Ativar comitê de contenção de crise. Suspender campanhas publicitárias ativas. Preparar o vereador para discurso defensivo e focar na burocracia dos repasses da construtora do Hospital Leste.'
        });
      } else {
        setSimulationResult({
          risk: 'Moderado',
          sentiment: 'Estável com polarização pontual',
          action: 'Manter a cobertura e posicionamento atual. Responder às demandas de bairros de forma rápida para conter descontentamentos locais.'
        });
      }
    }, 1000);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in flex-1 overflow-y-auto">
      
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-primary" />
            Visão Geral
          </h1>
          <p className="text-zinc-400 mt-2">Painel de controle e monitoramento de desempenho político em tempo real.</p>
        </div>
      </header>

      {/* Grid Indicadores Dinâmicos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/admin/monitoramento" className="glass-panel p-6 rounded-2xl border border-border/80 hover:border-primary/50 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <Sparkles className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded uppercase">Feed IA</span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-foreground">{newsCount}</p>
            <p className="text-xs text-zinc-400 font-medium">Notícias Indexadas</p>
          </div>
        </Link>

        <Link href="/admin/fontes" className="glass-panel p-6 rounded-2xl border border-border/80 hover:border-emerald-500/50 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <Globe className="w-8 h-8 text-emerald-500 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded uppercase">Fontes</span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-foreground">{sourcesCount}</p>
            <p className="text-xs text-zinc-400 font-medium">Fontes Monitoradas Ativas</p>
          </div>
        </Link>

        <Link href="/admin/dossies" className="glass-panel p-6 rounded-2xl border border-border/80 hover:border-amber-500/50 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <FolderTree className="w-8 h-8 text-amber-500 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded uppercase">Dossiês</span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-foreground">{dossiersCount}</p>
            <p className="text-xs text-zinc-400 font-medium">Dossiês de Inteligência</p>
          </div>
        </Link>

        <Link href="/admin/demandas" className="glass-panel p-6 rounded-2xl border border-border/80 hover:border-destructive/50 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <MessageSquareWarning className="w-8 h-8 text-destructive group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded uppercase">Triagem</span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-foreground">{pendingDemands}</p>
            <p className="text-xs text-zinc-400 font-medium">Demandas Pendentes</p>
          </div>
        </Link>
      </div>

      {/* Grid Gráficos (SVG Premium) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Gráfico 1: Evolução sentimento e volume (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-border flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-base text-foreground">Termômetro de Opinião</h3>
              <p className="text-xs text-zinc-400">Evolução do sentimento das notícias coletadas</p>
            </div>
            <div className="flex gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Positivo</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-zinc-400"></span> Neutro</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-destructive"></span> Negativo</span>
            </div>
          </div>

          {/* Gráfico SVG Linha */}
          <div className="flex-1 min-h-[220px] w-full relative pt-2">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              {/* Definindo gradientes */}
              <defs>
                <linearGradient id="gradient-positive" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="gradient-negative" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="var(--border)" strokeOpacity="0.45" strokeDasharray="3 3" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="var(--border)" strokeOpacity="0.45" strokeDasharray="3 3" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="var(--border)" strokeOpacity="0.45" strokeDasharray="3 3" />
              
              {/* Area 1 under line Positivo */}
              <path 
                d="M 10 120 Q 120 70 250 80 T 490 50 L 490 190 L 10 190 Z" 
                fill="url(#gradient-positive)"
              />
              
              {/* Line 1: Positivo (Verde) */}
              <path 
                d="M 10 120 Q 120 70 250 80 T 490 50" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="3" 
                strokeLinecap="round"
              />
              
              {/* Area 2 under line Negativo */}
              <path 
                d="M 10 180 Q 120 150 250 140 T 490 120 L 490 190 L 10 190 Z" 
                fill="url(#gradient-negative)"
              />

              {/* Line 2: Negativo (Vermelho) */}
              <path 
                d="M 10 180 Q 120 150 250 140 T 490 120" 
                fill="none" 
                stroke="#ef4444" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              />

              {/* Data points with card outline to look crisp */}
              <circle cx="250" cy="80" r="6" fill="#10b981" stroke="var(--card)" strokeWidth="2" />
              <circle cx="490" cy="50" r="6" fill="#10b981" stroke="var(--card)" strokeWidth="2" />
              <circle cx="490" cy="120" r="5" fill="#ef4444" stroke="var(--card)" strokeWidth="2" />
            </svg>
            <div className="flex justify-between text-[9px] text-zinc-500 font-semibold uppercase mt-3">
              <span>Seg</span>
              <span>Ter</span>
              <span>Qua</span>
              <span>Qui</span>
              <span>Sex</span>
              <span>Sáb</span>
              <span>Dom</span>
            </div>
          </div>
        </div>

        {/* Gráfico 2: Share of Voice (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-border flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-base text-foreground flex items-center gap-1.5">
              <Award className="w-5 h-5 text-primary" />
              Share of Voice
            </h3>
            <p className="text-xs text-zinc-400">Porcentagem de citações ativas na mídia regional</p>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {competitors.map((comp, idx) => {
              const totalMentions = competitors.reduce((acc, c) => acc + c.mentions, 0);
              const pct = Math.round((comp.mentions / totalMentions) * 100);
              
              return (
                <div key={idx} className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">{comp.name}</span>
                    <span className="text-zinc-400 font-bold">{pct}% ({comp.mentions} citações)</span>
                  </div>
                  <div className="w-full bg-zinc-900/60 border border-border/50 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${pct}%`,
                        backgroundColor: comp.color || '#3b82f6'
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Simulador de Cenários de Relações Públicas / RP */}
      <div className="glass-panel p-6 rounded-3xl border border-border max-w-5xl">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/50">
          <ShieldAlert className="w-6 h-6 text-primary" />
          <div>
            <h3 className="font-bold text-base text-foreground">Simulador de Cenários (Planejamento de RP)</h3>
            <p className="text-xs text-zinc-400">Projete e antecipe tendências, riscos de crises e planos de mitigação de narrativa.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Parâmetros da Simulação (5 cols) */}
          <div className="md:col-span-5 space-y-4 text-xs">
            <div>
              <label className="font-semibold text-zinc-300 block mb-1.5">Pauta Analisada</label>
              <select 
                value={simulateCategory}
                onChange={(e) => setSimulateCategory(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-foreground focus:ring-1 focus:ring-primary/50 focus:outline-none"
              >
                <option>Geral (Toda a cobertura)</option>
                <option>PL 123/2026 - Zoneamento</option>
                <option>Saúde - Hospital Municipal</option>
                <option>Mobilidade - Apps</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-zinc-300 block mb-1.5">Cenário Alvo</label>
              <div className="flex gap-2">
                {['otimista', 'realista', 'pessimista'].map((scen) => (
                  <button
                    key={scen}
                    type="button"
                    onClick={() => setSimulatedScenario(scen)}
                    className={`flex-1 py-2 text-xs font-semibold capitalize rounded-lg border transition-all cursor-pointer ${
                      simulatedScenario === scen
                      ? scen === 'otimista'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 font-bold'
                        : scen === 'pessimista'
                        ? 'bg-destructive/10 border-destructive text-destructive font-bold'
                        : 'bg-primary/10 border-primary text-primary font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-350'
                    }`}
                  >
                    {scen}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleSimulate}
              disabled={isSimulating}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow shadow-primary/10 cursor-pointer"
            >
              {isSimulating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Projetando Cenário...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-white" />
                  Calcular Cenário
                </>
              )}
            </button>
          </div>

          {/* Resultado da Simulação (7 cols) */}
          <div className="md:col-span-7 bg-zinc-900/35 border border-border/80 rounded-2xl p-5 space-y-4 text-xs">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Relatório do Simulador</span>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-zinc-500 block mb-0.5">Risco Político Estimado</span>
                <span className={`font-bold text-sm ${
                  simulationResult.risk.includes('Crítico') || simulationResult.risk.includes('Alto')
                  ? 'text-destructive animate-pulse'
                  : simulationResult.risk === 'Moderado'
                  ? 'text-amber-500'
                  : 'text-emerald-500'
                }`}>
                  {simulationResult.risk}
                </span>
              </div>
              
              <div>
                <span className="text-zinc-500 block mb-0.5">Expectativa de Sentimento</span>
                <span className="font-semibold text-zinc-200">{simulationResult.sentiment}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-border/40">
              <span className="text-zinc-500 block mb-1">Linha de Ação RP Recomendada</span>
              <p className="text-zinc-300 leading-relaxed font-medium bg-zinc-950/40 p-3 rounded-lg border border-border/30">
                {simulationResult.action}
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
