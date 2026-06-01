'use client';

import { useState, useEffect } from 'react';
import { 
  FolderTree, Search, Plus, Filter, Calendar, User, 
  FileText, Link as LinkIcon, Paperclip, ChevronRight, X, 
  AlertTriangle, CheckCircle2, Play, Users, Clock,
  Archive, Trash2, ArchiveRestore
} from 'lucide-react';
import { store } from '@/lib/store';
import { showToast } from '@/components/admin/Toast';

const MOCK_DOSSIERS = [
  {
    id: 1,
    title: 'PL 123/2026 - Zoneamento Urbano',
    category: 'Zoneamento',
    status: 'Crítico',
    date: '01 Jun 2026',
    author: 'Assessoria Legislativa',
    urgency: true,
    summary: 'Análise estratégica do Plano de Zoneamento Urbano com foco no adensamento populacional da Zona Leste e emendas propostas pela oposição.',
    description: 'Este projeto de lei visa redefinir o zoneamento comercial e residencial da Zona Leste. A oposição articula emendas para reduzir o percentual de áreas verdes exigidas em novos empreendimentos imobiliários, o que tem gerado atrito com movimentos ambientalistas e com a base do governo.',
    keyPoints: [
      'Redefinição dos eixos de adensamento da Av. das Torres.',
      'Emenda 04/2026 propõe redução de áreas de preservação permanente.',
      'Risco político elevado devido à mobilização popular agendada para quarta-feira.',
      'Necessidade de articulação direta com a Comissão de Urbanismo.'
    ],
    timeline: [
      { date: '28 Mai 2026', event: 'Protocolo das emendas modificativas da oposição' },
      { date: '20 Mai 2026', event: 'Aprovação em primeira discussão na CCJ' },
      { date: '15 Mai 2026', event: 'Leitura em plenário e abertura de prazo para emendas' }
    ],
    documents: [
      { name: 'PL_123_2026_Texto_Original.pdf', size: '2.4 MB' },
      { name: 'Analise_Impacto_Zona_Leste.pdf', size: '1.1 MB' },
      { name: 'Parecer_Comissao_Urbanismo.pdf', size: '890 KB' }
    ],
    stakeholders: [
      { name: 'Vereador Marcelo Silva', role: 'Relator na Comissão', stance: 'Favorável' },
      { name: 'Vereadora Sandra Lima', role: 'Líder da Oposição', stance: 'Contrário' },
      { name: 'Dr. Roberto Costa', role: 'Sec. de Planejamento Urbano', stance: 'Neutro' }
    ]
  },
  {
    id: 2,
    title: 'Reforma do Hospital Municipal Leste',
    category: 'Saúde',
    status: 'Em Andamento',
    date: '28 Mai 2026',
    author: 'Gabinete Técnico',
    urgency: false,
    summary: 'Dossiê técnico sobre a execução orçamentária, prazos contratuais e denúncias de paralisação nas obras de ampliação da ala infantil.',
    description: 'Relatório consolidado sobre as obras do Hospital Municipal Leste. Há indícios de lentidão no repasse da segunda parcela por parte do executivo, o que ameaça a data de entrega original prevista para julho.',
    keyPoints: [
      'Execução orçamentária atual em 42% do planejado.',
      'Atraso na contratação da empresa terceirizada de climatização.',
      'Vereador cobrou esclarecimentos oficiais via requerimento nº 405/2026.'
    ],
    timeline: [
      { date: '25 Mai 2026', event: 'Requerimento de informações enviado à Sec. de Saúde' },
      { date: '10 Mai 2026', event: 'Visita de fiscalização da assessoria in loco' }
    ],
    documents: [
      { name: 'Contrato_Licitatorio_HML.pdf', size: '5.6 MB' },
      { name: 'Cronograma_Fisico_Financeiro.xlsx', size: '1.2 MB' }
    ],
    stakeholders: [
      { name: 'Secretário Executivo de Saúde', role: 'Gestor da Pasta', stance: 'Neutro' },
      { name: 'Eng. Marcus Antunes', role: 'Fiscal da Obra', stance: 'Favorável' }
    ]
  },
  {
    id: 3,
    title: 'Plano de Transporte por Aplicativos',
    category: 'Mobilidade',
    status: 'Concluído',
    date: '15 Mai 2026',
    author: 'Comissão de Transporte',
    urgency: false,
    summary: 'Análise de impacto e texto final aprovado para regulamentação e taxação do transporte individual de passageiros por plataformas.',
    description: 'Estudo concluído sobre a regulamentação do transporte por aplicativos. O texto final buscou equilibrar a arrecadação municipal com as demandas dos motoristas de aplicativos por taxas menores.',
    keyPoints: [
      'Taxa de 1.5% sobre o valor das corridas destinada ao Fundo de Mobilidade.',
      'Isenção de taxas administrativas para motoristas locais no primeiro ano.',
      'Criação de cadastro municipal obrigatório.'
    ],
    timeline: [
      { date: '12 Mai 2026', event: 'Sanção do projeto pelo Prefeito' },
      { date: '05 Mai 2026', event: 'Aprovação final em plenário com 24 votos favoráveis' }
    ],
    documents: [
      { name: 'Redacao_Final_Regulamentacao.pdf', size: '1.8 MB' }
    ],
    stakeholders: [
      { name: 'Assoc. dos Motoristas de App', role: 'Representação Civil', stance: 'Favorável' },
      { name: 'Sindicato dos Taxistas', role: 'Representação Civil', stance: 'Contrário' }
    ]
  }
];

export default function DossiesPage() {
  const [dossiers, setDossiers] = useState<any[]>([]);
  const [selectedDossier, setSelectedDossier] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [isNewDossierOpen, setIsNewDossierOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  // New Dossier Form States
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Zoneamento');
  const [newStatus, setNewStatus] = useState('Em Andamento');
  const [newSummary, setNewSummary] = useState('');
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    setDossiers(store.get('dossiers') || []);
  }, []);

  const handleCreateDossier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newSummary) return;

    store.addDossier({
      title: newTitle,
      category: newCategory,
      status: newStatus,
      summary: newSummary,
      description: newDescription
    });

    setDossiers(store.get('dossiers'));
    setIsNewDossierOpen(false);
    
    // Clear fields
    setNewTitle('');
    setNewSummary('');
    setNewDescription('');
  };

  const handleDeleteDossier = (id: number, title: string) => {
    if (confirm(`Tem certeza de que deseja excluir permanentemente o dossiê "${title}"? Esta ação não pode ser desfeita.`)) {
      store.deleteDossier(id);
      setDossiers(store.get('dossiers'));
      setSelectedDossier(null);
      showToast(`Dossiê "${title}" excluído permanentemente.`, 'error');
    }
  };

  const handleArchiveDossier = (id: number, title: string, currentArchived: boolean) => {
    store.updateDossier(id, { archived: !currentArchived });
    const updated = store.get('dossiers');
    setDossiers(updated);
    // Keep the detail panel open with updated data
    const updatedDossier = updated.find((d: any) => d.id === id);
    setSelectedDossier(updatedDossier || null);
    if (!currentArchived) {
      showToast(`Dossiê "${title}" arquivado com sucesso.`, 'info');
    } else {
      showToast(`Dossiê "${title}" restaurado para ativo.`, 'success');
    }
  };

  const handleDownloadDocument = (e: React.MouseEvent, dossier: any, docName: string) => {
    e.preventDefault();
    
    const fileContent = `===========================================================
GABINETE INTELIGENTE - VEREADOR RODRIGO SÁ
DOCUMENTO COMPILADO: ${docName}
===========================================================

DOSSIÊ: ${dossier.title} (${dossier.category})
DATA DE CRIAÇÃO: ${dossier.date}
STATUS DO DOSSIÊ: ${dossier.status}
AUTOR: ${dossier.author}

-----------------------------------------------------------
RESUMO EXECUTIVO:
-----------------------------------------------------------
${dossier.summary}

-----------------------------------------------------------
DETALHAMENTO TÉCNICO:
-----------------------------------------------------------
${dossier.description || 'Nenhum detalhamento disponível.'}

-----------------------------------------------------------
DIRETRIZES ESTRATÉGICAS DO MANDATO:
-----------------------------------------------------------
${dossier.keyPoints.map((point: string, idx: number) => `${idx + 1}. ${point}`).join('\n')}

-----------------------------------------------------------
LINHA DO TEMPO DA PAUTA:
-----------------------------------------------------------
${dossier.timeline.map((item: any) => `- [${item.date}] ${item.event}`).join('\n')}

-----------------------------------------------------------
PARTES INTERESSADAS / STAKEHOLDERS:
-----------------------------------------------------------
${dossier.stakeholders.map((person: any) => `- ${person.name} (${person.role}): Stance: ${person.stance}`).join('\n')}

-----------------------------------------------------------
Documento compilado e exportado via Gabinete Inteligente 
Exportação efetuada em: ${new Date().toLocaleString('pt-BR')}
===========================================================`;

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Clean name to txt
    const cleanName = docName.replace(/\.[a-zA-Z0-9]+$/, '') + '_relatorio.txt';
    link.download = cleanName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Broadcast a custom storage event to alert the toast system if active
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gi_toast', { 
        detail: { message: `Download de '${cleanName}' iniciado com sucesso!`, type: 'success' } 
      }));
    }
  };

  const filteredDossiers = dossiers.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || d.category === selectedCategory;
    const matchesArchived = showArchived ? d.archived === true : !d.archived;
    return matchesSearch && matchesCategory && matchesArchived;
  });

  const archivedCount = dossiers.filter(d => d.archived).length;
  const categories = ['Todas', 'Zoneamento', 'Saúde', 'Mobilidade', 'Educação'];

  return (
    <div className="p-8 space-y-8 animate-in fade-in flex-1 flex flex-col min-h-0 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FolderTree className="w-8 h-8 text-primary" />
            Dossiês de Inteligência
          </h1>
          <p className="text-zinc-400 mt-2">Dossiês temáticos, monitoramento de leis e evidências para atuação política.</p>
        </div>
        <button 
          onClick={() => setIsNewDossierOpen(true)}
          className="flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2.5 rounded-lg transition-colors font-medium shrink-0 shadow-lg shadow-accent/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Novo Dossiê
        </button>
      </header>

      {/* Busca e Filtros */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/30 border border-border p-4 rounded-xl shrink-0">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Buscar por título ou palavra-chave..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors shrink-0 ${
                selectedCategory === cat 
                ? 'bg-primary/20 border-primary text-primary' 
                : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Archived toggle */}
        {archivedCount > 0 && (
          <button
            onClick={() => setShowArchived(v => !v)}
            className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors shrink-0 ${
              showArchived
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
              : 'bg-card/50 border-border text-zinc-400 hover:text-foreground'
            }`}
          >
            {showArchived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
            {showArchived ? 'Exibindo Arquivados' : `Arquivados (${archivedCount})`}
          </button>
        )}
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-y-auto">
        
        {/* Lista de Dossiês */}
        <div className={`space-y-4 lg:col-span-2 ${selectedDossier ? 'hidden lg:block' : ''}`}>
          {filteredDossiers.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border border-border">
              <FolderTree className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400">Nenhum dossiê encontrado para a seleção atual.</p>
            </div>
          ) : (
            filteredDossiers.map((d) => (
              <div 
                key={d.id}
                onClick={() => setSelectedDossier(d)}
                className={`glass-panel p-6 rounded-2xl border transition-all cursor-pointer group flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                  selectedDossier?.id === d.id 
                  ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' 
                  : 'border-border hover:border-zinc-700'
                }`}
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-300 ring-1 ring-inset ring-zinc-700">
                      {d.category}
                    </span>
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      d.status === 'Crítico' 
                      ? 'bg-destructive/10 text-destructive ring-destructive/30' 
                      : d.status === 'Em Andamento'
                      ? 'bg-amber-500/10 text-amber-500 ring-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-500 ring-emerald-500/30'
                    }`}>
                      {d.status}
                    </span>
                    {d.urgency && (
                      <span className="flex items-center gap-1 text-xs text-destructive font-semibold animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Pauta Crítica
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors text-foreground">{d.title}</h3>
                  <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">{d.summary}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-zinc-500 pt-2">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {d.date}</span>
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {d.author}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 self-end md:self-center shrink-0">
                  {/* Archive button on card */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleArchiveDossier(d.id, d.title, !!d.archived);
                    }}
                    title={d.archived ? 'Restaurar Dossiê' : 'Arquivar Dossiê'}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-amber-500/10 text-zinc-500 hover:text-amber-500 transition-all"
                  >
                    {d.archived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                  </button>
                  {/* Delete button on card */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDossier(d.id, d.title);
                    }}
                    title="Excluir Dossiê"
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-zinc-500 hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:translate-x-1 transition-transform ml-1" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Painel Detalhado Lateral */}
        {selectedDossier ? (
          <div className="lg:col-span-1 glass-panel border border-border rounded-2xl p-6 flex flex-col h-fit lg:sticky lg:top-8 animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-start gap-4 mb-4 pb-4 border-b border-border">
              <div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">{selectedDossier.category}</span>
                <h2 className="text-xl font-bold text-foreground mt-1">{selectedDossier.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedDossier(null)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-1">
              <div>
                <h4 className="text-xs font-semibold text-zinc-500 uppercase mb-2">Visão Geral</h4>
                <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/50 p-3.5 rounded-xl border border-border/50">
                  {selectedDossier.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-zinc-500 uppercase mb-2 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-primary rotate-90" />
                  Diretrizes Estratégicas
                </h4>
                <ul className="space-y-2">
                  {selectedDossier.keyPoints.map((point: string, idx: number) => (
                    <li key={idx} className="flex gap-2 text-sm text-zinc-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {selectedDossier.stakeholders.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    Pessoas de Interesse
                  </h4>
                  <div className="space-y-2">
                    {selectedDossier.stakeholders.map((person: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between bg-zinc-900/40 p-2.5 rounded-lg border border-border/30 text-xs">
                        <div>
                          <div className="font-medium text-foreground">{person.name}</div>
                          <div className="text-zinc-500 mt-0.5">{person.role}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded font-medium ${
                          person.stance === 'Favorável' 
                          ? 'bg-emerald-500/10 text-emerald-500' 
                          : person.stance === 'Contrário'
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {person.stance}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDossier.timeline.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    Linha do Tempo
                  </h4>
                  <div className="border-l border-zinc-800 ml-2 space-y-3.5 pt-1">
                    {selectedDossier.timeline.map((item: any, idx: number) => (
                      <div key={idx} className="relative pl-6">
                        <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-primary"></div>
                        <div className="text-[10px] text-zinc-500 font-semibold uppercase">{item.date}</div>
                        <div className="text-xs text-zinc-300 mt-0.5">{item.event}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDossier.documents.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase mb-2 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-primary" />
                    Documentação Anexa
                  </h4>
                  <div className="space-y-1.5">
                    {selectedDossier.documents.map((doc: any, idx: number) => (
                      <a 
                        key={idx}
                        href="#"
                        onClick={(e) => handleDownloadDocument(e, selectedDossier, doc.name)}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors text-xs text-zinc-300 group"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-zinc-500 group-hover:text-primary transition-colors shrink-0" />
                          <span className="truncate group-hover:text-foreground transition-colors">{doc.name}</span>
                        </span>
                        <span className="text-[10px] text-zinc-500 shrink-0">{doc.size}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-4 border-t border-border mt-4 flex gap-2">
                {/* Archive / Restore */}
                <button
                  onClick={() => handleArchiveDossier(selectedDossier.id, selectedDossier.title, !!selectedDossier.archived)}
                  className="flex-1 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-500 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {selectedDossier.archived
                    ? <><ArchiveRestore className="w-3.5 h-3.5" /> Restaurar</>
                    : <><Archive className="w-3.5 h-3.5" /> Arquivar</>}
                </button>
                {/* Delete */}
                <button
                  onClick={() => handleDeleteDossier(selectedDossier.id, selectedDossier.title)}
                  className="flex-1 py-2 bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Excluir
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex lg:col-span-1 glass-panel border border-border border-dashed rounded-2xl p-6 items-center justify-center text-center h-[400px]">
            <div className="space-y-3">
              <FolderTree className="w-10 h-10 text-zinc-600 mx-auto" />
              <h4 className="font-semibold text-zinc-400">Nenhum Dossiê Selecionado</h4>
              <p className="text-xs text-zinc-500 max-w-[200px] mx-auto">Selecione um dossiê da lista para ver o relatório de inteligência completo.</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal - Novo Dossiê */}
      {isNewDossierOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-border p-6 space-y-6 overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h3 className="text-xl font-bold text-gradient">Novo Dossiê de Inteligência</h3>
              <button 
                onClick={() => setIsNewDossierOpen(false)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDossier} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Título do Dossiê</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: PL da Zona Verde ou Fiscalização da UPA Norte"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Categoria</label>
                  <select 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/50 text-foreground"
                  >
                    <option>Zoneamento</option>
                    <option>Saúde</option>
                    <option>Mobilidade</option>
                    <option>Educação</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Status Inicial</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/50 text-foreground"
                  >
                    <option>Em Andamento</option>
                    <option>Crítico</option>
                    <option>Concluído</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Resumo Executivo</label>
                <textarea 
                  required
                  placeholder="Descreva um resumo curto de 1 ou 2 frases da análise técnica..."
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground resize-none h-20"
                ></textarea>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Descrição Detalhada</label>
                <textarea 
                  placeholder="Informações completas, justificativa legal, histórico e impactos políticos esperados..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground resize-none h-28"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button 
                  type="button"
                  onClick={() => setIsNewDossierOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground text-sm font-medium transition-colors shadow-lg shadow-accent/10 cursor-pointer"
                >
                  Criar Dossiê
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
