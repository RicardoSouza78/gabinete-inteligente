'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic2, Video, Play, Square, Download, FolderPlus,
  Search, Tag, AlertTriangle, Clock, User, Zap,
  Copy, CheckCircle2, RefreshCw, Volume2, Bookmark,
  X, FileText
} from 'lucide-react';
import { store } from '@/lib/store';
import { showToast } from '@/components/admin/Toast';

// ── Seed data: transcript lines per session ──────────────────────────────────
const SEED_SESSIONS = [
  {
    id: 1,
    title: 'Sessão Plenária Ordinária — Votação PL 123/2026',
    youtubeUrl: 'https://www.youtube.com/watch?v=example1',
    date: '31 Mai 2026',
    duration: '2h 14min',
    status: 'Concluída',
    summary: 'Sessão marcada por debate acirrado sobre o PL de zoneamento urbano. Vereador Rodrigo Sá usou a tribuna para defender as áreas verdes e cobrar a Secretaria de Saúde sobre o Hospital Leste.',
    keywords: ['zoneamento', 'hospital', 'zona leste', 'emenda', 'saúde'],
    transcript: [
      { id: 1, time: '00:02:15', speaker: 'Presidente (Mesa)', color: '#64748b', text: 'Declaro aberta a Sessão Plenária Ordinária desta Casa. Solicitamos a todos os parlamentares que tomem seus assentos. O primeiro item da pauta é a votação em segundo turno do PL 123/2026 sobre zoneamento urbano.' },
      { id: 2, time: '00:05:33', speaker: 'Vereador Rodrigo Sá', color: '#243580', highlight: true, text: 'Presidente, peço a palavra. O PL 123/2026 é uma pauta urgente para os moradores da Zona Leste. Não podemos permitir que emendas de última hora reduzam as áreas verdes obrigatórias. Os igarapés de Manaus são patrimônio ambiental e histórico desta cidade.' },
      { id: 3, time: '00:09:47', speaker: 'Vereadora Sandra Lima', color: '#f59e0b', text: 'Com todo o respeito ao nobre colega, as emendas propostas visam viabilizar economicamente os novos empreendimentos. Sem flexibilização, não haverá geração de empregos na região.' },
      { id: 4, time: '00:14:20', speaker: 'Vereador Rodrigo Sá', color: '#243580', highlight: true, text: 'Desenvolvimento econômico não pode ser feito às custas do meio ambiente. Apresento ao plenário os dados da SEMMAS que indicam que a Zona Leste já perdeu 18% de sua cobertura vegetal na última década. Precisamos de mais proteção, não menos.' },
      { id: 5, time: '00:19:05', speaker: 'Vereador Marcelo Silva', color: '#10b981', text: 'Apoio integralmente a posição do vereador Rodrigo Sá. A emenda 04/2026 precisa ser retirada de pauta para análise aprofundada pela Comissão de Meio Ambiente.' },
      { id: 6, time: '00:24:40', speaker: 'Presidente (Mesa)', color: '#64748b', text: 'Coloco em votação o requerimento de destaque da emenda 04/2026 para votação em separado. Os favoráveis digam sim.' },
      { id: 7, time: '00:31:12', speaker: 'Vereador Rodrigo Sá', color: '#243580', highlight: true, text: 'Presidente, quero também registrar formalmente minha preocupação com as obras do Hospital Municipal Leste. Minha equipe realizou vistoria in loco e constatou paralisação de 15 dias na ala infantil. Protocolarei requerimento de informações urgentes à Secretaria de Saúde.' },
      { id: 8, time: '00:38:55', speaker: 'Vereadora Sandra Lima', color: '#f59e0b', text: 'Comungo da preocupação quanto ao hospital. Esse assunto merece atenção bipartidária. Solicito ao presidente que marque audiência pública sobre o tema.' },
      { id: 9, time: '00:45:30', speaker: 'Presidente (Mesa)', color: '#64748b', text: 'Registrado o pedido da vereadora. Passamos agora à votação nominal do PL 123/2026 em seu texto base, sem as emendas destacadas.' },
      { id: 10, time: '00:52:18', speaker: 'Vereador Rodrigo Sá', color: '#243580', highlight: true, text: 'Voto SIM ao texto base, e manifesto contrariedade à emenda 04/2026. A Zona Leste merece políticas públicas que respeitem suas comunidades e seu ecossistema.' },
    ]
  },
  {
    id: 2,
    title: 'Sessão Extraordinária — Votação Orçamento Saúde',
    youtubeUrl: 'https://www.youtube.com/watch?v=example2',
    date: '28 Mai 2026',
    duration: '1h 47min',
    status: 'Concluída',
    summary: 'Votação do suplemento orçamentário para a Secretaria de Saúde. Vereador Rodrigo Sá questionou critérios de distribuição entre zonas geográficas.',
    keywords: ['orçamento', 'saúde', 'suplemento', 'secretaria', 'zona norte'],
    transcript: [
      { id: 1, time: '00:01:40', speaker: 'Presidente (Mesa)', color: '#64748b', text: 'Sessão Extraordinária convocada para deliberar sobre o suplemento orçamentário de R$ 4,2 milhões para a Secretaria Municipal de Saúde.' },
      { id: 2, time: '00:06:22', speaker: 'Vereador Rodrigo Sá', color: '#243580', highlight: true, text: 'Quero saber como esses recursos serão distribuídos geograficamente. A Zona Leste e a Zona Norte concentram 62% da população mais vulnerável do município e historicamente recebem menos investimento per capita em saúde.' },
      { id: 3, time: '00:13:45', speaker: 'Vereador Marcelo Silva', color: '#10b981', text: 'Apoio o questionamento. A proposta não detalha distribuição por UBS. Solicito que a votação seja suspensa até recebermos o mapa de distribuição da Secretaria.' },
      { id: 4, time: '00:21:10', speaker: 'Vereador Rodrigo Sá', color: '#243580', highlight: true, text: 'Formalizo o requerimento de adiamento. Sem transparência na destinação dos recursos, não há como votar responsavelmente por nossos eleitores.' },
    ]
  }
];

// ── Simulated live transcript lines for the "transcribing" mode ──────────────
const LIVE_LINES = [
  { speaker: 'Presidente (Mesa)', color: '#64748b', text: 'Iniciamos a sessão de hoje com 21 vereadores presentes. O quórum está confirmado.' },
  { speaker: 'Vereador Rodrigo Sá', color: '#243580', highlight: true, text: 'Presidente, solicito a palavra para tratar de matéria urgente de interesse da população da Zona Leste.' },
  { speaker: 'Presidente (Mesa)', color: '#64748b', text: 'Concedida a palavra ao nobre vereador Rodrigo Sá.' },
  { speaker: 'Vereador Rodrigo Sá', color: '#243580', highlight: true, text: 'Agradeço. Gostaria de registrar as conquistas desta semana para nossa base eleitoral. O Decreto de Emergência na Zona Leste, publicado ontem no Diário Oficial, é resultado direto do nosso requerimento protocolado há 72 horas.' },
  { speaker: 'Vereadora Sandra Lima', color: '#f59e0b', text: 'Parabenizo o vereador pela iniciativa, embora discorde que a autoria seja exclusiva de um único parlamentar.' },
  { speaker: 'Vereador Rodrigo Sá', color: '#243580', highlight: true, text: 'Com todo o respeito, o requerimento está protocolado com número, data e assinatura. Os cidadãos merecem transparência sobre quem trabalha por eles nesta Casa.' },
  { speaker: 'Vereador Marcelo Silva', color: '#10b981', text: 'A discussão sobre autoria é secundária. O importante é que a população seja atendida. Parabenizo a ambos pela pressão exercida.' },
  { speaker: 'Presidente (Mesa)', color: '#64748b', text: 'Encerramos o grande expediente. Passamos agora à Ordem do Dia com a votação do Requerimento nº 412/2026.' },
];

// ── Speaker color map ─────────────────────────────────────────────────────────
const SPEAKER_INITIALS = (name: string) =>
  name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

export default function TranscricaoPage() {
  const [sessions, setSessions] = useState<any[]>(SEED_SESSIONS);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpeaker, setFilterSpeaker] = useState('Todos');
  const [liveLines, setLiveLines] = useState<any[]>([]);
  const [liveIndex, setLiveIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [copied, setCopied] = useState(false);
  const [newSessionOpen, setNewSessionOpen] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const liveRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll live transcript
  useEffect(() => {
    if (transcriptRef.current && isTranscribing) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [liveLines, isTranscribing]);

  // Elapsed time ticker
  useEffect(() => {
    if (isTranscribing) {
      timerRef.current = setInterval(() => setElapsedTime(t => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTranscribing]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  const startTranscription = () => {
    if (!youtubeUrl.trim()) {
      showToast('Cole um link do YouTube para iniciar a transcrição.', 'error');
      return;
    }
    setIsTranscribing(true);
    setLiveLines([]);
    setLiveIndex(0);
    setElapsedTime(0);
    setNewSessionOpen(false);
    setActiveSession(null);

    let idx = 0;
    const addLine = () => {
      if (idx < LIVE_LINES.length) {
        const line = {
          ...LIVE_LINES[idx],
          id: Date.now() + idx,
          time: formatTime(idx * 18 + Math.floor(Math.random() * 12)),
        };
        setLiveLines(prev => [...prev, line]);
        idx++;
        liveRef.current = setTimeout(addLine, 2800 + Math.random() * 2000);
      } else {
        // Loop
        idx = 0;
        liveRef.current = setTimeout(addLine, 3500);
      }
    };
    liveRef.current = setTimeout(addLine, 1200);
  };

  const stopTranscription = () => {
    setIsTranscribing(false);
    if (liveRef.current) clearTimeout(liveRef.current);
    if (liveLines.length > 0) {
      const newSess = {
        id: Date.now(),
        title: sessionTitle || `Sessão Ao Vivo — ${new Date().toLocaleDateString('pt-BR')}`,
        youtubeUrl,
        date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
        duration: formatTime(elapsedTime),
        status: 'Concluída',
        summary: 'Transcrição realizada automaticamente pelo Robô de IA. Revisão manual recomendada.',
        keywords: ['ao vivo', 'plenária'],
        transcript: liveLines,
      };
      setSessions(prev => [newSess, ...prev]);
      setActiveSession(newSess);
      showToast('Transcrição salva com sucesso!', 'success');
    }
  };

  const handleExportTxt = (session: any) => {
    const content = `GABINETE INTELIGENTE — VEREADOR RODRIGO SÁ
TRANSCRIÇÃO: ${session.title}
DATA: ${session.date} | DURAÇÃO: ${session.duration}
${'='.repeat(60)}

${session.transcript.map((l: any) =>
  `[${l.time}] ${l.speaker}:\n${l.text}\n`
).join('\n')}

---
Transcrição gerada em: ${new Date().toLocaleString('pt-BR')}
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcricao_${session.date.replace(/ /g, '_')}.txt`;
    a.click();
    showToast('Transcrição exportada como .txt!', 'success');
  };

  const handleCopyTranscript = (session: any) => {
    const text = session.transcript.map((l: any) =>
      `[${l.time}] ${l.speaker}: ${l.text}`
    ).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Transcrição copiada para a área de transferência!', 'info');
  };

  const handleSaveToDossier = (session: any) => {
    const summaryLines = session.transcript
      .filter((l: any) => l.highlight)
      .slice(0, 3)
      .map((l: any) => `[${l.time}] ${l.text.substring(0, 120)}...`)
      .join('\n');

    store.addDossier({
      title: `[Plenária] ${session.title}`,
      category: 'Zoneamento',
      status: 'Em Andamento',
      summary: session.summary,
      description: `Sessão transcrita automaticamente pelo Robô de IA.\n\nData: ${session.date}\nDuração: ${session.duration}\n\nPrincipais falas do Vereador Rodrigo Sá:\n${summaryLines}`,
    });
    showToast(`Sessão enviada para Dossiês!`, 'success');
  };

  // Filtered transcript view
  const displaySession = activeSession;
  const filteredLines = displaySession?.transcript?.filter((l: any) => {
    const matchSearch = !searchTerm || l.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSpeaker = filterSpeaker === 'Todos' || l.speaker === filterSpeaker;
    return matchSearch && matchSpeaker;
  });

  const speakers = displaySession
    ? ['Todos', ...(Array.from(new Set(displaySession.transcript.map((l: any) => l.speaker))) as string[])]
    : [];

  return (
    <div className="p-8 space-y-6 animate-in fade-in flex-1 flex flex-col min-h-0 relative">

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Mic2 className="w-8 h-8 text-primary" />
            Robô de Transcrição
            {isTranscribing && (
              <span className="flex items-center gap-1.5 text-sm font-semibold text-red-400 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                AO VIVO
              </span>
            )}
          </h1>
          <p className="text-zinc-400 mt-1.5 text-sm">
            Transcrição automática por IA de sessões plenárias ao vivo ou gravadas no YouTube.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isTranscribing ? (
            <button
              onClick={stopTranscription}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg transition-colors font-semibold shadow-lg shadow-red-500/20 cursor-pointer"
            >
              <Square className="w-4 h-4" fill="currentColor" />
              Parar ({formatTime(elapsedTime)})
            </button>
          ) : (
            <button
              onClick={() => setNewSessionOpen(true)}
              className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2.5 rounded-lg transition-colors font-semibold shadow-lg shadow-accent/10 cursor-pointer"
            >
              <Play className="w-4 h-4" fill="currentColor" />
              Nova Transcrição
            </button>
          )}
        </div>
      </header>

      {/* New Session Modal */}
      {newSessionOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-border p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Video className="w-5 h-5 text-red-500" />
                Configurar Sessão
              </h3>
              <button onClick={() => setNewSessionOpen(false)} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase mb-1.5 block">Link do YouTube (ao vivo ou gravado)</label>
                <div className="relative">
                  <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={e => setYoutubeUrl(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase mb-1.5 block">Título da Sessão (opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Sessão Ordinária — Junho 2026"
                  value={sessionTitle}
                  onChange={e => setSessionTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 text-xs text-primary/80 leading-relaxed">
                <p className="font-semibold mb-1 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Como funciona:</p>
                <p>O robô de IA irá capturar o áudio do stream ou vídeo e transcrever em tempo real, identificando cada orador e marcando automaticamente as falas do Vereador Rodrigo Sá.</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setNewSessionOpen(false)} className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors">
                Cancelar
              </button>
              <button
                onClick={startTranscription}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4" fill="currentColor" />
                Iniciar Transcrição
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0 overflow-y-auto">

        {/* Sessions List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" /> Sessões Gravadas ({sessions.length})
          </h3>
          {sessions.map(sess => (
            <button
              key={sess.id}
              onClick={() => { setActiveSession(sess); setSearchTerm(''); setFilterSpeaker('Todos'); }}
              className={`w-full text-left glass-panel border p-4 rounded-xl transition-all cursor-pointer ${
                activeSession?.id === sess.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  sess.status === 'Concluída' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                }`}>{sess.status}</span>
                <span className="text-[10px] text-zinc-600 flex items-center gap-0.5 shrink-0">
                  <Clock className="w-3 h-3" /> {sess.duration}
                </span>
              </div>
              <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">{sess.title}</p>
              <p className="text-[10px] text-zinc-500 mt-1">{sess.date}</p>
              <div className="flex gap-1 flex-wrap mt-2">
                {sess.keywords.slice(0, 3).map((kw: string) => (
                  <span key={kw} className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">#{kw}</span>
                ))}
              </div>
            </button>
          ))}

          {isTranscribing && (
            <div className="glass-panel border border-red-500/30 bg-red-500/5 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-red-400 text-xs font-bold mb-2">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                TRANSCREVENDO AO VIVO
              </div>
              <p className="text-[10px] text-zinc-400 truncate">{youtubeUrl || 'Stream ao vivo'}</p>
              <p className="text-lg font-mono font-bold text-red-400 mt-1">{formatTime(elapsedTime)}</p>
              <p className="text-[10px] text-zinc-500">{liveLines.length} falas capturadas</p>
            </div>
          )}
        </div>

        {/* Transcript Viewer */}
        <div className="lg:col-span-3 flex flex-col gap-4">

          {/* Live mode */}
          {isTranscribing ? (
            <div className="glass-panel border border-red-500/20 rounded-2xl flex flex-col flex-1 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-4 h-4 text-red-400 animate-pulse" />
                  <span className="text-sm font-semibold text-foreground">Transcrição em Tempo Real</span>
                  <RefreshCw className="w-3.5 h-3.5 text-zinc-500 animate-spin" />
                </div>
                <span className="text-xs text-zinc-500 font-mono">{liveLines.length} linhas</span>
              </div>
              <div ref={transcriptRef} className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[520px]">
                {liveLines.map((line, i) => (
                  <div key={line.id} className={`flex gap-3 animate-in slide-in-from-bottom-2 duration-300 ${line.highlight ? 'bg-primary/5 border border-primary/10 rounded-xl p-3 -mx-1' : ''}`}>
                    <div className="shrink-0 flex flex-col items-center gap-1 pt-0.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                        style={{ backgroundColor: line.color }}
                      >
                        {SPEAKER_INITIALS(line.speaker)}
                      </div>
                      <span className="text-[9px] text-zinc-600 font-mono">{line.time}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold" style={{ color: line.color }}>{line.speaker}</span>
                        {line.highlight && <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">RODRIGO SÁ</span>}
                        {i === liveLines.length - 1 && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-bold animate-pulse">AO VIVO</span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-300 leading-relaxed">{line.text}</p>
                    </div>
                  </div>
                ))}
                {liveLines.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-zinc-600 gap-3">
                    <RefreshCw className="w-8 h-8 animate-spin text-red-400" />
                    <p className="text-sm">Conectando ao stream de áudio...</p>
                  </div>
                )}
              </div>
            </div>

          ) : displaySession ? (
            <>
              {/* Session Detail Header */}
              <div className="glass-panel border border-border rounded-2xl p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 shrink-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Video className="w-4 h-4 text-red-500" />
                    <span className="text-[10px] text-zinc-500 font-mono truncate">{displaySession.youtubeUrl}</span>
                  </div>
                  <h2 className="text-lg font-bold text-foreground">{displaySession.title}</h2>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{displaySession.summary}</p>
                  <div className="flex items-center gap-4 mt-3 text-[10px] text-zinc-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {displaySession.duration}</span>
                    <span className="flex items-center gap-1"><Mic2 className="w-3 h-3" /> {displaySession.transcript.length} falas</span>
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />
                      {displaySession.transcript.filter((l: any) => l.highlight).length} falas do Rodrigo Sá
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 flex-wrap">
                  <button
                    onClick={() => handleCopyTranscript(displaySession)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                  <button
                    onClick={() => handleExportTxt(displaySession)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Exportar .txt
                  </button>
                  <button
                    onClick={() => handleSaveToDossier(displaySession)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <FolderPlus className="w-3.5 h-3.5" /> Salvar em Dossiê
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Buscar na transcrição..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {speakers.map(sp => (
                    <button
                      key={sp}
                      onClick={() => setFilterSpeaker(sp)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors shrink-0 ${
                        filterSpeaker === sp
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-foreground'
                      }`}
                    >
                      {sp === 'Todos' ? 'Todos' : SPEAKER_INITIALS(sp)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transcript Lines */}
              <div className="glass-panel border border-border rounded-2xl flex flex-col overflow-hidden flex-1">
                <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                  <span className="text-xs text-zinc-500">{filteredLines?.length || 0} falas exibidas</span>
                  {searchTerm && (
                    <span className="text-xs text-primary font-medium">Filtrado por: "{searchTerm}"</span>
                  )}
                </div>
                <div className="overflow-y-auto max-h-[480px] p-4 space-y-5">
                  {filteredLines?.map((line: any) => {
                    const isHighlighted = searchTerm && line.text.toLowerCase().includes(searchTerm.toLowerCase());
                    return (
                      <div
                        key={line.id}
                        className={`flex gap-3 ${
                          line.highlight
                            ? 'bg-primary/5 border border-primary/15 rounded-xl p-3.5 -mx-1'
                            : isHighlighted
                              ? 'bg-accent/5 border border-accent/20 rounded-xl p-3.5 -mx-1'
                              : ''
                        }`}
                      >
                        <div className="shrink-0 flex flex-col items-center gap-1 pt-0.5">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                            style={{ backgroundColor: line.color }}
                          >
                            {SPEAKER_INITIALS(line.speaker)}
                          </div>
                          <span className="text-[9px] text-zinc-600 font-mono">{line.time}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs font-bold" style={{ color: line.color }}>{line.speaker}</span>
                            {line.highlight && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-bold flex items-center gap-0.5">
                                <Bookmark className="w-2.5 h-2.5" /> DESTAQUE
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-zinc-300 leading-relaxed">
                            {searchTerm ? (
                              line.text.split(new RegExp(`(${searchTerm})`, 'gi')).map((part: string, i: number) =>
                                part.toLowerCase() === searchTerm.toLowerCase()
                                  ? <mark key={i} className="bg-accent/30 text-foreground rounded px-0.5">{part}</mark>
                                  : part
                              )
                            ) : line.text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 glass-panel border border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center p-12 gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Mic2 className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">Selecione uma sessão</h3>
                <p className="text-sm text-zinc-500 max-w-xs mx-auto mt-1 leading-relaxed">
                  Escolha uma sessão à esquerda para ver a transcrição completa, ou inicie uma nova transcrição ao vivo.
                </p>
              </div>
              <button
                onClick={() => setNewSessionOpen(true)}
                className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4" fill="currentColor" />
                Iniciar Nova Transcrição
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
