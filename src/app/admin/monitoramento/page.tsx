'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, Search, Filter, Calendar, MapPin, User, 
  Clock, ThumbsUp, ThumbsDown, Eye, EyeOff, Copy, 
  Download, FileText, Share2, AlertCircle, MessageSquare, 
  Users, CheckCircle2, ChevronRight, X, ExternalLink, Activity
} from 'lucide-react';
import { store } from '@/lib/store';
import { showToast } from '@/components/admin/Toast';


export default function MonitoramentoPage() {
  const [newsList, setNewsList] = useState<any[]>([]);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSentiment, setSelectedSentiment] = useState('Todos');
  const [minRelevance, setMinRelevance] = useState(0);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [isBiasOpen, setIsBiasOpen] = useState(false);
  const [isSemanticOpen, setIsSemanticOpen] = useState(false);
  
  // Custom Comment Input State
  const [newCommentText, setNewCommentText] = useState('');

  // Quick URL Add State
  const [quickUrl, setQuickUrl] = useState('');
  const [quickUrlTitle, setQuickUrlTitle] = useState('');
  const [isUrlAdding, setIsUrlAdding] = useState(false);

  useEffect(() => {
    setNewsList(store.get('news') || []);
  }, []);

  const handleToggleRead = (id: number) => {
    store.toggleNewsRead(id);
    setNewsList(store.get('news'));
    if (selectedNews?.id === id) {
      setSelectedNews({ ...selectedNews, readStatus: !selectedNews.readStatus });
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText || !selectedNews) return;

    store.addCommentToNews(selectedNews.id, newCommentText);
    const updatedNews = store.get('news');
    setNewsList(updatedNews);
    
    // Update selected details panel too
    const current = updatedNews.find((n: any) => n.id === selectedNews.id);
    setSelectedNews(current);
    
    setNewCommentText('');
  };

  const handleAddQuickUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUrl) return;

    setIsUrlAdding(true);
    setTimeout(() => {
      const newArticle = {
        title: quickUrlTitle || 'Matéria importada via monitorador automático',
        url: quickUrl,
        source: quickUrl.includes('cmm') ? 'Portal da CMM' : 'A Crítica',
        category: 'Geral',
        sentiment: Math.random() > 0.5 ? 'Positivo' : 'Neutro',
        relevance: Math.floor(Math.random() * 30) + 70,
        impact: Math.random() > 0.4 ? 'Alto' : 'Médio',
        summary: `Monitoramento capturou e indexou a matéria a partir da URL ${quickUrl}. O conteúdo foi processado, livre de anúncios e resumido por Inteligência Artificial em tempo real.`,
        keyPoints: [
          'Matéria processada em tempo real pelo bot monitorador.',
          'Ausência completa de banners, anúncios ou pop-ups.',
          'Análise de sentimento efetuada automaticamente pelo motor de IA.',
          'Entidades e citações mapeadas.',
          'Pronto para compilação em relatórios.'
        ]
      };
      
      store.addNews(newArticle);
      setNewsList(store.get('news'));
      setIsUrlAdding(false);
      showToast('Nova matéria indexada com sucesso!', 'success');
      setQuickUrl('');
      setQuickUrlTitle('');
    }, 2000); // Simulate bot scrape
  };

  // Export handlers
  const handleExportCopy = (news: any) => {
    const text = `TITULO: ${news.title}\nFONTE: ${news.source} | DATA: ${news.date}\nSENTIMENTO: ${news.sentiment} | RELEVÂNCIA: ${news.relevance}/100\nIMPACTO: ${news.impact}\n\nRESUMO:\n${news.summary}\n\nPONTOS-CHAVE:\n${news.keyPoints.map((p: string) => `- ${p}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    showToast('Matéria copiada para a área de transferência!', 'success');
  };

  const handleExportFile = (news: any, format: 'txt' | 'md' | 'html') => {
    let content = '';
    let mimeType = 'text/plain';
    let filename = `noticia_${news.id}.${format}`;

    if (format === 'txt') {
      content = `MATÉRIA MONITORADA - GABINETE INTELIGENTE\n\n${news.title}\nFonte: ${news.source} (${news.url})\nData: ${news.date}\nSentimento: ${news.sentiment} | Relevância: ${news.relevance}/100 | Impacto: ${news.impact}\n\nResumo:\n${news.summary}\n\nPontos-Chave:\n${news.keyPoints.map((p: string) => `- ${p}`).join('\n')}`;
    } else if (format === 'md') {
      content = `# ${news.title}\n\n**Fonte:** [${news.source}](${news.url})\n**Data:** ${news.date}\n**Análise de IA:**\n- Sentimento: ${news.sentiment}\n- Relevância: ${news.relevance}/100\n- Impacto: ${news.impact}\n\n## Resumo\n${news.summary}\n\n## Pontos-Chave\n${news.keyPoints.map((p: string) => `- ${p}`).join('\n')}`;
      mimeType = 'text/markdown';
    } else if (format === 'html') {
      content = `<html><head><title>${news.title}</title><style>body { font-family: sans-serif; padding: 20px; line-height: 1.6; } h1 { color: #1e3a8a; } .meta { color: #555; font-size: 14px; margin-bottom: 20px; } .summary { background: #f3f4f6; padding: 15px; border-radius: 8px; }</style></head><body><h1>${news.title}</h1><div class="meta"><strong>Fonte:</strong> <a href="${news.url}">${news.source}</a><br><strong>Data:</strong> ${news.date}<br><strong>Sentimento:</strong> ${news.sentiment} | <strong>Relevância:</strong> ${news.relevance}/100 | <strong>Impacto:</strong> ${news.impact}</div><h2>Resumo</h2><p class="summary">${news.summary}</p><h2>Pontos-Chave</h2><ul>${news.keyPoints.map((p: string) => `<li>${p}</li>`).join('')}</ul></body></html>`;
      mimeType = 'text/html';
    }

    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Matéria salva como ${filename}!`, 'success');
  };

  const handleDownloadPdfReport = () => {
    // Generates a mock compiled PDF report file
    const content = `GABINETE INTELIGENTE - RELATÓRIO COMPILADO DE IMPRENSA\nGerado em: ${new Date().toLocaleDateString('pt-BR')}\n\n` + 
      newsList.map((n: any, idx: number) => `${idx + 1}. [${n.sentiment}] ${n.title}\nFonte: ${n.source} | Impacto: ${n.impact}\nResumo: ${n.summary}\n`).join('\n\n');
    
    const blob = new Blob([content], { type: 'application/pdf;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Relatorio_Impresa_${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Relatório de imprensa baixado em PDF!', 'success');
  };

  // Filter logic
  const filteredNews = newsList.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          n.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          n.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSentiment = selectedSentiment === 'Todos' || n.sentiment === selectedSentiment;
    const matchesRelevance = n.relevance >= minRelevance;
    const matchesUnread = !onlyUnread || !n.readStatus;

    return matchesSearch && matchesSentiment && matchesRelevance && matchesUnread;
  });

  return (
    <div className="p-8 space-y-8 animate-in fade-in flex-1 flex flex-col min-h-0 relative">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            Veja a IA em Ação (Feed)
          </h1>
          <p className="text-zinc-400 mt-2">Feed de amostra com notícias limpas de anúncios, análises automáticas e resumos semânticos.</p>
        </div>
        
        {/* Quick URL Monitor input */}
        <form onSubmit={handleAddQuickUrl} className="flex gap-2 bg-card/40 border border-border p-2 rounded-xl w-full md:max-w-md">
          <input
            type="url"
            required
            placeholder="Cole uma URL para iniciar o monitoramento..."
            value={quickUrl}
            onChange={(e) => setQuickUrl(e.target.value)}
            className="flex-1 bg-transparent text-xs p-2 text-foreground focus:outline-none placeholder-zinc-500"
          />
          <button 
            type="submit"
            disabled={isUrlAdding}
            className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0"
          >
            {isUrlAdding ? 'Buscando...' : 'Monitorar'}
          </button>
        </form>
      </header>

      {/* URL Meta title input helper if URL is typed */}
      {quickUrl && (
        <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg text-xs flex flex-col gap-2 shrink-0 animate-in slide-in-from-top-2">
          <p className="text-primary font-medium">Nome / Título da Matéria (Opcional):</p>
          <input 
            type="text" 
            placeholder="Digite o título ou deixe vazio para gerar automaticamente..."
            value={quickUrlTitle}
            onChange={(e) => setQuickUrlTitle(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 p-2 rounded text-xs text-foreground focus:outline-none"
          />
        </div>
      )}

      {/* Triagem / Filtros Inteligentes */}
      <div className="flex flex-col xl:flex-row gap-4 items-center justify-between bg-card/30 border border-border p-4 rounded-xl shrink-0 text-xs">
        
        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto items-center">
          {/* Busca */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Buscar por termo ou veículo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
            />
          </div>

          {/* Filtro Sentimento */}
          <div className="flex items-center gap-1 bg-zinc-900/60 border border-zinc-800 rounded-lg px-2 py-1 shrink-0">
            <span className="text-zinc-500">Sentimento:</span>
            <select
              value={selectedSentiment}
              onChange={(e) => setSelectedSentiment(e.target.value)}
              className="bg-transparent text-xs text-zinc-300 focus:outline-none"
            >
              <option value="Todos">Todos</option>
              <option value="Positivo">Positivos</option>
              <option value="Neutro">Neutros</option>
              <option value="Negativo">Negativos</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center w-full xl:w-auto justify-between xl:justify-end">
          {/* Filtro Relevância Gauge Slider */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Relevância Mínima:</span>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={minRelevance}
              onChange={(e) => setMinRelevance(Number(e.target.value))}
              className="accent-primary w-24 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            />
            <span className="font-bold text-foreground w-6 text-right">{minRelevance}</span>
          </div>

          {/* Filtro Lido / Não Lido */}
          <label className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 cursor-pointer">
            <input 
              type="checkbox"
              checked={onlyUnread}
              onChange={() => setOnlyUnread(!onlyUnread)}
              className="accent-primary"
            />
            Apenas Não Lidos
          </label>

          {/* PDF Compiler */}
          <button
            onClick={handleDownloadPdfReport}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Compilar PDF
          </button>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-y-auto">
        
        {/* Lista de Notícias */}
        <div className={`space-y-4 lg:col-span-2 ${selectedNews ? 'hidden lg:block' : ''}`}>
          {filteredNews.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border border-border">
              <AlertCircle className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400">Nenhuma matéria monitorada se enquadra nos filtros de triagem selecionados.</p>
            </div>
          ) : (
            filteredNews.map((news) => (
              <div
                key={news.id}
                onClick={() => setSelectedNews(news)}
                className={`glass-panel p-5 rounded-2xl border transition-all cursor-pointer group flex flex-col gap-4 relative overflow-hidden ${
                  selectedNews?.id === news.id 
                  ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' 
                  : 'border-border hover:border-zinc-700'
                } ${news.readStatus ? 'opacity-70' : ''}`}
              >
                {/* 100% Ad-Free Banner decoration */}
                <div className="absolute top-0 right-0 bg-primary/10 text-primary-foreground border-l border-b border-border/80 text-[8px] font-semibold uppercase px-2 py-0.5 pointer-events-none rounded-bl">
                  Sem Anúncios
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-[10px]">
                    <span className="font-semibold text-zinc-400">{news.source}</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-500">{news.date}</span>
                    
                    {/* Sentiment tag */}
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 font-bold ${
                      news.sentiment === 'Positivo' 
                      ? 'bg-emerald-500/10 text-emerald-500' 
                      : news.sentiment === 'Negativo'
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {news.sentiment}
                    </span>

                    {/* Impact Tag */}
                    <span className="text-zinc-500 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
                      Impacto {news.impact}
                    </span>

                    {/* Relevance Meter */}
                    <span className="font-semibold text-primary ml-auto">Relevância: {news.relevance}/100</span>
                  </div>

                  <h3 className="text-lg font-bold group-hover:text-primary transition-colors text-foreground">{news.title}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{news.summary}</p>
                </div>

                <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-1 text-[11px]" onClick={e => e.stopPropagation()}>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleToggleRead(news.id)}
                      className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
                      title={news.readStatus ? "Marcar como não lido" : "Marcar como lido"}
                    >
                      {news.readStatus ? <EyeOff className="w-3.5 h-3.5 text-zinc-500" /> : <Eye className="w-3.5 h-3.5" />}
                      {news.readStatus ? 'Lido' : 'Marcar lido'}
                    </button>
                    
                    {news.comments.length > 0 && (
                      <span className="flex items-center gap-1 text-primary">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {news.comments.length} coment.
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleExportCopy(news)} 
                      className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors"
                      title="Copiar Relato"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleExportFile(news, 'md')} 
                      className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors"
                      title="Baixar Markdown (.md)"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Painel Detalhado Lateral */}
        {selectedNews ? (
          <div className="lg:col-span-1 glass-panel border border-border rounded-2xl p-6 flex flex-col h-fit lg:sticky lg:top-8 animate-in slide-in-from-right duration-300">
            
            <div className="flex justify-between items-start gap-4 mb-4 pb-4 border-b border-border">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{selectedNews.source}</span>
                <h2 className="text-base font-bold text-foreground mt-1 leading-snug">{selectedNews.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedNews(null)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto max-h-[62vh] pr-1 text-xs">
              
              {/* Resumo da IA */}
              <div>
                <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Resumo da IA</h4>
                <p className="text-zinc-300 leading-relaxed bg-zinc-900/50 p-3.5 rounded-xl border border-border/50">
                  {selectedNews.summary}
                </p>
              </div>

              {/* 5 Destaques Principais */}
              <div>
                <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">5 Pontos-Chave</h4>
                <ul className="space-y-2">
                  {selectedNews.keyPoints.map((point: string, idx: number) => (
                    <li key={idx} className="flex gap-2 text-zinc-300">
                      <span className="text-primary font-bold">{idx + 1}.</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Entidades Extraídas */}
              {selectedNews.entities && selectedNews.entities.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Entidades Extraídas</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNews.entities.map((ent: any, idx: number) => (
                      <span key={idx} className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[10px] text-zinc-300 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        <strong>{ent.name}</strong> <span className="text-[8px] text-zinc-500">({ent.type})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Operações Adicionais: Viés e Links Semânticos */}
              <div className="grid grid-cols-2 gap-2 border-t border-border pt-4">
                <button
                  onClick={() => setIsBiasOpen(true)}
                  className="bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5" />
                  Raio-X de Viés
                </button>
                <button
                  onClick={() => setIsSemanticOpen(true)}
                  className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Links Semânticos
                </button>
              </div>

              {/* Modo Equipe: Comentários */}
              <div className="border-t border-border pt-4">
                <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <Users className="w-4 h-4 text-primary" />
                  Modo Equipe (Comentários)
                </h4>
                <div className="space-y-3 mb-3">
                  {selectedNews.comments && selectedNews.comments.length > 0 ? (
                    selectedNews.comments.map((comm: any, idx: number) => (
                      <div key={idx} className="bg-zinc-900/60 p-2.5 rounded-lg border border-border/30">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-foreground">{comm.author} <span className="text-[8px] text-zinc-500">({comm.role})</span></span>
                          <span className="text-[9px] text-zinc-500">{comm.date}</span>
                        </div>
                        <p className="text-zinc-300 text-[11px] leading-normal">{comm.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-zinc-500 italic text-[11px]">Nenhum comentário nesta notícia. Marque @colegas para debater.</p>
                  )}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Comente e marque @colega..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-foreground focus:outline-none"
                  />
                  <button type="submit" className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-3 py-1.5 rounded text-zinc-300 transition-colors">
                    Enviar
                  </button>
                </form>
              </div>

              {/* Botões de Exportação */}
              <div className="border-t border-border pt-4">
                <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Exportar Matéria</h4>
                <div className="flex flex-wrap gap-1.5">
                  <button 
                    onClick={() => handleExportFile(selectedNews, 'txt')}
                    className="flex-1 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] rounded font-medium text-zinc-400 hover:text-white transition-colors"
                  >
                    .TXT
                  </button>
                  <button 
                    onClick={() => handleExportFile(selectedNews, 'md')}
                    className="flex-1 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] rounded font-medium text-zinc-400 hover:text-white transition-colors"
                  >
                    .MD
                  </button>
                  <button 
                    onClick={() => handleExportFile(selectedNews, 'html')}
                    className="flex-1 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] rounded font-medium text-zinc-400 hover:text-white transition-colors"
                  >
                    .HTML
                  </button>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="hidden lg:flex lg:col-span-1 glass-panel border border-border border-dashed rounded-2xl p-6 items-center justify-center text-center h-[350px]">
            <div className="space-y-3">
              <Sparkles className="w-10 h-10 text-zinc-600 mx-auto" />
              <h4 className="font-semibold text-zinc-400">Nenhuma Notícia Selecionada</h4>
              <p className="text-xs text-zinc-500 max-w-[200px] mx-auto">Navegue pelas matérias monitoradas e clique em um item para ler as análises e pontos-chave.</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Raio-X de Viés (Bias Analyzer) */}
      {isBiasOpen && selectedNews?.biasAnalysis && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-2xl rounded-3xl border border-border p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="text-lg font-bold text-gradient flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Raio-X de Viés (Detector de Polarização)
              </h3>
              <button 
                onClick={() => setIsBiasOpen(false)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Nossa inteligência artificial analisa comparativamente como diferentes veículos cobriram o exato mesmo fato legislativo, evidenciando narrativas implícitas.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Outlet A */}
              <div className="bg-zinc-900/40 p-4 rounded-xl border border-border/80 space-y-2">
                <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded text-[9px] font-bold">
                  {selectedNews.biasAnalysis.sourceA}
                </span>
                <h4 className="text-sm font-bold text-foreground leading-snug">{selectedNews.biasAnalysis.headlineA}</h4>
                <div className="pt-2 text-xs text-zinc-400 border-t border-border/40">
                  <strong className="text-zinc-300 block mb-0.5">Narrativa analisada:</strong>
                  {selectedNews.biasAnalysis.slantA}
                </div>
              </div>

              {/* Outlet B */}
              <div className="bg-zinc-900/40 p-4 rounded-xl border border-border/80 space-y-2">
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded text-[9px] font-bold">
                  {selectedNews.biasAnalysis.sourceB}
                </span>
                <h4 className="text-sm font-bold text-foreground leading-snug">{selectedNews.biasAnalysis.headlineB}</h4>
                <div className="pt-2 text-xs text-zinc-400 border-t border-border/40">
                  <strong className="text-zinc-300 block mb-0.5">Narrativa analisada:</strong>
                  {selectedNews.biasAnalysis.slantB}
                </div>
              </div>
            </div>

            <div className="bg-primary/5 p-3 rounded-lg border border-primary/15 text-xs text-primary leading-relaxed text-center">
              💡 <strong>Conselho de RP:</strong> Recomenda-se publicar nota oficial no Media Room equilibrando a citação ecológica e minimizando o ruído de especulação imobiliária.
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setIsBiasOpen(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Fechar Análise
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Links Semânticos */}
      {isSemanticOpen && selectedNews && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-border p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="text-base font-bold text-gradient flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-primary" />
                Contexto Semântico de Cobertura
              </h3>
              <button 
                onClick={() => setIsSemanticOpen(false)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              A IA conectou semanticamente as seguintes matérias de portais distintos que abordam a mesma raiz temática, fornecendo um panorama integral.
            </p>

            <div className="space-y-3">
              {selectedNews.linkedArticles && selectedNews.linkedArticles.length > 0 ? (
                selectedNews.linkedArticles.map((art: string, idx: number) => (
                  <div key={idx} className="bg-zinc-900/50 p-3 rounded-lg border border-border text-xs flex justify-between items-center gap-3">
                    <div>
                      <p className="font-semibold text-zinc-200 line-clamp-1">{art}</p>
                      <span className="text-[10px] text-zinc-500 mt-1 block">Afinidade Semântica ~ 85%</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
                  </div>
                ))
              ) : (
                <p className="text-zinc-500 italic text-xs">Nenhuma matéria diretamente correlacionada no momento.</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setIsSemanticOpen(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Voltar ao Feed
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
