'use client';

import { useState, useEffect } from 'react';
import { 
  Globe, Plus, Search, Trash2, ExternalLink, Activity, 
  X, HelpCircle, CheckCircle2, Clock, Upload, Download, AlertTriangle,
  Edit3, Settings, PlayCircle
} from 'lucide-react';
import { store } from '@/lib/store';
import { showToast } from '@/components/admin/Toast';


export default function FontesPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // New Source Form States (Individual)
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState('Portal');
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  // Edit Source States
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editCategory, setEditCategory] = useState('Portal');
  const [editStatus, setEditStatus] = useState('ativo');
  const [editFrequency, setEditFrequency] = useState('1h');
  const [editPriority, setEditPriority] = useState(3);
  const [editDuplicateError, setEditDuplicateError] = useState<string | null>(null);

  // CSV Import States
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importSummary, setImportSummary] = useState<{
    total: number;
    valid: any[];
    duplicatesCount: number;
  } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Setup Rápido States
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [scraperUA, setScraperUA] = useState('GabineteBot/2.0 (Scraper)');
  const [scraperDelay, setScraperDelay] = useState('1s');

  // Coleta 24/7 States
  const [isColetaOpen, setIsColetaOpen] = useState(false);
  const [isCrawlingNow, setIsCrawlingNow] = useState(false);
  const [crawlerLogs, setCrawlerLogs] = useState<string[]>([
    "🤖 [12:00] Bot Iniciado: Verificando novas postagens...",
    "📄 [12:01] Portal da CMM: Conexão ok. 1 matéria indexada.",
    "📄 [12:05] A Crítica: Conexão ok. Sem novas publicações.",
    "✅ [12:10] Coleta concluída. Total de matérias na base: 3."
  ]);

  // Helper: load sources deduped by id and persist the clean list back
  const loadSources = () => {
    const raw: any[] = store.get('sources') || [];
    const seen = new Set<number>();
    const deduped = raw.filter((s: any) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
    // Persist clean list if duplicates were found
    if (deduped.length !== raw.length) {
      store.data = { ...store.data, sources: deduped };
      // @ts-ignore — access private save via bracket notation
      store['save']('sources');
    }
    setSources(deduped);
  };

  useEffect(() => {
    loadSources();
    if (typeof window !== 'undefined') {
      const savedUA = localStorage.getItem('gi_scraper_ua');
      if (savedUA) setScraperUA(savedUA);
      const savedDelay = localStorage.getItem('gi_scraper_delay');
      if (savedDelay) setScraperDelay(savedDelay);
    }
  }, []);

  const handleCreateSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newUrl) return;

    // Normalize URL
    const normalizedUrl = newUrl.toLowerCase().trim().replace(/\/$/, '');

    // Check duplication
    const isDuplicate = sources.some((s: any) => 
      s.url.toLowerCase().trim().replace(/\/$/, '') === normalizedUrl
    );

    if (isDuplicate) {
      setDuplicateError('Erro: Esta URL já está cadastrada em outra fonte.');
      return;
    }

    setDuplicateError(null);
    store.addSource({
      name: newName,
      url: newUrl,
      category: newCategory
    });

    setSources(store.get('sources'));
    setIsNewOpen(false);
    showToast(`Fonte '${newName}' adicionada com sucesso!`, 'success');
    setNewName('');
    setNewUrl('');
  };

  const handleStartEdit = (source: any) => {
    setEditingSource(source);
    setEditName(source.name);
    setEditUrl(source.url);
    setEditCategory(source.category);
    setEditStatus(source.status || 'ativo');
    setEditFrequency(source.botFrequency || '1h');
    setEditPriority(source.priority || 3);
    setEditDuplicateError(null);
    setIsEditOpen(true);
  };

  const handleUpdateSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSource || !editName || !editUrl) return;

    const normalizedUrl = editUrl.toLowerCase().trim().replace(/\/$/, '');

    // Check duplication (excluding itself)
    const isDuplicate = sources.some((s: any) => 
      s.id !== editingSource.id && 
      s.url.toLowerCase().trim().replace(/\/$/, '') === normalizedUrl
    );

    if (isDuplicate) {
      setEditDuplicateError('Erro: Esta URL já está cadastrada em outra fonte.');
      return;
    }

    setEditDuplicateError(null);
    store.updateSource(editingSource.id, {
      name: editName,
      url: editUrl,
      category: editCategory,
      status: editStatus,
      botFrequency: editFrequency,
      priority: editPriority
    });

    setSources(store.get('sources'));
    setIsEditOpen(false);
    showToast(`Fonte '${editName}' atualizada com sucesso!`, 'success');
    setEditingSource(null);
  };

  // Download template CSV file
  const handleDownloadTemplate = () => {
    const csvContent = "\ufeffNome do Portal / Veículo,URL Principal / RSS Feed,Categoria\nPortal Exemplo,https://portalexemplo.com.br,Portal\nJornal Diário,https://jornaldiario.com.br/politica,Jornal\nBlog do Bairro,https://blogdobairro.com,Blog";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'modelo_importacao_fontes.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle CSV file selection and parsing
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/);
      if (lines.length <= 1) {
        alert('O arquivo selecionado está vazio ou não possui registros.');
        return;
      }

      let duplicatesCount = 0;
      const validRows: any[] = [];
      const existingUrls = new Set(sources.map((s: any) => s.url.toLowerCase().trim().replace(/\/$/, '')));
      const batchUrls = new Set<string>();

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Split by comma or semicolon
        const cols = line.split(/[;,]/).map(col => col.replace(/^["']|["']$/g, '').trim());
        if (cols.length < 2) continue;

        const name = cols[0];
        const url = cols[1];
        const category = cols[2] || 'Portal';

        if (!name || !url) continue;

        const normalizedUrl = url.toLowerCase().trim().replace(/\/$/, '');

        if (existingUrls.has(normalizedUrl) || batchUrls.has(normalizedUrl)) {
          duplicatesCount++;
        } else {
          batchUrls.add(normalizedUrl);
          validRows.push({ name, url, category });
        }
      }

      setImportSummary({
        total: lines.length - 1,
        valid: validRows,
        duplicatesCount: duplicatesCount
      });
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleConfirmImport = () => {
    if (!importSummary || importSummary.valid.length === 0) return;

    setIsImporting(true);
    setTimeout(() => {
      const baseTimestamp = Date.now();
      importSummary.valid.forEach((src, index) => {
        // Add unique offset per item to avoid duplicate keys when multiple sources
        // are imported in the same millisecond
        store.addSource({ ...src, id: baseTimestamp + index });
      });

      setSources(store.get('sources'));
      setIsImporting(false);
      setIsImportOpen(false);
      setCsvFile(null);
      setImportSummary(null);
      
      showToast(`${importSummary.valid.length} fontes importadas com sucesso!`, 'success');
    }, 1500);
  };

  const handleDeleteSource = (id: number) => {
    if (confirm('Tem certeza de que deseja remover esta fonte do monitoramento?')) {
      store.deleteSource(id);
      setSources(store.get('sources'));
      showToast('Fonte removida do monitoramento.', 'info');
    }
  };

  const handleManualCrawl = () => {
    setIsCrawlingNow(true);
    const newLog = `🔄 [${new Date().toLocaleTimeString('pt-BR')}] Executando varredura manual de fontes...`;
    setCrawlerLogs(prev => [newLog, ...prev]);

    setTimeout(() => {
      setIsCrawlingNow(false);
      const successLog = `✅ [${new Date().toLocaleTimeString('pt-BR')}] Varredura concluída! Status de todas as fontes verificado como ativo.`;
      setCrawlerLogs(prev => [successLog, ...prev]);
    }, 2000);
  };

  const handleSaveScraperSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('gi_scraper_ua', scraperUA);
    localStorage.setItem('gi_scraper_delay', scraperDelay);
    showToast('Configurações globais salvas!', 'success');
    setIsSetupOpen(false);
  };

  const filteredSources = sources.filter((s: any) => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = sources.filter((s: any) => s.status === 'ativo').length;

  return (
    <div className="p-8 space-y-8 animate-in fade-in flex-1 overflow-y-auto">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Globe className="w-8 h-8 text-primary" />
            Fontes Monitoradas
          </h1>
          <p className="text-zinc-400 mt-2">Gerencie os portais, jornais e blogs lidos de hora em hora automaticamente pela nossa IA.</p>
        </div>
        
        <div className="flex gap-2">
          {/* Batch Import Button */}
          <button 
            onClick={() => setIsImportOpen(true)}
            className="flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 px-4 py-2.5 rounded-lg transition-colors font-medium shrink-0 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Importar Fontes
          </button>
          
          <button 
            onClick={() => {
              setDuplicateError(null);
              setIsNewOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2.5 rounded-lg transition-colors font-medium shrink-0 shadow-lg shadow-accent/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nova Fonte
          </button>
        </div>
      </header>

      {/* Bots Scraper Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-card/45 border border-border/80 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{activeCount}</p>
            <p className="text-sm text-zinc-400">Fontes Ativas e Saudáveis</p>
          </div>
        </div>

        {/* Card Coleta 24/7 (Interactive) */}
        <div 
          onClick={() => setIsColetaOpen(true)}
          className="bg-card/45 border border-border/80 hover:border-primary/50 hover:bg-zinc-900/40 rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all group"
        >
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0 group-hover:scale-105 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <p className="text-2xl font-bold text-foreground">Coleta 24/7</p>
              <span className="text-[9px] text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded font-bold uppercase">Ver Logs</span>
            </div>
            <p className="text-sm text-zinc-400">Bots rodando a cada 60min</p>
          </div>
        </div>

        {/* Card Setup Rápido (Interactive) */}
        <div 
          onClick={() => setIsSetupOpen(true)}
          className="bg-card/45 border border-border/80 hover:border-primary/50 hover:bg-zinc-900/40 rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all group"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <p className="text-2xl font-bold text-foreground">Setup Rápido</p>
              <span className="text-[9px] text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded font-bold uppercase">Configurar</span>
            </div>
            <p className="text-sm text-zinc-400">Sem reuniões ou contratos longos</p>
          </div>
        </div>
      </div>

      {/* Tabela de Fontes */}
      <div className="glass-panel rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-card/30">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Buscar fonte por nome ou URL..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-card/50 text-zinc-400 border-b border-border">
              <tr>
                <th className="px-6 py-3.5 font-medium">Nome / URL</th>
                <th className="px-6 py-3.5 font-medium">Categoria</th>
                <th className="px-6 py-3.5 font-medium">Frequência</th>
                <th className="px-6 py-3.5 font-medium">Status / Saúde</th>
                <th className="px-6 py-3.5 font-medium">Última Leitura</th>
                <th className="px-6 py-3.5 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSources.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-zinc-500">
                    Nenhuma fonte cadastrada encontrada.
                  </td>
                </tr>
              ) : (
                filteredSources.map((source) => (
                  <tr key={source.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{source.name}</div>
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-zinc-500 text-[10px] flex items-center gap-1 hover:text-primary transition-colors mt-0.5"
                      >
                        {source.url} <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300 ring-1 ring-inset ring-zinc-700">
                        {source.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {source.botFrequency || '1h'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${source.status === 'ativo' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                        <span className="capitalize text-zinc-300">{source.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {source.lastRead}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-1.5">
                      <button 
                        onClick={() => handleStartEdit(source)}
                        className="p-2 text-zinc-400 hover:text-primary bg-zinc-800/40 hover:bg-primary/10 rounded-md transition-all cursor-pointer" 
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteSource(source.id)}
                        className="p-2 text-zinc-400 hover:text-destructive bg-zinc-800/40 hover:bg-destructive/10 rounded-md transition-all cursor-pointer" 
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Nova Fonte (Individual) */}
      {isNewOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-border p-6 space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h3 className="text-lg font-bold text-gradient">Adicionar Nova Fonte</h3>
              <button 
                onClick={() => setIsNewOpen(false)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSource} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-zinc-300 block mb-1.5 uppercase">Nome do Portal / Veículo</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Portal Norte Notícias"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-300 block mb-1.5 uppercase">URL Principal / RSS Feed</label>
                <input 
                  type="url" 
                  required
                  placeholder="Ex: https://portalnorte.com.br/politica"
                  value={newUrl}
                  onChange={(e) => {
                    setNewUrl(e.target.value);
                    setDuplicateError(null);
                  }}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
                />
                
                {/* Duplicate Error Banner */}
                {duplicateError && (
                  <p className="mt-2 text-[10px] text-destructive font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {duplicateError}
                  </p>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-300 block mb-1.5 uppercase">Categoria</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-foreground focus:ring-1 focus:ring-primary/50 focus:outline-none"
                >
                  <option>Portal</option>
                  <option>Jornal</option>
                  <option>Blog</option>
                  <option>Câmara</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button 
                  type="button"
                  onClick={() => setIsNewOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-semibold transition-colors shadow-lg shadow-primary/10"
                >
                  Confirmar Fonte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Editar Fonte (Individual) */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-border p-6 space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h3 className="text-lg font-bold text-gradient">Editar Fonte</h3>
              <button 
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingSource(null);
                }}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateSource} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-zinc-300 block mb-1.5 uppercase">Nome do Portal / Veículo</label>
                <input 
                  type="text" 
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-300 block mb-1.5 uppercase">URL Principal / RSS Feed</label>
                <input 
                  type="url" 
                  required
                  value={editUrl}
                  onChange={(e) => {
                    setEditUrl(e.target.value);
                    setEditDuplicateError(null);
                  }}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
                />
                
                {editDuplicateError && (
                  <p className="mt-2 text-[10px] text-destructive font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {editDuplicateError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-300 block mb-1.5 uppercase">Categoria</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-foreground focus:ring-1 focus:ring-primary/50 focus:outline-none"
                  >
                    <option>Portal</option>
                    <option>Jornal</option>
                    <option>Blog</option>
                    <option>Câmara</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-300 block mb-1.5 uppercase">Status / Saúde</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-foreground focus:ring-1 focus:ring-primary/50 focus:outline-none"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="pausado">Pausado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-300 block mb-1.5 uppercase">Frequência</label>
                  <select
                    value={editFrequency}
                    onChange={(e) => setEditFrequency(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-foreground focus:ring-1 focus:ring-primary/50 focus:outline-none"
                  >
                    <option value="1h">A cada 1h</option>
                    <option value="2h">A cada 2h</option>
                    <option value="4h">A cada 4h</option>
                    <option value="12h">A cada 12h</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-300 block mb-1.5 uppercase">Prioridade</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-foreground focus:ring-1 focus:ring-primary/50 focus:outline-none"
                  >
                    <option value={5}>5 (Máxima)</option>
                    <option value={4}>4 (Alta)</option>
                    <option value={3}>3 (Normal)</option>
                    <option value={2}>2 (Baixa)</option>
                    <option value={1}>1 (Mínima)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button 
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingSource(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-semibold transition-colors shadow-lg shadow-primary/10"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Importar Fontes em Lote (CSV) */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-border p-6 space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h3 className="text-lg font-bold text-gradient flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Importar Lista de Fontes
              </h3>
              <button 
                onClick={() => {
                  setIsImportOpen(false);
                  setCsvFile(null);
                  setImportSummary(null);
                }}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-zinc-400 leading-normal">
                Suba uma lista de portais de notícias para monitoramento por lote. O arquivo deve ser um **CSV** com codificação UTF-8 respeitando o cabeçalho exato do modelo.
              </p>

              {/* Botão Baixar Modelo */}
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-foreground text-zinc-400 px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar Arquivo Modelo CSV
              </button>

              {/* File Uploader Drag/Drop styling */}
              <div className="border border-dashed border-zinc-700 rounded-xl p-6 text-center hover:border-primary/50 transition-colors relative bg-zinc-950/20">
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <span className="text-zinc-300 font-semibold block">
                  {csvFile ? csvFile.name : 'Selecionar arquivo CSV'}
                </span>
                <span className="text-[10px] text-zinc-500 mt-1 block">Clique para navegar em seu computador</span>
              </div>

              {/* Resumo da Validação do Lote */}
              {importSummary && (
                <div className="bg-zinc-900/40 p-4 rounded-xl border border-border space-y-3">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Relatório do Lote</span>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-zinc-950/30 p-2 rounded border border-border">
                      <span className="text-foreground font-black text-sm block">{importSummary.total}</span>
                      <span className="text-[9px] text-zinc-500 uppercase font-medium">Lidos no CSV</span>
                    </div>
                    <div className="bg-emerald-950/25 p-2 rounded border border-emerald-900/40">
                      <span className="text-emerald-500 font-black text-sm block">{importSummary.valid.length}</span>
                      <span className="text-[9px] text-emerald-600 uppercase font-medium">Válidos (Novos)</span>
                    </div>
                    <div className="bg-destructive/10 p-2 rounded border border-destructive/20">
                      <span className="text-destructive font-black text-sm block">{importSummary.duplicatesCount}</span>
                      <span className="text-[9px] text-destructive uppercase font-medium">Duplicados</span>
                    </div>
                  </div>

                  {importSummary.duplicatesCount > 0 && (
                    <p className="text-[9.5px] text-amber-500 font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      {importSummary.duplicatesCount} URLs repetidas foram ignoradas e serão desconsideradas no cadastro.
                    </p>
                  )}
                  
                  {importSummary.valid.length === 0 && (
                    <p className="text-[9.5px] text-destructive font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      Nenhum novo registro válido para importar no arquivo carregado.
                    </p>
                  )}
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button 
                  type="button"
                  onClick={() => {
                    setIsImportOpen(false);
                    setCsvFile(null);
                    setImportSummary(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleConfirmImport}
                  disabled={isImporting || !importSummary || importSummary.valid.length === 0}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-1.5 shadow ${
                    isImporting || !importSummary || importSummary.valid.length === 0
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                    : 'bg-accent hover:bg-accent/90 text-accent-foreground shadow-accent/10 cursor-pointer'
                  }`}
                >
                  {isImporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Importando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Confirmar Importação ({importSummary?.valid.length || 0})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Coleta 24/7 (Logs & Trigger) */}
      {isColetaOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-border p-6 space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h3 className="text-lg font-bold text-gradient flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                Monitoramento Ativo (Logs do Crawler)
              </h3>
              <button 
                onClick={() => setIsColetaOpen(false)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-zinc-400 leading-relaxed">
                Nossos robôs varrem continuamente as fontes cadastradas para capturar novas publicações relevantes para o mandato de **Rodrigo Sá**.
              </p>

              <div className="p-4 bg-zinc-900/60 border border-border rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Status Geral do Scraper</p>
                  <p className="text-emerald-500 font-bold mt-0.5 flex items-center gap-1.5 text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                    Ativo & Saudável
                  </p>
                </div>

                <button
                  onClick={handleManualCrawl}
                  disabled={isCrawlingNow}
                  className="flex items-center gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2 rounded-lg font-semibold transition-all shadow-md shadow-accent/10 cursor-pointer disabled:opacity-50"
                >
                  <PlayCircle className="w-4 h-4" />
                  {isCrawlingNow ? 'Buscando...' : 'Forçar Coleta Agora'}
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Terminal de Varredura</span>
                <div className="bg-zinc-950/80 border border-zinc-850 rounded-xl p-4 font-mono text-[10px] text-emerald-400 space-y-1.5 max-h-[160px] overflow-y-auto leading-relaxed">
                  {crawlerLogs.map((log, idx) => (
                    <div key={idx}>{log}</div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <button 
                  onClick={() => setIsColetaOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Fechar Painel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Setup Rápido (Global Settings) */}
      {isSetupOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-border p-6 space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h3 className="text-lg font-bold text-gradient flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Configurações Globais do Crawler (Setup Rápido)
              </h3>
              <button 
                onClick={() => setIsSetupOpen(false)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveScraperSettings} className="space-y-6 text-xs">
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Como funciona o Crawler:</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-900/35 border border-border p-3 rounded-lg">
                    <span className="font-bold text-primary block">1. Cadastro da URL</span>
                    <span className="text-[10.5px] text-zinc-400 mt-0.5 block leading-tight">Você insere a URL da notícia ou pauta que deseja monitorar.</span>
                  </div>
                  <div className="bg-zinc-900/35 border border-border p-3 rounded-lg">
                    <span className="font-bold text-primary block">2. Leitura & Parsing</span>
                    <span className="text-[10.5px] text-zinc-400 mt-0.5 block leading-tight">O robô acessa, limpa propagandas e extrai o texto bruto.</span>
                  </div>
                  <div className="bg-zinc-900/35 border border-border p-3 rounded-lg">
                    <span className="font-bold text-primary block">3. Análise IA</span>
                    <span className="text-[10.5px] text-zinc-400 mt-0.5 block leading-tight">A inteligência estima sentimento, relevância e pontos principais.</span>
                  </div>
                  <div className="bg-zinc-900/35 border border-border p-3 rounded-lg">
                    <span className="font-bold text-primary block">4. Feed de IA</span>
                    <span className="text-[10.5px] text-zinc-400 mt-0.5 block leading-tight">A matéria fica pronta no feed para busca e geração no Media Room.</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t border-border pt-4">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Parâmetros Globais de Scraping:</span>
                
                <div>
                  <label className="text-[10px] font-bold text-zinc-300 block mb-1.5 uppercase">User-Agent Identificador do Bot</label>
                  <input 
                    type="text" 
                    required
                    value={scraperUA}
                    onChange={(e) => setScraperUA(e.target.value)}
                    placeholder="Ex: GabineteBot/2.0 (+https://rodrigosa.com)"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-300 block mb-1.5 uppercase">Atraso entre requisições (Delay de Polidez)</label>
                  <select
                    value={scraperDelay}
                    onChange={(e) => setScraperDelay(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-foreground focus:ring-1 focus:ring-primary/50 focus:outline-none"
                  >
                    <option value="0.5s">0.5 segundos (Mais Rápido)</option>
                    <option value="1s">1.0 segundo (Recomendado)</option>
                    <option value="2s">2.0 segundos (Seguro)</option>
                    <option value="5s">5.0 segundos (Polido/Silencioso)</option>
                  </select>
                  <span className="text-[10px] text-zinc-500 mt-1 block">Ajusta o tempo de espera entre acessos para evitar bloqueio pelas fontes.</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button 
                  type="button"
                  onClick={() => setIsSetupOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-semibold transition-colors shadow-lg shadow-accent/10 cursor-pointer"
                >
                  Salvar Configuração
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
