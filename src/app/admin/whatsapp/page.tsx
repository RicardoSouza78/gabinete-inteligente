'use client';

import { useState, useEffect } from 'react';
import {
  MessageCircle, Plus, Send, Trash2, User, Phone,
  Edit3, X, CheckCircle2, Clock, Zap, Bell,
  Users, Copy, ExternalLink, Search, Filter,
  AlertTriangle, FileText, Newspaper, Calendar
} from 'lucide-react';
import { showToast } from '@/components/admin/Toast';
import { store } from '@/lib/store';

// ── Types ─────────────────────────────────────────────────────────────────────
type Contact = {
  id: number;
  name: string;
  role: string;
  phone: string; // format: 5592999999999
  group: 'Assessoria' | 'Liderança' | 'Imprensa' | 'Vereador';
  active: boolean;
};

type AlertLog = {
  id: number;
  datetime: string;
  template: string;
  recipients: string[];
  preview: string;
  status: 'Enviado' | 'Agendado' | 'Falhou';
};

type Template = {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  body: string;
};

// ── Seed data ─────────────────────────────────────────────────────────────────
const INITIAL_CONTACTS: Contact[] = [
  { id: 1, name: 'Maria Clara Souza', role: 'Assessora de Imprensa', phone: '559298122334', group: 'Assessoria', active: true },
  { id: 2, name: 'João Paulo Lima', role: 'Assessor Político', phone: '559299244556', group: 'Assessoria', active: true },
  { id: 3, name: 'Ana Beatriz Ramos', role: 'Assessora Legislativa', phone: '559298455778', group: 'Assessoria', active: true },
  { id: 4, name: 'Carlos Mendes', role: 'Líder Comunitário – Zona Leste', phone: '559291234567', group: 'Liderança', active: true },
  { id: 5, name: 'Regina Feitosa', role: 'Líder de Bairro – São José', phone: '559292345678', group: 'Liderança', active: true },
  { id: 6, name: 'Repórter – A Crítica', role: 'Imprensa Regional', phone: '559293456789', group: 'Imprensa', active: false },
  { id: 7, name: 'Vereador Rodrigo Sá', role: 'Parlamentar Titular', phone: '559294567890', group: 'Vereador', active: true },
];

const INITIAL_LOG: AlertLog[] = [
  { id: 1, datetime: '01 Jun 2026, 08:15', template: 'Pauta do Dia', recipients: ['Maria Clara Souza', 'João Paulo Lima', 'Ana Beatriz Ramos'], preview: '📋 *PAUTA DO DIA — Gabinete Rodrigo Sá*\n\n🗓️ 01 Jun 2026\n\n• 09:00 — Sessão Plenária (PL 123/2026)\n• 14:30 — Reunião Zona Leste\n• 17:00 — Entrevista Rádio Difusora', status: 'Enviado' },
  { id: 2, datetime: '31 Mai 2026, 17:45', template: 'Alerta Urgente', recipients: ['Vereador Rodrigo Sá', 'João Paulo Lima'], preview: '🚨 *ALERTA URGENTE — Gabinete Rodrigo Sá*\n\nDecreto de Emergência publicado no Diário Oficial — Zona Leste. Ação imediata necessária.', status: 'Enviado' },
  { id: 3, datetime: '30 Mai 2026, 09:00', template: 'Boletim Semanal', recipients: ['Maria Clara Souza', 'Ana Beatriz Ramos', 'Carlos Mendes', 'Regina Feitosa'], preview: '📰 *BOLETIM SEMANAL — Gabinete Rodrigo Sá*\n\nSemana de 26 a 30 de Maio de 2026\n\nDestaques: Hospital Leste, PL Zoneamento, Transporte Apps.', status: 'Enviado' },
];

const GROUP_CONFIG: Record<string, { color: string; bg: string }> = {
  Assessoria: { color: 'text-blue-400',    bg: 'bg-blue-400/10' },
  Liderança:  { color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  Imprensa:   { color: 'text-amber-400',   bg: 'bg-amber-400/10' },
  Vereador:   { color: 'text-primary',     bg: 'bg-primary/10' },
};

// ── Alert templates ───────────────────────────────────────────────────────────
const buildTemplates = (agenda: any[], bulletin: any): Template[] => {
  const agendaLines = agenda.slice(0, 5).map(a => `• ${a.time} — ${a.title} (${a.location})`).join('\n');
  const todayDate = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  return [
    {
      id: 'pauta',
      label: 'Pauta do Dia',
      icon: <Calendar className="w-4 h-4" />,
      color: 'text-blue-400',
      body: `📋 *PAUTA DO DIA — Gabinete Rodrigo Sá*\n\n🗓️ ${todayDate}\n\n${agendaLines || '• Nenhum compromisso cadastrado hoje.'}\n\n_Fique atento às atualizações!_\n\n🏛️ Gabinete Inteligente | Vereador Rodrigo Sá`
    },
    {
      id: 'urgente',
      label: 'Alerta Urgente',
      icon: <AlertTriangle className="w-4 h-4" />,
      color: 'text-red-400',
      body: `🚨 *ALERTA URGENTE — Gabinete Rodrigo Sá*\n\n⚠️ [DESCREVA O ASSUNTO URGENTE AQUI]\n\nAção necessária. Por favor, verifique imediatamente.\n\n📞 Entre em contato com a assessoria.\n\n🏛️ Gabinete Inteligente | Vereador Rodrigo Sá`
    },
    {
      id: 'boletim',
      label: 'Boletim Semanal',
      icon: <Newspaper className="w-4 h-4" />,
      color: 'text-emerald-400',
      body: `📰 *BOLETIM SEMANAL — Gabinete Rodrigo Sá*\n\n📅 Semana de [DATA INÍCIO] a [DATA FIM]\n\n*Destaques da Semana:*\n${bulletin?.headlines?.map((h: any) => `• ${h.title}`).join('\n') || '• [ADICIONE OS DESTAQUES]'}\n\n*Resumo Executivo:*\n${bulletin?.summary || '[RESUMO DO BOLETIM]'}\n\n🏛️ Gabinete Inteligente | Vereador Rodrigo Sá`
    },
    {
      id: 'sessao',
      label: 'Convocação de Sessão',
      icon: <Users className="w-4 h-4" />,
      color: 'text-purple-400',
      body: `⚖️ *CONVOCAÇÃO — Gabinete Rodrigo Sá*\n\n📣 Sessão Plenária Convocada\n\n📅 Data: [DATA]\n⏰ Hora: [HORA]\n📍 Local: Câmara Municipal de Manaus\n\n*Pautas em destaque:*\n• [PAUTA 1]\n• [PAUTA 2]\n\nPor favor, confirme seu comparecimento.\n\n🏛️ Gabinete Inteligente | Vereador Rodrigo Sá`
    },
    {
      id: 'demanda',
      label: 'Atualização de Demanda',
      icon: <FileText className="w-4 h-4" />,
      color: 'text-amber-400',
      body: `📌 *ATUALIZAÇÃO DE DEMANDA — Gabinete Rodrigo Sá*\n\n✅ Sua demanda foi recebida e está em análise.\n\n*Caso:* [NOME DA DEMANDA]\n*Bairro:* [BAIRRO]\n*Status:* Em Análise\n*Prazo estimado:* [PRAZO]\n\nEntraremos em contato em breve com mais informações.\n\n🏛️ Gabinete Rodrigo Sá — Vereador de Manaus`
    },
  ];
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function WhatsAppPage() {
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [log, setLog] = useState<AlertLog[]>(INITIAL_LOG);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [messageBody, setMessageBody] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [searchContact, setSearchContact] = useState('');
  const [filterGroup, setFilterGroup] = useState('Todos');
  const [activeTab, setActiveTab] = useState<'compose' | 'contacts' | 'history'>('compose');

  // Contact form
  const [showContactForm, setShowContactForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formGroup, setFormGroup] = useState<Contact['group']>('Assessoria');

  useEffect(() => {
    const agenda = store.get('agenda') || [];
    const bulletin = store.get('bulletin') || {};
    const tpls = buildTemplates(agenda, bulletin);
    setTemplates(tpls);
    setActiveTemplate(tpls[0]);
    setMessageBody(tpls[0].body);
  }, []);

  const handleSelectTemplate = (tpl: Template) => {
    setActiveTemplate(tpl);
    setMessageBody(tpl.body);
  };

  const toggleContact = (id: number) => {
    setSelectedContacts(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const selectGroup = (group: string) => {
    const ids = contacts
      .filter(c => c.active && (group === 'Todos' ? true : c.group === group))
      .map(c => c.id);
    setSelectedContacts(ids);
  };

  // Build WhatsApp link for a single contact
  const buildWaLink = (phone: string, msg: string) => {
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  const handleSendAll = () => {
    if (selectedContacts.length === 0) {
      showToast('Selecione ao menos um destinatário.', 'error');
      return;
    }
    if (!messageBody.trim()) {
      showToast('A mensagem não pode estar vazia.', 'error');
      return;
    }

    const recipientContacts = contacts.filter(c => selectedContacts.includes(c.id));

    // Open first recipient in WhatsApp Web; log the send
    if (recipientContacts.length > 0) {
      window.open(buildWaLink(recipientContacts[0].phone, messageBody), '_blank');
    }

    const newLog: AlertLog = {
      id: Date.now(),
      datetime: new Date().toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      template: activeTemplate?.label || 'Mensagem Personalizada',
      recipients: recipientContacts.map(c => c.name),
      preview: messageBody,
      status: 'Enviado',
    };
    setLog(prev => [newLog, ...prev]);
    showToast(`Alerta enviado para ${recipientContacts.length} contato(s)!`, 'success');
  };

  const handleSendSingle = (contact: Contact) => {
    window.open(buildWaLink(contact.phone, messageBody), '_blank');
    const newLog: AlertLog = {
      id: Date.now(),
      datetime: new Date().toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      template: activeTemplate?.label || 'Envio Individual',
      recipients: [contact.name],
      preview: messageBody,
      status: 'Enviado',
    };
    setLog(prev => [newLog, ...prev]);
    showToast(`WhatsApp aberto para ${contact.name}!`, 'success');
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone) return;
    const clean = formPhone.replace(/\D/g, '');
    const newC: Contact = {
      id: Date.now(),
      name: formName,
      role: formRole,
      phone: clean,
      group: formGroup,
      active: true,
    };
    setContacts(prev => [...prev, newC]);
    setFormName(''); setFormRole(''); setFormPhone(''); setFormGroup('Assessoria');
    setShowContactForm(false);
    showToast(`${formName} adicionado à lista de contatos!`, 'success');
  };

  const handleDeleteContact = (id: number) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    setSelectedContacts(prev => prev.filter(i => i !== id));
    showToast('Contato removido.', 'info');
  };

  const filteredContacts = contacts.filter(c => {
    const matchSearch = !searchContact || c.name.toLowerCase().includes(searchContact.toLowerCase()) || c.role.toLowerCase().includes(searchContact.toLowerCase());
    const matchGroup = filterGroup === 'Todos' || c.group === filterGroup;
    return matchSearch && matchGroup;
  });

  const groups = ['Todos', 'Assessoria', 'Liderança', 'Imprensa', 'Vereador'];

  return (
    <div className="p-8 space-y-6 animate-in fade-in flex-1 flex flex-col min-h-0 relative">

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-emerald-400" />
            Alertas WhatsApp
          </h1>
          <p className="text-zinc-400 mt-1.5 text-sm">
            Envie alertas de pauta, notícias urgentes e boletins diretamente ao WhatsApp da equipe.
          </p>
        </div>
        {/* Stats */}
        <div className="flex gap-3 shrink-0">
          <div className="glass-panel border border-border rounded-xl px-4 py-2.5 text-center">
            <p className="text-lg font-bold text-foreground">{contacts.filter(c => c.active).length}</p>
            <p className="text-[10px] text-zinc-500">Contatos Ativos</p>
          </div>
          <div className="glass-panel border border-border rounded-xl px-4 py-2.5 text-center">
            <p className="text-lg font-bold text-emerald-400">{log.filter(l => l.status === 'Enviado').length}</p>
            <p className="text-[10px] text-zinc-500">Alertas Enviados</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 bg-card/40 border border-border p-1 rounded-xl w-fit shrink-0">
        {([
          { key: 'compose', label: 'Composer', icon: <Send className="w-3.5 h-3.5" /> },
          { key: 'contacts', label: 'Contatos', icon: <Users className="w-3.5 h-3.5" /> },
          { key: 'history', label: 'Histórico', icon: <Clock className="w-3.5 h-3.5" /> },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-zinc-400 hover:text-foreground'
            }`}
          >
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB: Composer ──────────────────────────────────────────────────────── */}
      {activeTab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-y-auto">

          {/* Left: Templates + Recipients */}
          <div className="space-y-5 lg:col-span-1">

            {/* Templates */}
            <div className="glass-panel border border-border rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-primary" /> Modelos de Alerta
              </h3>
              {templates.map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border ${
                    activeTemplate?.id === tpl.id
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'border-transparent hover:bg-white/5 text-zinc-400 hover:text-foreground'
                  }`}
                >
                  <span className={activeTemplate?.id === tpl.id ? 'text-primary' : tpl.color}>{tpl.icon}</span>
                  {tpl.label}
                </button>
              ))}
            </div>

            {/* Recipients */}
            <div className="glass-panel border border-border rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-primary" /> Destinatários
                </h3>
                <span className="text-[10px] text-primary font-bold">{selectedContacts.length} sel.</span>
              </div>

              {/* Group quick-select */}
              <div className="flex flex-wrap gap-1.5">
                {groups.map(g => (
                  <button
                    key={g}
                    onClick={() => selectGroup(g)}
                    className="text-[10px] px-2 py-1 rounded-lg border border-border hover:border-primary/30 text-zinc-400 hover:text-primary transition-colors"
                  >
                    {g === 'Todos' ? '✓ Todos' : g}
                  </button>
                ))}
                <button
                  onClick={() => setSelectedContacts([])}
                  className="text-[10px] px-2 py-1 rounded-lg border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors"
                >
                  Limpar
                </button>
              </div>

              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                {contacts.filter(c => c.active).map(contact => {
                  const cfg = GROUP_CONFIG[contact.group];
                  return (
                    <label
                      key={contact.id}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all border ${
                        selectedContacts.includes(contact.id)
                          ? 'bg-primary/5 border-primary/20'
                          : 'border-transparent hover:bg-white/5'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => toggleContact(contact.id)}
                        className="w-3.5 h-3.5 accent-primary rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{contact.name}</p>
                        <p className="text-[10px] text-zinc-500 truncate">{contact.role}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${cfg.bg} ${cfg.color}`}>
                        {contact.group.charAt(0)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Center: Message editor */}
          <div className="lg:col-span-2 space-y-4">

            {/* Editor */}
            <div className="glass-panel border border-border rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-primary" /> Editar Mensagem
                </h3>
                {activeTemplate && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary`}>
                    {activeTemplate.label}
                  </span>
                )}
              </div>

              <textarea
                value={messageBody}
                onChange={e => setMessageBody(e.target.value)}
                rows={14}
                className="w-full bg-zinc-900/60 border border-zinc-700 rounded-xl p-4 text-sm text-foreground font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />

              <div className="flex items-center justify-between gap-4 pt-2 border-t border-border">
                <p className="text-[11px] text-zinc-500">
                  {messageBody.length} caracteres · {selectedContacts.length} destinatário(s)
                </p>
                <button
                  onClick={handleSendAll}
                  disabled={selectedContacts.length === 0}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  Enviar via WhatsApp
                  {selectedContacts.length > 0 && (
                    <span className="bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {selectedContacts.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* WhatsApp Preview */}
            <div className="glass-panel border border-emerald-500/20 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" /> Prévia no WhatsApp
              </h3>
              <div className="bg-[#0a1628] rounded-xl p-4 space-y-2 border border-emerald-900/30">
                {/* WhatsApp chat bubble */}
                <div className="flex justify-end">
                  <div className="bg-[#005c4b] text-white text-xs px-3 py-2 rounded-lg rounded-tr-sm max-w-[85%] leading-relaxed whitespace-pre-wrap shadow-sm">
                    {messageBody || 'Sua mensagem aparecerá aqui...'}
                    <div className="text-[9px] text-emerald-300/70 text-right mt-1">
                      {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} ✓✓
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-zinc-600 leading-relaxed">
                💡 *texto em negrito*, _itálico_, ~riscado~, `monoespaçado` — formatação nativa do WhatsApp.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Contacts ──────────────────────────────────────────────────────── */}
      {activeTab === 'contacts' && (
        <div className="flex-1 space-y-4 overflow-y-auto">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between shrink-0">
            {/* Search & Filter */}
            <div className="flex gap-2 flex-wrap flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Buscar contato..."
                  value={searchContact}
                  onChange={e => setSearchContact(e.target.value)}
                  className="bg-zinc-900/50 border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 w-52"
                />
              </div>
              {groups.map(g => (
                <button
                  key={g}
                  onClick={() => setFilterGroup(g)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    filterGroup === g
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-foreground'
                  }`}
                >{g}</button>
              ))}
            </div>
            <button
              onClick={() => setShowContactForm(true)}
              className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Novo Contato
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredContacts.map(contact => {
              const cfg = GROUP_CONFIG[contact.group];
              return (
                <div
                  key={contact.id}
                  className={`glass-panel border border-border rounded-xl p-4 flex items-start gap-3 group transition-all ${!contact.active ? 'opacity-50' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    {contact.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">{contact.name}</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${cfg.bg} ${cfg.color}`}>
                        {contact.group}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 truncate mt-0.5">{contact.role}</p>
                    <p className="text-[10px] text-zinc-600 font-mono mt-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> +{contact.phone}
                    </p>
                  </div>
                  {/* Actions */}
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => { handleSendSingle(contact); }}
                      title="Enviar mensagem"
                      className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      title="Remover contato"
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-zinc-600 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Contact Modal */}
          {showContactForm && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
              <form onSubmit={handleAddContact} className="glass-panel w-full max-w-md rounded-3xl border border-border p-6 space-y-5 animate-in zoom-in-95 duration-150">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Novo Contato</h3>
                  <button type="button" onClick={() => setShowContactForm(false)} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 uppercase mb-1 block">Nome Completo *</label>
                    <input required value={formName} onChange={e => setFormName(e.target.value)} placeholder="Ex: Maria Clara Souza" className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 uppercase mb-1 block">Cargo / Função</label>
                    <input value={formRole} onChange={e => setFormRole(e.target.value)} placeholder="Ex: Assessora de Imprensa" className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 uppercase mb-1 block">WhatsApp (com DDD e DDI) *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input required value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="5592999999999" className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono" />
                    </div>
                    <p className="text-[10px] text-zinc-600 mt-1">Formato: 55 (Brasil) + DDD + número. Ex: 5592998887766</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 uppercase mb-1 block">Grupo</label>
                    <select value={formGroup} onChange={e => setFormGroup(e.target.value as Contact['group'])} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none">
                      <option>Assessoria</option>
                      <option>Liderança</option>
                      <option>Imprensa</option>
                      <option>Vereador</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowContactForm(false)} className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors">Cancelar</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground text-sm font-semibold transition-colors cursor-pointer">Adicionar</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: History ───────────────────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="flex-1 overflow-y-auto space-y-3">
          {log.length === 0 ? (
            <div className="glass-panel border border-dashed border-border rounded-2xl p-12 text-center">
              <Clock className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400">Nenhum alerta enviado ainda.</p>
            </div>
          ) : (
            log.map(entry => (
              <div key={entry.id} className="glass-panel border border-border rounded-2xl p-5 flex flex-col md:flex-row gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      entry.status === 'Enviado' ? 'bg-emerald-500/10 text-emerald-400' :
                      entry.status === 'Agendado' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {entry.status === 'Enviado' ? <CheckCircle2 className="w-3 h-3 inline mr-1" /> : <Bell className="w-3 h-3 inline mr-1" />}
                      {entry.status}
                    </span>
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {entry.datetime}
                    </span>
                    <span className="text-[10px] font-semibold text-primary">{entry.template}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {entry.recipients.map((r, i) => (
                      <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-medium">
                        {r}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-zinc-500 line-clamp-2 font-mono leading-relaxed bg-zinc-900/50 px-3 py-2 rounded-lg border border-border/40">
                    {entry.preview.substring(0, 180)}...
                  </p>
                </div>

                <div className="flex gap-2 items-start shrink-0">
                  <button
                    onClick={() => {
                      setMessageBody(entry.preview);
                      setActiveTab('compose');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" /> Reutilizar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
