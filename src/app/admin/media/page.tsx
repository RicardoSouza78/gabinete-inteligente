'use client';

import { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, Share2, Copy, Check, RotateCcw, 
  MessageSquare, FileText, Send, Sparkles,
  ChevronRight, ArrowRight
} from 'lucide-react';
import { store } from '@/lib/store';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

function generateAIText(item: any, channel: string, tone: string): string {
  if (!item) return '';

  const title = item.title || '';
  const summary = item.summary || item.description || '';
  const keyPoints = item.keyPoints || [];
  const category = item.category || 'Geral';
  const source = item.source || 'Dossiê Técnico';

  let intro = '';
  let body = '';
  const hashtags = [
    '#MandatoAtivo',
    `#${category.replace(/\s+/g, '')}`,
    '#GabineteInteligente',
    '#Fiscalizacao'
  ];

  if (channel === 'instagram') {
    if (tone === 'Combativo / Firme') {
      intro = `🚨 POSTURA FIRME E COBRANÇA! ✊\n\nNão podemos aceitar passivamente o que prejudica nossa cidade. Sobre "${title}":`;
      body = `Estamos cobrando ativamente soluções e respostas claras. O cidadão merece respeito e transparência total nas ações públicas.`;
    } else if (tone === 'Agradecimento / Parceria') {
      intro = `🤝 TRABALHO EM EQUIPE E UNIÃO! ❤️\n\nHoje queremos agradecer a todos que caminham conosco. Sobre "${title}":`;
      body = `Essa conquista é fruto do diálogo constante com a comunidade e da nossa parceria por uma cidade melhor para todos.`;
    } else if (tone === 'Mobilizador / Emocional') {
      intro = `🔥 JUNTOS SOMOS MAIS FORTES! 🗣️\n\nA sua voz é a nossa força! Acompanhe de perto as novidades sobre "${title}":`;
      body = `É hora de mobilizar nossa comunidade, debater o que importa e lutar pelo futuro dos nossos bairros! Participe e compartilhe.`;
    } else {
      // Informativo e Institucional
      intro = `📢 INFORMATIVO DE MANDATO 📊\n\nComunicamos a todos a nossa atuação sobre "${title}":`;
      body = `Nossa equipe técnica realizou o levantamento completo dos fatos para garantir que os interesses da população sejam priorizados de forma técnica e transparente.`;
    }

    const pointsText = keyPoints.length > 0
      ? `\n\n📌 Principais pontos:\n` + keyPoints.slice(0, 3).map((p: string) => `• ${p}`).join('\n')
      : `\n\n📌 Resumo: ${summary}`;

    return `${intro}\n\n${summary}\n\n${body}${pointsText}\n\n${hashtags.join(' ')}`;
  }

  if (channel === 'twitter') {
    let tweet = '';
    if (tone === 'Combativo / Firme') {
      tweet = `🚨 Cobrança firme! Sobre "${title}": não aceitaremos descaso. Exigimos providências imediatas! ${summary.slice(0, 100)}... #Fiscalizacao`;
    } else if (tone === 'Agradecimento / Parceria') {
      tweet = `🤝 Trabalho em parceria! Agradecemos o apoio de todos sobre "${title}". Seguimos construindo pontes e avançando! #MandatoAtivo`;
    } else if (tone === 'Mobilizador / Emocional') {
      tweet = `🔥 Mobilização total! Participe do debate sobre "${title}". A sua voz faz toda a diferença para o nosso futuro! #JuntosPelaCidade`;
    } else {
      tweet = `📢 Informativo: Acompanhe nossa atuação técnica e detalhada em relação a "${title}". Transparência em primeiro lugar. #Trabalho`;
    }
    return tweet;
  }

  if (channel === 'whatsapp') {
    let titleHeader = '';
    if (tone === 'Combativo / Firme') {
      titleHeader = `*COBRANÇA E AÇÃO NO MANDATO* 🚨`;
    } else if (tone === 'Agradecimento / Parceria') {
      titleHeader = `*AGRADECIMENTO E PARCERIA* 🤝`;
    } else if (tone === 'Mobilizador / Emocional') {
      titleHeader = `*MOBILIZAÇÃO COMUNITÁRIA* 🔥`;
    } else {
      titleHeader = `*INFORME LEGISLATIVO E IMPRENSA* 📢`;
    }

    const points = keyPoints.length > 0
      ? `\n\n*Pontos fundamentais:*\n` + keyPoints.slice(0, 3).map((p: string) => `🔹 _${p}_`).join('\n')
      : `\n\n*Resumo:* _${summary}_`;

    return `${titleHeader}\n\n*Assunto:* ${title}\n\n${summary}${points}\n\n👉 Para acompanhar mais detalhes e relatórios completos, fale com nossa assessoria!`;
  }

  if (channel === 'press_release') {
    const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    let releaseHeader = '';
    if (tone === 'Combativo / Firme') {
      releaseHeader = `COMUNICADO À IMPRENSA - COBRANÇA DE PROVIDÊNCIAS`;
    } else if (tone === 'Agradecimento / Parceria') {
      releaseHeader = `NOTA OFICIAL - PARCERIA E AGRADECIMENTO`;
    } else if (tone === 'Mobilizador / Emocional') {
      releaseHeader = `MANIFESTO PÚBLICO - MOBILIZAÇÃO POPULAR`;
    } else {
      releaseHeader = `DIVULGAÇÃO DE ATIVIDADE LEGISLATIVA E FISCALIZAÇÃO`;
    }

    const paragraphs = [
      `${releaseHeader}`,
      `Manaus, ${today} – O gabinete parlamentar divulga nota oficial acerca do andamento e das deliberações em torno do tema: "${title}".`,
      `Segundo o levantamento técnico do gabinete, a pauta classificada sob a categoria "${category}" demanda atenção estratégica. De acordo com as análises preliminares: ${summary}.`,
      keyPoints.length > 0 
        ? `Os seguintes pontos de atenção foram destacados pela equipe de assessoria legislativa: 1) ${keyPoints[0] || ''}; 2) ${keyPoints[1] || ''}; 3) ${keyPoints[2] || ''}.`
        : `A assessoria segue acompanhando o caso visando resguardar a ordem constitucional e o bem-estar social dos munícipes.`,
      `O gabinete parlamentar reitera o compromisso com a transparência e a fiscalização ativa do erário e das políticas públicas municipais, permanecendo à disposição para esclarecimentos adicionais aos veículos de comunicação.`
    ];

    return paragraphs.join('\n\n');
  }

  return '';
}

export default function MediaRoomPage() {
  const [pautas, setPautas] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | number>('');
  const [activeChannel, setActiveChannel] = useState<'instagram' | 'twitter' | 'whatsapp' | 'press_release'>('instagram');
  const [tone, setTone] = useState('Informativo e Institucional');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');

  // Carrega pautas dinamicamente ao montar ou quando houver evento de storage
  useEffect(() => {
    const loadPautas = () => {
      const dossiers = (store.get('dossiers') || []).map((d: any) => ({
        ...d,
        uniqueId: `dossier-${d.id}`,
        displayType: 'Dossiê'
      }));
      const news = (store.get('news') || [])
        .filter((n: any) => n.relevance > 75)
        .map((n: any) => ({
          ...n,
          uniqueId: `news-${n.id}`,
          displayType: 'Notícia'
        }));
      const combined = [...dossiers, ...news];
      setPautas(combined);
      
      if (combined.length > 0) {
        setSelectedId((prev) => {
          const exists = combined.some(p => p.uniqueId === prev);
          return exists ? prev : combined[0].uniqueId;
        });
      }
    };

    loadPautas();
    window.addEventListener('storage', loadPautas);
    return () => window.removeEventListener('storage', loadPautas);
  }, []);

  // Atualiza o texto gerado quando muda pauta, canal ou tom
  useEffect(() => {
    if (selectedId && pautas.length > 0) {
      const selectedItem = pautas.find(p => p.uniqueId === selectedId);
      if (selectedItem) {
        const text = generateAIText(selectedItem, activeChannel, tone);
        setGeneratedText(text);
      }
    }
  }, [selectedId, activeChannel, tone, pautas]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      const selectedItem = pautas.find(p => p.uniqueId === selectedId);
      if (selectedItem) {
        const text = generateAIText(selectedItem, activeChannel, tone);
        const prefix = tone === 'Combativo / Firme' 
          ? '⚡ [IA OTIMIZADA - TOM COMBATIVO]\n\n' 
          : tone === 'Agradecimento / Parceria'
          ? '🤝 [IA OTIMIZADA - TOM DE PARCERIA]\n\n'
          : tone === 'Mobilizador / Emocional'
          ? '📢 [IA OTIMIZADA - TOM ENGAJADO]\n\n'
          : '✨ [IA OTIMIZADA - TOM INSTITUCIONAL]\n\n';
        
        setGeneratedText(prefix + text);
      }
    }, 1500);
  };

  const selectedItem = pautas.find(p => p.uniqueId === selectedId);
  const selectedTitle = selectedItem?.title || '';

  return (
    <div className="p-8 space-y-8 animate-in fade-in max-w-6xl flex-1 flex flex-col min-h-0">
      <header className="shrink-0">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ImageIcon className="w-8 h-8 text-primary" />
          Media Room
        </h1>
        <p className="text-zinc-400 mt-2">Gere postagens para redes sociais e comunicados de imprensa baseados nas pautas do gabinete.</p>
      </header>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0 items-start">
        
        {/* Lado Esquerdo: Configurações e Seleção (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Seleção do Ponto de Pauta */}
          <div className="glass-panel p-6 rounded-2xl border border-border">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">1. Escolha a Pauta / Destaque</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {pautas.map((hl) => (
                <div 
                  key={hl.uniqueId}
                  onClick={() => {
                    setSelectedId(hl.uniqueId);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedId === hl.uniqueId 
                    ? 'bg-primary/10 border-primary text-primary' 
                    : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      hl.displayType === 'Dossiê' 
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                      : 'bg-primary/10 text-primary border border-primary/20'
                    }`}>
                      {hl.displayType}
                    </span>
                    <span className="text-[10px] text-zinc-500">{hl.category}</span>
                  </div>
                  <p className="font-semibold text-xs text-foreground leading-snug line-clamp-2">{hl.title}</p>
                  <p className="text-[10px] text-zinc-500 mt-1.5 line-clamp-1">{hl.summary || hl.description}</p>
                </div>
              ))}
              {pautas.length === 0 && (
                <div className="text-center py-6 text-zinc-500 text-xs">
                  Nenhuma pauta ou notícia de alta relevância disponível.
                </div>
              )}
            </div>
          </div>

          {/* Opções de Tom e Geração */}
          <div className="glass-panel p-6 rounded-2xl border border-border space-y-4">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">2. Parâmetros de Linguagem</h3>
            
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Tom de Voz</label>
              <select 
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-xs text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
              >
                <option>Informativo e Institucional</option>
                <option>Combativo / Firme</option>
                <option>Agradecimento / Parceria</option>
                <option>Mobilizador / Emocional</option>
              </select>
            </div>

            <button
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Otimizando Rascunho...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Gerar Rascunho com IA
                </>
              )}
            </button>
          </div>

        </div>

        {/* Lado Direito: Preview e Canais (7 cols) */}
        <div className="lg:col-span-7 glass-panel border border-border rounded-2xl p-6 flex flex-col h-full min-h-[480px]">
          
          {/* Seletor de Canal */}
          <div className="flex border-b border-border pb-4 gap-2 overflow-x-auto">
            <button
              onClick={() => { setActiveChannel('instagram'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                activeChannel === 'instagram' 
                ? 'bg-zinc-800 text-foreground border border-border' 
                : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <InstagramIcon className="w-4 h-4 text-pink-500" />
              Instagram
            </button>
            <button
              onClick={() => { setActiveChannel('twitter'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                activeChannel === 'twitter' 
                ? 'bg-zinc-800 text-foreground border border-border' 
                : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <TwitterIcon className="w-4 h-4 text-sky-400" />
              Twitter
            </button>
            <button
              onClick={() => { setActiveChannel('whatsapp'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                activeChannel === 'whatsapp' 
                ? 'bg-zinc-800 text-foreground border border-border' 
                : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              WhatsApp
            </button>
            <button
              onClick={() => { setActiveChannel('press_release'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                activeChannel === 'press_release' 
                ? 'bg-zinc-800 text-foreground border border-border' 
                : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <FileText className="w-4 h-4 text-amber-500" />
              Press Release
            </button>
          </div>

          {/* Area do Texto e Visualização Mockada */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 min-h-0">
            
            {/* Editor de Texto (7 cols) */}
            <div className="md:col-span-7 flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500 font-semibold uppercase">Texto Gerado</span>
                <div className="flex gap-2">
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>
              
              <textarea
                value={generatedText}
                onChange={(e) => setGeneratedText(e.target.value)}
                className="w-full flex-1 bg-zinc-900/40 border border-zinc-700 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-sans resize-none min-h-[220px]"
              ></textarea>
            </div>

            {/* Visualização Visual (5 cols) */}
            <div className="md:col-span-5 flex flex-col justify-center items-center bg-zinc-900/20 border border-border/80 rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-primary/5 blur-[50px] rounded-full pointer-events-none"></div>
              
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-3 block self-start">Pré-visualização</span>

              {activeChannel === 'instagram' && (
                <div className="w-full max-w-[240px] bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex flex-col text-xs text-foreground animate-in zoom-in-95 duration-200">
                  <div className="p-2 flex items-center gap-2 border-b border-zinc-900">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">AS</div>
                    <div>
                      <p className="font-semibold leading-none">assessor_gab</p>
                      <p className="text-[8px] text-zinc-500">Publicado agora</p>
                    </div>
                  </div>
                  {/* Card Image simulation */}
                  <div className="aspect-square bg-gradient-to-tr from-indigo-900 via-primary/50 to-emerald-950 flex flex-col items-center justify-center p-4 text-center border-b border-zinc-900">
                    <ImageIcon className="w-6 h-6 text-white/50 mb-2" />
                    <p className="font-bold text-[11px] text-white leading-snug line-clamp-3 px-2">
                      {selectedTitle || 'Gabinete Ativo'}
                    </p>
                    <span className="text-[8px] mt-4 px-2 py-0.5 rounded-full bg-black/40 text-primary-foreground border border-white/10">Gabinete Inteligente</span>
                  </div>
                  <div className="p-3 space-y-1">
                    <p className="font-semibold">assessor_gab</p>
                    <p className="text-[10px] text-zinc-400 line-clamp-3 leading-relaxed">
                      {generatedText || 'Seu texto gerado aparecerá aqui...'}
                    </p>
                  </div>
                </div>
              )}

              {activeChannel === 'twitter' && (
                <div className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 shadow-2xl space-y-3 text-xs animate-in zoom-in-95 duration-200">
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">AS</div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-foreground">Assessor Gabinete</span>
                        <span className="text-zinc-500">@gab_assessoria</span>
                      </div>
                      <p className="text-zinc-300 mt-1 leading-relaxed break-words">
                        {generatedText || 'O tweet aparecerá formatado neste card...'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-zinc-500 border-t border-zinc-900 pt-2 text-[10px]">
                    <span>💬 0</span>
                    <span>🔁 0</span>
                    <span>❤️ 1</span>
                    <span>🔗</span>
                  </div>
                </div>
              )}

              {activeChannel === 'whatsapp' && (
                <div className="w-full max-w-[260px] bg-[#0b141a] border border-[#222d34] rounded-2xl p-3 shadow-2xl flex flex-col text-xs animate-in zoom-in-95 duration-200">
                  <div className="bg-[#202c33] text-foreground p-2 rounded-lg self-start max-w-[90%] relative shadow">
                    <div className="whitespace-pre-wrap leading-relaxed text-[11px]">
                      {generatedText || 'Rascunho de WhatsApp...'}
                    </div>
                    <span className="text-[8px] text-zinc-400 text-right block mt-1">10:48</span>
                  </div>
                </div>
              )}

              {activeChannel === 'press_release' && (
                <div className="w-full bg-white text-zinc-800 p-4 rounded-xl shadow-2xl flex flex-col gap-2 font-serif text-[10px] leading-relaxed border border-zinc-300 max-h-[220px] overflow-y-auto animate-in zoom-in-95 duration-200">
                  <div className="text-center font-sans font-bold text-zinc-900 border-b pb-2 mb-1">
                    PRESS RELEASE
                  </div>
                  <div className="whitespace-pre-wrap">
                    {generatedText || 'Minuta da nota de imprensa oficial...'}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
