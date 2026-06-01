'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Newspaper, Search, RefreshCw, BookOpen, FolderPlus,
  Trash2, CheckCircle2, AlertTriangle, Clock, Filter,
  Zap, Tag, Calendar, X, ChevronRight, Bell, Archive
} from 'lucide-react';
import { store } from '@/lib/store';
import { showToast } from '@/components/admin/Toast';

const TYPE_CONFIG: Record<string, { color: string; bg: string; ring: string }> = {
  'Nomeação':  { color: 'text-blue-400',    bg: 'bg-blue-400/10',    ring: 'ring-blue-400/30' },
  'Decreto':   { color: 'text-red-400',     bg: 'bg-red-400/10',     ring: 'ring-red-400/30'  },
  'Licitação': { color: 'text-amber-400',   bg: 'bg-amber-400/10',   ring: 'ring-amber-400/30'},
  'Contrato':  { color: 'text-purple-400',  bg: 'bg-purple-400/10',  ring: 'ring-purple-400/30'},
  'Portaria':  { color: 'text-emerald-400', bg: 'bg-emerald-400/10', ring: 'ring-emerald-400/30'},
};

const RELEVANCE_LABEL = (r: number) =>
  r >= 90 ? { label: 'Crítico', color: 'text-red-400', bg: 'bg-red-400/10' }
  : r >= 75 ? { label: 'Alto',   color: 'text-amber-400', bg: 'bg-amber-400/10' }
  : { label: 'Médio', color: 'text-emerald-400', bg: 'bg-emerald-400/10' };

export default function DiarioOficialPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('Todos');
  const [filterRead, setFilterRead] = useState<'todos' | 'lidos' | 'nao-lidos'>('todos');
  const [isScanning, setIsScanning] = useState(false);
  const [scanLogs, setScanLogs] = useState<string[]>([
    '✅ [31/05] Edição Nº 5.412 importada — 8 entradas processadas.',
    '📄 [30/05] Edição Nº 5.411 importada — 12 entradas processadas.',
    '📄 [29/05] Edição Nº 5.410 importada — 6 entradas processadas.',
  ]);

  const load = useCallback(() => {
    setEntries(store.getDiario());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const unread = entries.filter(e => !e.read).length;
  const types = ['Todos', 'Nomeação', 'Decreto', 'Licitação', 'Contrato', 'Portaria'];

  const filtered = entries.filter(e => {
    const matchSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      e.entities?.some((en: string) => en.toLowerCase().includes(search.toLowerCase()));
    const matchType = filterType === 'Todos' || e.type === filterType;
    const matchRead =
      filterRead === 'todos' ? true
      : filterRead === 'lidos' ? e.read
      : !e.read;
    return matchSearch && matchType && matchRead;
  });

  const handleSelect = (entry: any) => {
    setSelected(entry);
    if (!entry.read) {
      store.markDiarioRead(entry.id);
      load();
    }
  };

  const handleSaveToDossier = (entry: any) => {
    store.markDiarioSavedToDossier(entry.id);
    store.addDossier({
      title: `[D.O.] ${entry.title}`,
      category: entry.type === 'Nomeação' || entry.type === 'Portaria' ? 'Saúde'
        : entry.type === 'Decreto' ? 'Mobilidade' : 'Zoneamento',
      status: entry.relevance >= 90 ? 'Crítico' : 'Em Andamento',
      summary: entry.excerpt,
      description: `Entrada importada automaticamente do Diário Oficial.\n\nEdição: ${entry.edition}\nData: ${entry.date}\nTipo: ${entry.type}\n\nEntidades mencionadas: ${entry.entities?.join(', ')}\n\nPalavras-chave: ${entry.keywords?.join(', ')}`,
    });
    load();
    const updated = store.getDiario().find((d: any) => d.id === entry.id);
    setSelected(updated || null);
    showToast(`Entrada enviada para Dossiês com sucesso!`, 'success');
  };

  const handleDelete = (entry: any) => {
    if (confirm(`Remover "${entry.title}" do monitoramento?`)) {
      store.deleteDiarioEntry(entry.id);
      load();
      if (selected?.id === entry.id) setSelected(null);
      showToast('Entrada removida.', 'info');
    }
  };

  const handleScan = () => {
    setIsScanning(true);
    const ts = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setScanLogs(prev => [
      `🔄 [${ts}] Iniciando varredura no portal do Diário Oficial de Manaus...`,
      ...prev
    ]);
    setTimeout(() => {
      const newEntry = {
        type: 'Decreto',
        title: `Decreto Nº ${4832 + Math.floor(Math.random()*10)} — Regulamentação Emergencial`,
        excerpt: 'Regulamenta medidas emergenciais para apoio às famílias atingidas pelas enchentes na Zona Norte, incluindo repasse de recursos habitacionais da Secretaria de Assistência Social.',
        relevance: Math.floor(Math.random() * 20) + 80,
        entities: ['Secretaria de Assistência Social', 'Zona Norte'],
        keywords: ['decreto', 'emergência', 'habitação'],
        edition: 'Edição Nº 5.413 (Escaneada)',
        date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
      };
      store.addDiarioEntry(newEntry);
      load();
      setIsScanning(false);
      const ts2 = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setScanLogs(prev => [
        `✅ [${ts2}] Nova edição detectada! 1 entrada de alta relevância importada.`,
        ...prev.slice(0, 9)
      ]);
      showToast('Nova entrada do Diário Oficial importada!', 'success');
    }, 2800);
  };

  return (
    <div className="p-8 space-y-6 animate-in fade-in flex-1 flex flex-col min-h-0 relative">

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Newspaper className="w-8 h-8 text-primary" />
            Diário Oficial
            {unread > 0 && (
              <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full bg-accent text-accent-foreground animate-pulse">
                {unread}
              </span>
            )}
          </h1>
          <p className="text-zinc-400 mt-1.5 text-sm">
            Monitoramento automático de nomeações, decretos, contratos e portarias do município de Manaus.
          </p>
        </div>

        <button
          onClick={handleScan}
          disabled={isScanning}
          className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2.5 rounded-lg transition-colors font-medium shrink-0 shadow-lg shadow-accent/10 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'Escaneando...' : 'Escanear Agora'}
        </button>
      </header>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        {[
          { label: 'Total de Entradas', value: entries.length, icon: Newspaper, color: 'text-primary' },
          { label: 'Não Lidas', value: unread, icon: Bell, color: 'text-amber-400' },
          { label: 'Salvas em Dossiê', value: entries.filter(e => e.savedToDossier).length, icon: FolderPlus, color: 'text-emerald-400' },
          { label: 'Relevância Crítica', value: entries.filter(e => e.relevance >= 90).length, icon: AlertTriangle, color: 'text-red-400' },
        ].map(m => (
          <div key={m.label} className="glass-panel border border-border rounded-xl p-4 flex items-center gap-3">
            <m.icon className={`w-6 h-6 ${m.color} shrink-0`} />
            <div>
              <p className="text-xl font-bold text-foreground">{m.value}</p>
              <p className="text-[11px] text-zinc-500 leading-tight">{m.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center bg-card/30 border border-border p-4 rounded-xl shrink-0 gap-y-3">
        {/* Search */}
        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por título, entidade..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
          />
        </div>

        {/* Type Filter */}
        <div className="flex gap-1.5 flex-wrap">
          {types.map(t => {
            const cfg = TYPE_CONFIG[t];
            return (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors shrink-0 ${
                  filterType === t
                    ? cfg
                      ? `${cfg.bg} ${cfg.color} ring-1 ${cfg.ring} border-transparent`
                      : 'bg-primary/20 border-primary text-primary'
                    : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-foreground'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Read filter */}
        <div className="flex gap-1.5 ml-auto shrink-0">
          {(['todos', 'nao-lidos', 'lidos'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilterRead(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                filterRead === f
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-foreground'
              }`}
            >
              {f === 'todos' ? 'Todos' : f === 'nao-lidos' ? 'Não Lidos' : 'Lidos'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-y-auto">

        {/* Entry List */}
        <div className={`space-y-3 lg:col-span-2 ${selected ? 'hidden lg:block' : ''}`}>
          {filtered.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border border-border">
              <Newspaper className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400">Nenhuma entrada encontrada para os filtros selecionados.</p>
            </div>
          ) : (
            filtered.map(entry => {
              const typeCfg = TYPE_CONFIG[entry.type] || TYPE_CONFIG['Portaria'];
              const rel = RELEVANCE_LABEL(entry.relevance);
              return (
                <div
                  key={entry.id}
                  onClick={() => handleSelect(entry)}
                  className={`glass-panel p-5 rounded-2xl border transition-all cursor-pointer group flex flex-col gap-3 relative overflow-hidden ${
                    selected?.id === entry.id
                      ? 'border-primary bg-primary/5 shadow-md shadow-primary/5'
                      : entry.read
                        ? 'border-border hover:border-zinc-700 opacity-70 hover:opacity-100'
                        : 'border-border hover:border-primary/40'
                  }`}
                >
                  {/* Unread indicator */}
                  {!entry.read && (
                    <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-accent animate-pulse" />
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${typeCfg.bg} ${typeCfg.color} ${typeCfg.ring}`}>
                      {entry.type}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${rel.bg} ${rel.color}`}>
                      <Zap className="w-2.5 h-2.5" />
                      {rel.label} ({entry.relevance}%)
                    </span>
                    {entry.savedToDossier && (
                      <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold bg-emerald-400/10 text-emerald-400">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Em Dossiê
                      </span>
                    )}
                  </div>

                  <h3 className={`text-sm font-semibold leading-snug transition-colors ${
                    entry.read ? 'text-zinc-400 group-hover:text-foreground' : 'text-foreground group-hover:text-primary'
                  }`}>
                    {entry.title}
                  </h3>

                  <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{entry.excerpt}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[10px] text-zinc-600">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {entry.date}</span>
                      <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {entry.edition}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(entry); }}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-zinc-600 hover:text-destructive transition-colors"
                        title="Remover entrada"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-1 space-y-4">
          {selected ? (
            <div className="glass-panel border border-border rounded-2xl p-6 flex flex-col gap-5 lg:sticky lg:top-8 animate-in slide-in-from-right duration-200">
              {/* Header */}
              <div className="flex justify-between items-start gap-3 pb-4 border-b border-border">
                <div className="flex-1">
                  {(() => {
                    const cfg = TYPE_CONFIG[selected.type] || TYPE_CONFIG['Portaria'];
                    return (
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset mb-2 ${cfg.bg} ${cfg.color} ${cfg.ring}`}>
                        {selected.type}
                      </span>
                    );
                  })()}
                  <h2 className="text-base font-bold text-foreground leading-snug">{selected.title}</h2>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-zinc-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {selected.date}</span>
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {selected.edition}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Relevance meter */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-zinc-500 font-medium">Relevância Política</span>
                  <span className={`font-bold ${RELEVANCE_LABEL(selected.relevance).color}`}>
                    {selected.relevance}% — {RELEVANCE_LABEL(selected.relevance).label}
                  </span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      selected.relevance >= 90 ? 'bg-red-400'
                      : selected.relevance >= 75 ? 'bg-amber-400'
                      : 'bg-emerald-400'
                    }`}
                    style={{ width: `${selected.relevance}%` }}
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Trecho do Diário</h4>
                <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/60 p-3.5 rounded-xl border border-border/50 italic">
                  "{selected.excerpt}"
                </p>
              </div>

              {/* Entities */}
              {selected.entities?.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Tag className="w-3 h-3 text-primary" /> Entidades Identificadas
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.entities.map((en: string, idx: number) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                        {en}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Keywords */}
              {selected.keywords?.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Palavras-chave</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.keywords.map((kw: string, idx: number) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t border-border flex flex-col gap-2">
                <button
                  onClick={() => handleSaveToDossier(selected)}
                  disabled={selected.savedToDossier}
                  className="w-full py-2.5 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {selected.savedToDossier
                    ? <><CheckCircle2 className="w-3.5 h-3.5" /> Já salvo no Dossiê</>
                    : <><FolderPlus className="w-3.5 h-3.5" /> Salvar como Dossiê</>
                  }
                </button>
                <button
                  onClick={() => handleDelete(selected)}
                  className="w-full py-2 bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remover Entrada
                </button>
              </div>
            </div>
          ) : (
            /* Scan Log Panel */
            <div className="glass-panel border border-border rounded-2xl p-5 flex flex-col gap-4 lg:sticky lg:top-8">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Log de Varredura Automática
              </h3>

              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {isScanning && (
                  <div className="flex items-center gap-2 text-[11px] text-primary font-medium animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Varrendo portal do D.O. de Manaus...
                  </div>
                )}
                {scanLogs.map((log, i) => (
                  <p key={i} className="text-[11px] text-zinc-400 font-mono leading-relaxed">{log}</p>
                ))}
              </div>

              <div className="pt-3 border-t border-border space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Próxima varredura automática</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                    Hoje às 23:00
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Fonte monitorada</span>
                  <span className="text-zinc-300 font-medium">dom.manaus.am.gov.br</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Frequência</span>
                  <span className="text-zinc-300 font-medium">Diária (automática)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
