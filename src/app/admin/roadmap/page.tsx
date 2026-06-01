'use client';

import { useState, useEffect } from 'react';
import { Compass, Vote, Plus, CheckCircle2, Clock, Eye, MessageSquare, AlertCircle, X } from 'lucide-react';
import { store } from '@/lib/store';
import { showToast } from '@/components/admin/Toast';


export default function RoadmapPage() {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState('Todos');
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  
  // Suggestion Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    setItems(store.get('roadmap') || []);
  }, []);

  const handleVote = (id: number) => {
    store.upvoteRoadmap(id);
    // Reload items
    const updated = store.get('roadmap') || [];
    // Sort by votes descending
    setItems(updated.sort((a: any, b: any) => b.votes - a.votes));
    showToast('Seu voto foi registrado com sucesso!', 'success');
  };


  const handleCreateSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    store.addRoadmapSuggestion(title, description);
    const updated = store.get('roadmap') || [];
    setItems(updated.sort((a: any, b: any) => b.votes - a.votes));
    
    setIsSuggestOpen(false);
    showToast('Funcionalidade sugerida com sucesso!', 'success');
    setTitle('');
    setDescription('');
  };


  const filteredItems = items
    .filter(item => filter === 'Todos' || item.status === filter)
    .sort((a, b) => b.votes - a.votes);

  const statuses = ['Todos', 'Ideia', 'Planejado', 'Em Desenvolvimento'];

  return (
    <div className="p-8 space-y-8 animate-in fade-in flex-1 flex flex-col min-h-0 max-w-4xl mx-auto w-full">
      
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Compass className="w-8 h-8 text-primary" />
            Roteiro Aberto (Roadmap)
          </h1>
          <p className="text-zinc-400 mt-2">Vote nas próximas funcionalidades e sugira novas ferramentas para moldar a plataforma.</p>
        </div>
        <button 
          onClick={() => setIsSuggestOpen(true)}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg transition-colors font-medium shrink-0 shadow-lg shadow-primary/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Sugerir Recurso
        </button>
      </header>

      {/* Filtros Status */}
      <div className="flex gap-2 border-b border-border pb-4 shrink-0 overflow-x-auto">
        {statuses.map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all shrink-0 cursor-pointer ${
              filter === st 
              ? 'bg-zinc-900 border-border text-foreground font-bold shadow' 
              : 'text-zinc-500 border-transparent hover:text-zinc-300'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Grid de Itens do Roteiro */}
      <div className="space-y-4 flex-1 overflow-y-auto pr-1">
        {filteredItems.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl border border-border">
            <AlertCircle className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">Nenhuma sugestão encontrada sob esta categoria no momento.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="glass-panel p-5 rounded-2xl border border-border hover:border-zinc-700 transition-all flex items-start gap-5"
            >
              
              {/* Box de Votação */}
              <button 
                onClick={() => handleVote(item.id)}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-primary/50 text-zinc-400 hover:text-primary transition-all duration-200 shrink-0 w-16 group cursor-pointer"
              >
                <span className="text-[10px] uppercase font-bold text-zinc-500 group-hover:text-primary tracking-wider mb-1">Votos</span>
                <span className="text-xl font-black text-foreground group-hover:text-primary leading-none">{item.votes}</span>
                <span className="text-[8px] mt-1 bg-zinc-850 px-1 py-0.5 rounded text-zinc-500 group-hover:text-primary group-hover:bg-primary/10 font-bold uppercase">+1</span>
              </button>

              {/* Informações da Feature */}
              <div className="flex-1 space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-bold uppercase ring-1 ring-inset ${
                    item.status === 'Em Desenvolvimento'
                    ? 'bg-primary/10 text-primary ring-primary/20'
                    : item.status === 'Planejado'
                    ? 'bg-amber-500/10 text-amber-500 ring-amber-500/20'
                    : 'bg-zinc-800 text-zinc-400 ring-zinc-700'
                  }`}>
                    {item.status === 'Em Desenvolvimento' && <Clock className="w-2.5 h-2.5 animate-spin" />}
                    {item.status === 'Planejado' && <CheckCircle2 className="w-2.5 h-2.5" />}
                    {item.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground leading-snug">{item.title}</h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{item.description}</p>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Modal - Nova Sugestão */}
      {isSuggestOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-border p-6 space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h3 className="text-lg font-bold text-gradient">Sugerir Nova Funcionalidade</h3>
              <button 
                onClick={() => setIsSuggestOpen(false)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSuggestion} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-zinc-300 block mb-1.5 uppercase">Nome da Funcionalidade</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Integração com feeds RSS ou Gerador de Dossiê Automático..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-300 block mb-1.5 uppercase">Explique o Recurso</label>
                <textarea 
                  required
                  placeholder="Detalhe o funcionamento prático, como isso ajuda o gabinete no dia a dia legislativo..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground resize-none h-24"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button 
                  type="button"
                  onClick={() => setIsSuggestOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-semibold transition-colors shadow-lg shadow-primary/10"
                >
                  Submeter e Votar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
