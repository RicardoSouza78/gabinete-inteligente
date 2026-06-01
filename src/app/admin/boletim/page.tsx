'use client';

import { useState, useEffect } from 'react';
import { FileText, Play, Settings2, CheckCircle2, AlertCircle, Save, Send } from 'lucide-react';
import { store } from '@/lib/store';
import { showToast } from '@/components/admin/Toast';


export default function MotorIA() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [contextText, setContextText] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [relevanceScore, setRelevanceScore] = useState(75);
  const [tone, setTone] = useState('Técnico e Neutro');
  const [emphasis, setEmphasis] = useState('Geral (Sem ênfase)');
  const [size, setSize] = useState('Completo (Padrão)');
  const [published, setPublished] = useState(false);
  const [sourcesCount, setSourcesCount] = useState(0);

  useEffect(() => {
    const currentB = store.get('bulletin');
    if (currentB) {
      setGeneratedText(currentB.summary);
      setRelevanceScore(currentB.relevanceScore);
      setPublished(currentB.published);
    }
    const sources = store.get('sources') || [];
    setSourcesCount(sources.filter((s: any) => s.status === 'ativo').length);
  }, []);

  const handleGenerate = () => {
    setIsGenerating(true);
    setPublished(false);
    
    setTimeout(() => {
      const activeNews = store.get('news') || [];
      const activeDemands = store.get('demands') || [];

      // Filtrar notícias não lidas (ou todas se não houverem não lidas)
      let filteredNews = activeNews.filter((n: any) => !n.readStatus);
      if (filteredNews.length === 0) filteredNews = activeNews;

      // Filtrar demandas pendentes (status diferente de Resolvido)
      let filteredDemands = activeDemands.filter((d: any) => d.status !== 'Resolvido');
      if (filteredDemands.length === 0) filteredDemands = activeDemands;

      // Helper para priorizar baseado em ênfase temática
      const keywordMatch = (text: string, category: string, emp: string) => {
        const t = `${text} ${category}`.toLowerCase();
        if (emp === 'Saúde Pública') {
          return t.includes('saúde') || t.includes('hospital') || t.includes('ubs') || t.includes('remedio') || t.includes('remédio') || t.includes('pediá');
        }
        if (emp === 'Infraestrutura e Asfalto') {
          return t.includes('asfalto') || t.includes('buraco') || t.includes('transporte') || t.includes('poste') || t.includes('luz') || t.includes('esgoto') || t.includes('rua') || t.includes('avenida');
        }
        if (emp === 'Educação') {
          return t.includes('escola') || t.includes('creche') || t.includes('professor') || t.includes('educa');
        }
        return false;
      };

      // Ordenar notícias e demandas por ênfase e relevância
      const sortedNews = [...filteredNews].sort((a: any, b: any) => {
        const aMatch = keywordMatch(a.title + ' ' + (a.summary || ''), a.category || '', emphasis);
        const bMatch = keywordMatch(b.title + ' ' + (b.summary || ''), b.category || '', emphasis);
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return (b.relevance || 0) - (a.relevance || 0);
      });

      const sortedDemands = [...filteredDemands].sort((a: any, b: any) => {
        const aMatch = keywordMatch(a.title + ' ' + (a.description || ''), '', emphasis);
        const bMatch = keywordMatch(b.title + ' ' + (b.description || ''), '', emphasis);
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      });

      // Definir limites de itens baseado no tamanho escolhido
      let maxNewsCount = 2;
      let maxDemandsCount = 3;
      if (size === 'Executivo (Curto)') {
        maxNewsCount = 1;
        maxDemandsCount = 1;
      } else if (size === 'Expandido (Com transcrições)') {
        maxNewsCount = 3;
        maxDemandsCount = 5;
      }

      // Cálculo de Termômetro de Relevância
      let maxNewsRel = sortedNews.length > 0 ? sortedNews[0].relevance : 70;
      let computedScore = maxNewsRel;
      if (sortedDemands.length > 0) {
        computedScore += Math.min(10, sortedDemands.length * 2);
      }
      if (sortedNews.some((n: any) => n.relevance > 85)) {
        computedScore += 5;
      }
      computedScore = Math.min(100, Math.max(50, computedScore));
      setRelevanceScore(computedScore);

      // Agrupamento de demandas por bairro
      const demandsByNeighborhood: Record<string, string[]> = {};
      sortedDemands.slice(0, maxDemandsCount).forEach((d: any) => {
        const nb = d.neighborhood || 'Outros';
        if (!demandsByNeighborhood[nb]) {
          demandsByNeighborhood[nb] = [];
        }
        demandsByNeighborhood[nb].push(`${d.title} (${d.status})`);
      });

      // Construção do Texto do Boletim
      let titleHeader = '';
      let intro = '';
      let newsText = '';
      let demandsText = '';

      if (tone === 'Combativo (Oposição)') {
        titleHeader = `🚨 BOLETIM DE FISCALIZAÇÃO CRÍTICA`;
        intro = `O gabinete técnico identificou falhas graves nos serviços públicos municipais nas últimas 24 horas. Exigimos providências da prefeitura nas frentes monitoradas abaixo:`;
      } else if (tone === 'Conciliador (Base)') {
        titleHeader = `🤝 INFORME DE ARTICULAÇÃO E DIÁLOGO`;
        intro = `Trabalho legislativo pautado na construção de consensos e soluções em parceria com os órgãos do município. Veja nosso monitoramento:`;
      } else if (tone === 'Informal (Bastidor)') {
        titleHeader = `🤫 BASTIDORES DO GABINETE`;
        intro = `Conversas de corredor e movimentações políticas quentes nas últimas horas. Confira o termômetro legislativo e comunitário:`;
      } else {
        // Técnico e Neutro
        titleHeader = `📊 RELATÓRIO TÉCNICO E DE MONITORAMENTO`;
        intro = `Consolidado de imprensa e demandas populares registradas no sistema de monitoramento nas últimas 24 horas:`;
      }

      // Seção de Notícias
      if (sortedNews.length > 0) {
        newsText = `\n\n📌 *Mídia & Notícias Imprensa (Prioridade: ${emphasis}):*\n`;
        sortedNews.slice(0, maxNewsCount).forEach((n: any, idx: number) => {
          newsText += `${idx + 1}. *${n.title}* [Relevância: ${n.relevance}%]\n   _Fonte: ${n.source} | Categoria: ${n.category}_\n   _${n.summary}_\n`;
        });
      }

      // Seção de Demandas
      if (Object.keys(demandsByNeighborhood).length > 0) {
        demandsText = `\n\n📌 *Reclamações Comunitárias por Bairro:*\n`;
        Object.entries(demandsByNeighborhood).forEach(([nb, items]) => {
          demandsText += `• *Bairro: ${nb}*\n`;
          items.forEach((item) => {
            demandsText += `  - ${item}\n`;
          });
        });
      }

      let aiDraft = `${titleHeader}\n\n${intro}${newsText}${demandsText}`;

      // Inclusão de Transcrições (se tamanho for Expandido)
      if (size === 'Expandido (Com transcrições)') {
        let transcriptText = `\n\n💬 *Fragmento de Sessão Plenária (Simulado):*\n`;
        if (emphasis === 'Saúde Pública') {
          transcriptText += `[09:42] "Senhores vereadores, o repasse para a ala infantil do Hospital Leste não pode virar moeda de troca burocrática! O povo quer a conclusão da obra!"`;
        } else if (emphasis === 'Infraestrutura e Asfalto') {
          transcriptText += `[10:15] "Estamos cobrando da Secretaria de Obras o recapeamento imediato nos pontos mais críticos da Zona Leste. O asfalto está se desintegrando!"`;
        } else {
          transcriptText += `[10:05] "A regulação urbana e o atendimento das demandas da população devem guiar nossas votações de hoje. Não faremos concessões aos interesses privados."`;
        }
        aiDraft += transcriptText;
      }

      // Inclusão do contexto do assessor
      if (contextText) {
        aiDraft += `\n\n⚠️ *Bastidores & Notas Adicionais do Assessor:*\n"${contextText}"`;
      }

      setGeneratedText(aiDraft);
      setIsGenerating(false);
    }, 2000);
  };

  const handlePublish = () => {
    if (!generatedText) return;

    // Fetch active headlines to link in PWA
    const activeNews = store.get('news') || [];
    const headlines = activeNews.slice(0, 2).map((n: any) => ({
      title: n.title,
      source: n.source,
      time: n.date
    }));

    store.updateBulletin({
      summary: generatedText,
      relevanceScore: relevanceScore,
      published: true,
      headlines: headlines
    });

    setPublished(true);
    showToast('Boletim diário publicado no PWA do vereador!', 'success');
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in max-w-5xl flex-1 overflow-y-auto">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          Motor de Geração
        </h1>
        <p className="text-zinc-400 mt-2">Configure os parâmetros e gere o Boletim Diário assistido por Inteligência Artificial.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna Esquerda: Configurações e Input */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-border">
            <h2 className="text-xl font-semibold mb-4">Contexto Adicional (Bastidores)</h2>
            <p className="text-xs text-zinc-400 mb-4">
              Insira informações de bastidores, conversas de WhatsApp ou direcionamentos específicos que a IA deve considerar no resumo de hoje.
            </p>
            <textarea
              className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl p-4 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground resize-none min-h-[120px]"
              placeholder="Ex: A oposição está ameaçando trancar a pauta. O prefeito ligou pedindo apoio no PL da saúde..."
              value={contextText}
              onChange={(e) => setContextText(e.target.value)}
            ></textarea>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-border flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="text-xs">
              <h3 className="font-semibold text-sm">Pronto para Gerar?</h3>
              <p className="text-zinc-500 mt-1">Gera um boletim unindo o monitoramento com seus bastidores.</p>
            </div>
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all text-xs cursor-pointer ${
                isGenerating 
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
                  Processando...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Gerar Boletim
                </>
              )}
            </button>
          </div>

          {/* Área de Visualização e Edição do Boletim Gerado */}
          {generatedText && (
            <div className="glass-panel p-6 rounded-2xl border border-border space-y-4 animate-in slide-in-from-bottom-2 text-xs">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <h3 className="font-bold text-sm text-foreground">Rascunho do Boletim Gerado</h3>
                <span className="text-zinc-500 font-semibold">Termômetro estimado: {relevanceScore}/100</span>
              </div>
              <textarea
                value={generatedText}
                onChange={(e) => {
                  setGeneratedText(e.target.value);
                  setPublished(false);
                }}
                className="w-full bg-zinc-950/65 border border-zinc-700 rounded-xl p-4 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground resize-none min-h-[160px] leading-relaxed"
              ></textarea>
              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-zinc-500">
                  {published ? (
                    <span className="text-emerald-500 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Publicado e Ativo no PWA
                    </span>
                  ) : (
                    'Rascunho alterado - clique para publicar'
                  )}
                </span>
                <button
                  onClick={handlePublish}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Publicar para o Vereador
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Coluna Direita: Parâmetros */}
        <div className="space-y-6 text-xs">
          <div className="bg-card/40 border border-border rounded-2xl p-6">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
              <Settings2 className="w-5 h-5 text-accent-foreground" />
              Parâmetros da IA
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="font-medium text-zinc-300 block mb-1.5">Tom do Boletim</label>
                <select 
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 focus:ring-1 focus:ring-primary/50 focus:outline-none text-foreground"
                >
                  <option>Técnico e Neutro</option>
                  <option>Combativo (Oposição)</option>
                  <option>Conciliador (Base)</option>
                  <option>Informal (Bastidor)</option>
                </select>
              </div>
              
              <div>
                <label className="font-medium text-zinc-300 block mb-1.5">Ênfase Temática</label>
                <select 
                  value={emphasis}
                  onChange={(e) => setEmphasis(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 focus:ring-1 focus:ring-primary/50 focus:outline-none text-foreground"
                >
                  <option>Geral (Sem ênfase)</option>
                  <option>Saúde Pública</option>
                  <option>Infraestrutura e Asfalto</option>
                  <option>Educação</option>
                </select>
              </div>
              
              <div>
                <label className="font-medium text-zinc-300 block mb-1.5">Tamanho</label>
                <select 
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 focus:ring-1 focus:ring-primary/50 focus:outline-none text-foreground"
                >
                  <option>Executivo (Curto)</option>
                  <option>Completo (Padrão)</option>
                  <option>Expandido (Com transcrições)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-card/40 border border-border rounded-2xl p-6">
            <h3 className="text-xs font-semibold text-zinc-300 mb-3">Status das Integrações</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-zinc-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Fontes Ativas ({sourcesCount})
                </span>
                <span className="text-emerald-500">OK</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-zinc-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  API Câmara (Pauta)
                </span>
                <span className="text-emerald-500">OK</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-zinc-400">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Termômetro CRM
                </span>
                <span className="text-amber-500 text-[10px]">Desatualizado</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
