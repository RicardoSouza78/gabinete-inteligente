'use client';

import { useState, useEffect } from 'react';
import { 
  MessageSquareWarning, Search, Plus, Filter, MapPin, 
  User, Calendar, CheckCircle2, AlertCircle, Clock, X,
  Trash2, ChevronRight, Activity, TrendingUp
} from 'lucide-react';
import { store } from '@/lib/store';
import { showToast } from '@/components/admin/Toast';

export default function DemandasPage() {
  const [demands, setDemands] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [isNewDemandOpen, setIsNewDemandOpen] = useState(false);
  const [activeDetail, setActiveDetail] = useState<any>(null);

  // Form States
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCitizen, setNewCitizen] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newNeighborhood, setNewNeighborhood] = useState('São José');
  const [newPriority, setNewPriority] = useState('Média');

  useEffect(() => {
    setDemands(store.get('demands') || []);
  }, []);

  // Stats calculation
  const total = demands.length;
  const pending = demands.filter(d => d.status === 'Novo').length;
  const inAnalysis = demands.filter(d => d.status === 'Em Análise').length;
  const completed = demands.filter(d => d.status === 'Concluído').length;

  const handleCreateDemand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCitizen || !newDescription) return;

    store.addDemand({
      title: newTitle,
      description: newDescription,
      citizen: newCitizen,
      phone: newPhone || '(92) 99999-9999',
      neighborhood: newNeighborhood,
      priority: newPriority,
      status: 'Novo'
    });

    setDemands(store.get('demands'));
    setIsNewDemandOpen(false);
    showToast(`Demanda registrada com sucesso!`, 'success');

    // Reset Form
    setNewTitle('');
    setNewDescription('');
    setNewCitizen('');
    setNewPhone('');
  };


  const handleUpdateStatus = (id: number, newStat: string) => {
    store.updateDemandStatus(id, newStat);
    const updated = store.get('demands');
    setDemands(updated);
    if (activeDetail?.id === id) {
      setActiveDetail({ ...activeDetail, status: newStat });
    }
    showToast(`Status atualizado para ${newStat}!`, 'info');
  };


  const handleDeleteDemand = (id: number) => {
    if (confirm('Tem certeza de que deseja excluir esta demanda?')) {
      store.deleteDemand(id);
      setDemands(store.get('demands'));
      setActiveDetail(null);
      showToast('Demanda excluída com sucesso.', 'info');
    }
  };


  const filteredDemands = demands.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.citizen.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNeighborhood = selectedNeighborhood === 'Todos' || d.neighborhood === selectedNeighborhood;
    const matchesStatus = selectedStatus === 'Todos' || d.status === selectedStatus;
    
    return matchesSearch && matchesNeighborhood && matchesStatus;
  });

  const neighborhoods = ['Todos', 'São José', 'Jorge Teixeira', 'Zumbi', 'Coroado'];

  return (
    <div className="p-8 space-y-8 animate-in fade-in flex-1 flex flex-col min-h-0">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <MessageSquareWarning className="w-8 h-8 text-primary" />
            Demandas do Cidadão (CRM)
          </h1>
          <p className="text-zinc-400 mt-2">Triagem de solicitações, reclamações e cobranças comunitárias capturadas das redes e ruas.</p>
        </div>
        <button 
          onClick={() => setIsNewDemandOpen(true)}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg transition-colors font-medium shrink-0 shadow-lg shadow-primary/10"
        >
          <Plus className="w-4 h-4" />
          Registrar Demanda
        </button>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <div className="bg-card/40 border border-border rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{total}</p>
            <p className="text-xs text-zinc-500 font-medium">Total de Casos</p>
          </div>
        </div>
        <div className="bg-card/40 border border-border rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{pending}</p>
            <p className="text-xs text-zinc-500 font-medium">Não Iniciado (Novo)</p>
          </div>
        </div>
        <div className="bg-card/40 border border-border rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{inAnalysis}</p>
            <p className="text-xs text-zinc-500 font-medium">Em Andamento</p>
          </div>
        </div>
        <div className="bg-card/40 border border-border rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{completed}</p>
            <p className="text-xs text-zinc-500 font-medium">Solucionados</p>
          </div>
        </div>
      </div>

      {/* Busca e Filtros */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/30 border border-border p-4 rounded-xl shrink-0">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Buscar por descrição ou cidadão..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* Filtro Bairro */}
          <div className="flex items-center gap-1.5 bg-zinc-900/60 border border-zinc-800 rounded-lg px-2.5 py-1">
            <MapPin className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
              className="bg-transparent text-xs text-zinc-300 focus:outline-none"
            >
              {neighborhoods.map(n => <option key={n} value={n}>{n === 'Todos' ? 'Todos Bairros' : n}</option>)}
            </select>
          </div>

          {/* Filtro Status */}
          <div className="flex items-center gap-1.5 bg-zinc-900/60 border border-zinc-800 rounded-lg px-2.5 py-1">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-xs text-zinc-300 focus:outline-none"
            >
              <option value="Todos">Todos Status</option>
              <option value="Novo">Novo</option>
              <option value="Em Análise">Em Análise</option>
              <option value="Concluído">Concluído</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Principal: Listagem e Detalhes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-y-auto">
        
        {/* Tabela de Demandas */}
        <div className={`lg:col-span-2 overflow-x-auto glass-panel border border-border rounded-2xl ${activeDetail ? 'hidden lg:block' : ''}`}>
          <table className="w-full text-left text-sm">
            <thead className="bg-card/50 text-zinc-400 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Assunto / Cidadão</th>
                <th className="px-6 py-4 font-semibold">Bairro</th>
                <th className="px-6 py-4 font-semibold">Prioridade</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDemands.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    <MessageSquareWarning className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                    Nenhuma demanda registrada sob estes filtros.
                  </td>
                </tr>
              ) : (
                filteredDemands.map((demand) => (
                  <tr 
                    key={demand.id} 
                    onClick={() => setActiveDetail(demand)}
                    className={`hover:bg-white/[0.02] transition-colors cursor-pointer ${
                      activeDetail?.id === demand.id ? 'bg-primary/5' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground line-clamp-1">{demand.title}</div>
                      <div className="text-zinc-500 text-xs mt-0.5 flex items-center gap-1.5">
                        <User className="w-3 h-3" /> {demand.citizen}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-300">
                      <span className="flex items-center gap-1 text-xs">
                        <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                        {demand.neighborhood}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold ${
                        demand.priority === 'Alta' 
                        ? 'bg-destructive/10 text-destructive border border-destructive/20' 
                        : demand.priority === 'Média'
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}>
                        {demand.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={demand.status}
                        onChange={(e) => handleUpdateStatus(demand.id, e.target.value)}
                        className={`text-xs p-1.5 rounded-lg border bg-zinc-950 font-medium focus:outline-none ${
                          demand.status === 'Novo'
                          ? 'border-destructive/30 text-destructive'
                          : demand.status === 'Em Análise'
                          ? 'border-amber-500/30 text-amber-500'
                          : 'border-emerald-500/30 text-emerald-500'
                        }`}
                      >
                        <option value="Novo">Novo</option>
                        <option value="Em Análise">Em Análise</option>
                        <option value="Concluído">Concluído</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight className="w-4 h-4 text-zinc-600 ml-auto" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Card Lateral de Detalhes da Demanda */}
        {activeDetail ? (
          <div className="lg:col-span-1 glass-panel border border-border rounded-2xl p-6 flex flex-col h-fit lg:sticky lg:top-8 animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-start pb-4 border-b border-border">
              <div>
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                  activeDetail.priority === 'Alta' 
                  ? 'bg-destructive/10 text-destructive ring-destructive/30' 
                  : activeDetail.priority === 'Média'
                  ? 'bg-amber-500/10 text-amber-500 ring-amber-500/30'
                  : 'bg-zinc-800 text-zinc-400 ring-zinc-700'
                }`}>
                  Prioridade {activeDetail.priority}
                </span>
                <h3 className="text-lg font-bold text-foreground mt-2">{activeDetail.title}</h3>
              </div>
              <button 
                onClick={() => setActiveDetail(null)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6 mt-4">
              <div>
                <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Relato / Descrição</h4>
                <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/50 p-4 rounded-xl border border-border">
                  {activeDetail.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-zinc-900/30 p-3.5 rounded-xl border border-border/50 text-xs">
                <div>
                  <span className="text-zinc-500 block mb-0.5">Cidadão</span>
                  <span className="font-semibold text-foreground">{activeDetail.citizen}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Contato</span>
                  <span className="font-semibold text-zinc-300">{activeDetail.phone}</span>
                </div>
                <div className="mt-2">
                  <span className="text-zinc-500 block mb-0.5">Localização</span>
                  <span className="font-semibold text-zinc-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    {activeDetail.neighborhood}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-zinc-500 block mb-0.5">Registrado em</span>
                  <span className="font-semibold text-zinc-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    {activeDetail.date}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Alterar Status</h4>
                <div className="flex gap-2">
                  {['Novo', 'Em Análise', 'Concluído'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(activeDetail.id, st)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors border ${
                        activeDetail.status === st
                        ? st === 'Novo'
                          ? 'bg-destructive/10 border-destructive text-destructive'
                          : st === 'Em Análise'
                          ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                          : 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-between">
                <button
                  onClick={() => handleDeleteDemand(activeDetail.id)}
                  className="flex items-center justify-center gap-1.5 text-xs text-destructive hover:text-red-400 font-semibold transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir Demanda
                </button>
              </div>

            </div>
          </div>
        ) : (
          <div className="hidden lg:flex lg:col-span-1 glass-panel border border-border border-dashed rounded-2xl p-6 items-center justify-center text-center h-[350px]">
            <div className="space-y-3">
              <MessageSquareWarning className="w-10 h-10 text-zinc-600 mx-auto" />
              <h4 className="font-semibold text-zinc-400">Nenhuma Demanda Aberta</h4>
              <p className="text-xs text-zinc-500 max-w-[200px] mx-auto">Escolha um item da listagem à esquerda para ver a triagem e atualizar o status.</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal - Nova Demanda */}
      {isNewDemandOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-border p-6 space-y-6 overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h3 className="text-xl font-bold text-gradient">Registrar Nova Demanda</h3>
              <button 
                onClick={() => setIsNewDemandOpen(false)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDemand} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Assunto Principal</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Vazamento de água ou Falta de policiamento"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Nome do Solicitante (Cidadão)</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: João da Silva Santos"
                  value={newCitizen}
                  onChange={(e) => setNewCitizen(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Telefone de Contato</label>
                  <input 
                    type="text" 
                    placeholder="Ex: (92) 99111-2222"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Bairro</label>
                  <select 
                    value={newNeighborhood}
                    onChange={(e) => setNewNeighborhood(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/50 text-foreground"
                  >
                    <option>São José</option>
                    <option>Jorge Teixeira</option>
                    <option>Zumbi</option>
                    <option>Coroado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Urgência / Prioridade</label>
                <div className="flex gap-2">
                  {['Baixa', 'Média', 'Alta'].map((prio) => (
                    <button
                      key={prio}
                      type="button"
                      onClick={() => setNewPriority(prio)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                        newPriority === prio
                        ? prio === 'Alta'
                          ? 'bg-destructive/10 border-destructive text-destructive'
                          : prio === 'Média'
                          ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {prio}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Relato Completo da Demanda</label>
                <textarea 
                  required
                  placeholder="Detalhamento do problema, ruas afetadas, referências e prazos passados pelo cidadão..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground resize-none h-28"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button 
                  type="button"
                  onClick={() => setIsNewDemandOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-medium transition-colors shadow-lg shadow-primary/10"
                >
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
