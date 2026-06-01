'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Calendar, FileText, Smartphone, ChevronDown, Clock, Share2, X, Send, Brain, Sparkles, User, MapPin } from 'lucide-react';
import { store } from '@/lib/store';

const CollapsibleCard = ({ title, icon: Icon, children, isUrgent = false, defaultOpen = true }: any) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`glass-panel rounded-2xl overflow-hidden border ${isUrgent ? 'border-destructive/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-border/50'}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${isUrgent ? 'text-destructive animate-pulse' : 'text-primary'}`} />
          <h2 className={`font-bold ${isUrgent ? 'text-destructive' : 'text-foreground'}`}>{title}</h2>
        </div>
        <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="p-4 pt-0 border-t border-border/30">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const RodrigoSaLogo = () => (
  <div className="flex flex-col items-start select-none whitespace-nowrap">
    <div className="flex items-center gap-1 leading-none">
      <span className="text-[22px] font-black tracking-tighter text-logo-text font-sans">
        RODRIGO
      </span>
      <div className="bg-accent px-1.5 py-0.5 rounded flex items-center justify-center">
        <span className="text-[17px] font-black text-accent-foreground leading-none font-sans">
          SÁ
        </span>
      </div>
    </div>
    <span className="text-[7.5px] font-black tracking-[0.25em] mt-1 text-logo-subtext font-sans uppercase">
      VEREADOR DE MANAUS
    </span>
  </div>
);

export default function VereadorDashboard() {
  const [activeTab, setActiveTab] = useState<'boletim' | 'agenda' | 'chat'>('boletim');
  const [quickRead, setQuickRead] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  
  // Dynamic Data States
  const [bulletin, setBulletin] = useState<any>({ summary: '', headlines: [], relevanceScore: 70 });
  const [agenda, setAgenda] = useState<any[]>([]);
  const [criticalDossier, setCriticalDossier] = useState<any>(null);

  // Chatbot state (Mobile version)
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      id: 1,
      sender: 'ai',
      text: 'Olá, Vereador Rodrigo Sá! Sou o seu assistente de IA. Posso resumir pautas, avaliar riscos políticos ou dar detalhes dos dossiês do gabinete legislativo.',
      date: 'Agora mesmo'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setBulletin(store.get('bulletin') || { summary: '', headlines: [], relevanceScore: 70 });
    setAgenda(store.get('agenda') || []);
    
    const dossiers = store.get('dossiers') || [];
    const found = dossiers.find((d: any) => d.status === 'Crítico' || d.category === 'Zoneamento') || dossiers[0];
    setCriticalDossier(found);
  }, []);

  const handleSendChatMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: userText,
      date: 'Agora mesmo'
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      let replyText = '';
      const query = userText.toLowerCase();
      const currentNews = store.get('news') || [];

      if (query.includes('pl 123') || query.includes('zoneamento') || query.includes('leste')) {
        const zoneamentoArticle = currentNews.find((n: any) => n.category === 'Zoneamento' || n.title.includes('123'));
        replyText = `Vereador, sobre o **PL 123/2026 (Zoneamento da Zona Leste)**: a Comissão de Urbanismo aprovou o parecer. A oposição articula emendas para reduzir o percentual verde de novos loteamentos para 10%.
        
💡 **Recomendação estratégica:** Vote CONTRA a emenda da oposição (Sandra Lima) para manter alinhamento ecológico e a favor do texto principal que fortalece o comércio na Av. das Torres.`;
      } else if (query.includes('hospital') || query.includes('saúde') || query.includes('obra')) {
        const saudeArticle = currentNews.find((n: any) => n.category === 'Saúde' || n.title.includes('Hospital'));
        replyText = `Sobre as obras do **Hospital Municipal Leste**: o executivo está atrasado nos repasses e apenas 42% foi concluído.
        
⚠️ **Alerta:** A oposição está explorando isso. O gabinete legislativo já enviou requerimento formal cobrando explicações da construtora e da Secretaria de Saúde.`;
      } else if (query.includes('transporte') || query.includes('app') || query.includes('taxa')) {
        replyText = `A lei de **Apps de Mobilidade** foi sancionada com taxa de 1,5% revertida inteiramente para recapeamento asfáltico periférico. A associação de motoristas aprovou as novas vias e o gabinete foi citado como mediador positivo.`;
      } else {
        replyText = `Entendido, Vereador. Busquei no feed de notícias do gabinete. Posso ajudá-lo com detalhes rápidos sobre:
1. **PL 123/2026** (Zoneamento comercial e ambiental)
2. **Hospital Leste** (Fiscalização da ala pediátrica)
3. **Transporte por Apps** (Taxação social e pavimentação)

Qual dessas pautas deseja examinar agora?`;
      }

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: replyText,
        date: 'Agora mesmo'
      };

      setChatMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 flex flex-col font-sans">
      {/* Mobile-first Header */}
      <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-xl border-b border-border p-4 flex items-center justify-between">
        <div>
          <RodrigoSaLogo />
          <div className="flex items-center gap-1.5 mt-1.5">
            <Clock className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] text-zinc-400">Atualizado agora</span>
          </div>
        </div>
        <div className="flex gap-2">
          {activeTab === 'boletim' && (
            <button 
              onClick={() => setQuickRead(!quickRead)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${quickRead ? 'bg-primary/20 border-primary text-primary' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
            >
              Leitura Rápida
            </button>
          )}
          <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center overflow-hidden">
            <Smartphone className="w-4 h-4 text-primary" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-4 flex-1 flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-400">
        
        {/* VIEW 1: BOLETIM (Default Dashboard) */}
        {activeTab === 'boletim' && (
          <div className="space-y-4 flex flex-col">
            {/* Alerta Crítico */}
            <CollapsibleCard title="Votação Crítica Hoje" icon={AlertTriangle} isUrgent={true} defaultOpen={true}>
              <div className="mt-4">
                <div className="bg-destructive/10 rounded-xl p-4">
                  <p className="text-sm font-bold text-destructive mb-1">
                    PL 123/2026 - Zoneamento Urbano
                  </p>
                  {!quickRead && (
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Entra em pauta às 14h. A oposição articula emenda que descaracteriza o projeto original e reduz as cotas verdes na Zona Leste.
                    </p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button 
                      onClick={() => setIsDossierOpen(true)}
                      className="flex-1 bg-destructive hover:bg-destructive/90 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors shadow-lg shadow-destructive/20"
                    >
                      Ver Dossiê Crítico
                    </button>
                  </div>
                </div>
              </div>
            </CollapsibleCard>

            {/* Boletim Diário */}
            <CollapsibleCard title="Boletim Diário" icon={FileText} defaultOpen={true}>
              <div className="space-y-5 mt-4">
                {/* Status do Dia */}
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    Status do Dia
                  </h4>
                  <p className={`bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 text-zinc-200 whitespace-pre-wrap leading-relaxed ${quickRead ? 'text-xs' : 'text-sm'}`}>
                    {quickRead 
                      ? (bulletin.summary ? (bulletin.summary.substring(0, 120) + "...") : "")
                      : (bulletin.summary || "Nenhum boletim publicado hoje pelo gabinete.")}
                  </p>
                </div>

                {/* Termômetro Político */}
                {!quickRead && (
                  <div>
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Termômetro Político</h4>
                    <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-2xl font-black text-amber-500">{bulletin.relevanceScore || 70}<span className="text-xs text-zinc-500 font-medium">/100</span></span>
                        <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase">
                          {(bulletin.relevanceScore || 70) > 85 ? 'Tensão Crítica' : (bulletin.relevanceScore || 70) > 60 ? 'Tensão Alta' : 'Tensão Moderada'}
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-2">
                        <div className="bg-gradient-to-r from-emerald-500 via-amber-500 to-destructive h-2 rounded-full" style={{ width: `${bulletin.relevanceScore || 70}%` }}></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Manchetes */}
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Top Manchetes do Feed</h4>
                  <ul className="space-y-3">
                    {(bulletin.headlines && bulletin.headlines.length > 0 ? bulletin.headlines : [
                      { title: 'Nenhuma manchete catalogada hoje.', source: 'Gabinete' }
                    ]).map((head: any, idx: number) => (
                      <li key={idx} className="flex gap-3">
                        <div className="w-1 rounded-full bg-primary shrink-0"></div>
                        <div className="flex-1">
                          <a href="#" className="text-xs font-semibold text-primary hover:underline line-clamp-2">
                            {head.title}
                          </a>
                          <span className="text-[10px] text-zinc-500 mt-1 block">{head.source} {head.time ? `• ${head.time}` : ''}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CollapsibleCard>
          </div>
        )}

        {/* VIEW 2: AGENDA (Legislative Calendar View) */}
        {activeTab === 'agenda' && (
          <div className="space-y-4">
            {/* Elegant Week strip */}
            <div className="glass-panel p-4 rounded-2xl border border-border/50">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-3">Calendário de Junho</span>
              <div className="flex justify-between text-center">
                {[
                  { day: 'Seg', num: '01', active: true },
                  { day: 'Ter', num: '02', active: false },
                  { day: 'Qua', num: '03', active: false },
                  { day: 'Qui', num: '04', active: false },
                  { day: 'Sex', num: '05', active: false }
                ].map((d) => (
                  <div 
                    key={d.num}
                    className={`flex-1 py-2 px-1 rounded-xl transition-all ${
                      d.active 
                      ? 'bg-primary text-white font-bold shadow-md shadow-primary/20 scale-105' 
                      : 'text-zinc-400'
                    }`}
                  >
                    <p className="text-[10px] uppercase font-semibold leading-none">{d.day}</p>
                    <p className="text-sm mt-1 leading-none font-bold">{d.num}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* List of Compromissos */}
            <div className="glass-panel p-4 rounded-2xl border border-border/50 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-border/30">
                <h3 className="font-bold text-sm text-foreground">Compromissos de Hoje</h3>
                <span className="text-[10px] text-primary font-bold uppercase bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                  {agenda.length} Eventos
                </span>
              </div>

              <div className="space-y-3.5 pt-1">
                {agenda.length === 0 ? (
                  <p className="text-xs text-zinc-550 italic text-center py-4">Sem compromissos agendados no momento.</p>
                ) : (
                  agenda.map((ag: any, idx: number) => (
                    <div key={ag.id} className="flex gap-4 relative">
                      {idx < agenda.length - 1 && (
                        <div className="absolute left-[39px] top-7 bottom-[-16px] w-0.5 bg-zinc-850"></div>
                      )}
                      <div className="text-xs font-bold text-zinc-400 w-12 text-right pt-2 shrink-0">{ag.time}</div>
                      <div className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background mt-2.5 z-10 shrink-0"></div>
                      <div className="flex-1 bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/80">
                        <p className="text-xs font-bold text-foreground">{ag.title}</p>
                        <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                          {ag.location}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: AI CHATBOT (Pesquisa de Bolso) */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col glass-panel rounded-2xl border border-border/50 overflow-hidden min-h-[380px]">
            {/* Header info */}
            <div className="px-4 py-2.5 bg-card/25 border-b border-border/40 flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Base do Gabinete Conectada
              </span>
              <span className="text-zinc-500 uppercase tracking-widest font-bold">Assistente</span>
            </div>

            {/* Message Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 flex flex-col text-xs leading-relaxed max-h-[320px]">
              {chatMessages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex gap-2.5 max-w-[88%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                    msg.sender === 'user' 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
                  }`}>
                    {msg.sender === 'user' ? 'VS' : <Brain className="w-3.5 h-3.5 text-primary" />}
                  </div>
                  <div className={`p-3 rounded-xl ${
                    msg.sender === 'user'
                    ? 'bg-primary/10 border border-primary/20 text-foreground rounded-tr-none'
                    : 'bg-zinc-900/50 border border-border/80 text-zinc-200 rounded-tl-none'
                  } whitespace-pre-wrap`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2.5 max-w-[88%]">
                  <div className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                    <Brain className="w-3.5 h-3.5 text-primary animate-pulse" />
                  </div>
                  <div className="p-3 bg-zinc-900/40 border border-border/50 rounded-xl rounded-tl-none flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
            </div>

            {/* Suggested quick buttons (if welcome only) */}
            {chatMessages.length === 1 && (
              <div className="p-3 bg-white/[0.01] border-t border-border/20 space-y-1.5">
                <span className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Perguntas Sugeridas:</span>
                <div className="flex flex-col gap-1.5">
                  <button 
                    type="button"
                    onClick={() => { setChatInput('Qual o status do PL 123?'); }}
                    className="w-full text-left bg-zinc-900/60 hover:bg-zinc-800 border border-border/45 p-2 rounded-lg text-[10px] text-zinc-300 font-medium transition-colors"
                  >
                    🔎 Qual o status do PL 123 de Zoneamento?
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setChatInput('Como está a reforma do Hospital Leste?'); }}
                    className="w-full text-left bg-zinc-900/60 hover:bg-zinc-800 border border-border/45 p-2 rounded-lg text-[10px] text-zinc-300 font-medium transition-colors"
                  >
                    🏥 Como está a reforma do Hospital Leste?
                  </button>
                </div>
              </div>
            )}

            {/* Input Bar */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChatMessage();
              }} 
              className="p-3 border-t border-border/30 bg-card/25 flex gap-2 shrink-0"
            >
              <input 
                type="text" 
                placeholder="Escreva sua dúvida legislativa..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-850 rounded-xl px-3 text-xs text-foreground focus:outline-none placeholder-zinc-550"
              />
              <button 
                type="submit"
                className="p-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl transition-colors shadow shadow-primary/10 cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

      </main>
      
      {/* PWA Bottom Navigation (Dynamic) */}
      <nav className="fixed bottom-0 left-0 right-0 glass-panel border-t border-border/50 pb-safe z-50">
        <div className="flex justify-around items-center p-3">
          <button 
            type="button"
            onClick={() => setActiveTab('boletim')}
            className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${activeTab === 'boletim' ? 'text-primary font-bold scale-105' : 'text-zinc-500 hover:text-zinc-350'}`}
          >
            <FileText className="w-5.5 h-5.5" />
            <span className="text-[10px]">Boletim</span>
          </button>
          
          <button 
            type="button"
            onClick={() => setActiveTab('agenda')}
            className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${activeTab === 'agenda' ? 'text-primary font-bold scale-105' : 'text-zinc-500 hover:text-zinc-350'}`}
          >
            <Calendar className="w-5.5 h-5.5" />
            <span className="text-[10px]">Agenda</span>
          </button>
          
          <button 
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${activeTab === 'chat' ? 'text-primary font-bold scale-105' : 'text-zinc-500 hover:text-zinc-350'}`}
          >
            <Brain className="w-5.5 h-5.5" />
            <span className="text-[10px]">Pesquisa IA</span>
          </button>
        </div>
      </nav>

      {/* Drawer do Dossiê Crítico (Estilo PWA) */}
      <AnimatePresence>
        {isDossierOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDossierOpen(false)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] bg-zinc-950 border-t border-border rounded-t-3xl p-6 overflow-y-auto pb-10 flex flex-col space-y-5"
            >
              {/* Handlebar */}
              <div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto shrink-0"></div>
              
              <div className="flex justify-between items-start">
                <div>
                  <span className="inline-flex items-center rounded-md bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive ring-1 ring-inset ring-destructive/20">
                    {criticalDossier?.status || 'Votação Crítica'}
                  </span>
                  <h2 className="text-xl font-bold text-foreground mt-2">{criticalDossier?.title || 'PL 123/2026 - Zoneamento Urbano'}</h2>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsDossierOpen(false)}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Resumo Técnico</h4>
                  <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/50 p-4 rounded-xl border border-border">
                    {criticalDossier?.description || 'Carregando detalhes do dossiê...'}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Orientação Estratégica (Gabinete)</h4>
                  <ul className="space-y-2 text-sm text-zinc-300">
                    {(criticalDossier?.keyPoints && criticalDossier.keyPoints.length > 0 ? criticalDossier.keyPoints : [
                      'Análise estratégica em andamento pela assessoria.'
                    ]).map((pt: string, idx: number) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {criticalDossier?.stakeholders && criticalDossier.stakeholders.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Termômetro de Votos</h4>
                    <div className="space-y-2.5">
                      {criticalDossier.stakeholders.map((person: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-xs bg-zinc-900/40 p-2.5 rounded-lg border border-border/30">
                          <div>
                            <span className="font-semibold text-foreground">{person.name}</span>
                            <span className="text-zinc-500 block">{person.role}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            person.stance === 'Favorável' 
                            ? 'bg-emerald-500/10 text-emerald-500' 
                            : 'bg-destructive/10 text-destructive'
                          }`}>
                            {person.stance.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setIsDossierOpen(false)}
                    className="flex-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-medium py-3 rounded-xl transition-colors text-xs"
                  >
                    Voltar para o Gabinete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
