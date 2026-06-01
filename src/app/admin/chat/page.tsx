'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, User, Brain, AlertCircle, ArrowRight } from 'lucide-react';
import { store } from '@/lib/store';

const SUGGESTED_PROMPTS = [
  { text: 'Qual o impacto do PL 123/2026 para meu vereador?', category: 'Estratégia' },
  { text: 'Como a oposição está cobrando o Hospital Municipal?', category: 'Crise' },
  { text: 'Resuma a repercussão da lei de transporte por apps.', category: 'Resumo' }
];

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([
    {
      id: 1,
      sender: 'ai',
      text: 'Olá! Sou o assistente de IA do Gabinete Inteligente. Posso responder qualquer dúvida com base estritamente nas notícias e fontes monitoradas por você.',
      date: 'Agora mesmo'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on new messages
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      date: 'Agora mesmo'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response based on store articles
    setTimeout(() => {
      let replyText = '';
      const query = text.toLowerCase();
      const currentNews = store.get('news') || [];

      // Logic to parse store articles and give specific answers
      if (query.includes('pl 123') || query.includes('zoneamento') || query.includes('leste')) {
        const zoneamentoArticle = currentNews.find((n: any) => n.category === 'Zoneamento' || n.title.includes('123'));
        replyText = `Com base nas matérias do *${zoneamentoArticle?.source || 'Portal da CMM'}*, o parecer do PL 123/2026 foi aprovado na Comissão de Urbanismo.

**Pontos Críticos para o seu Vereador:**
1. A emenda da oposição (para reduzir exigências verdes) está sofrendo forte resistência de ambientalistas. A oposição tentará votar hoje em plenário.
2. **Recomendação estratégica:** Manter voto contra a emenda de redução verde para se alinhar com a opinião pública, mas apoiar o texto principal da prefeitura que incentiva pequenos comércios locais, beneficiando o eleitorado comercial da Zona Leste.`;
      } 
      else if (query.includes('hospital') || query.includes('saúde') || query.includes('crise')) {
        const saudeArticle = currentNews.find((n: any) => n.category === 'Saúde' || n.title.includes('Hospital'));
        replyText = `De acordo com a cobertura do jornal *${saudeArticle?.source || 'A Crítica'}*, as obras da ala infantil do Hospital Municipal Leste estão em ritmo lento devido a um atraso burocrático no repasse financeiro (executado apenas 42%).

**Recomendação de Atuação:**
- A oposição está capitalizando isso como 'abandono da saúde pública'.
- O gabinete já protocolou um requerimento de fiscalização urgente. Sugiro pautar essa cobrança no plenário de hoje para se antecipar e demonstrar fiscalização ativa antes que a crise se amplie nas redes sociais.`;
      } 
      else if (query.includes('transporte') || query.includes('app') || query.includes('motorista')) {
        const transArticle = currentNews.find((n: any) => n.category === 'Mobilidade' || n.title.includes('transporte'));
        replyText = `A regulamentação do transporte por aplicativos foi sancionada ontem pelo executivo com uma taxa moderada de 1.5% (repassada ao Fundo de Mobilidade).

**Análise de Narrativa:**
- Os motoristas de app aceitaram a taxa pois ela será destinada exclusivamente ao recapeamento asfáltico da periferia, o que melhora o trabalho deles.
- Os taxistas cobram regulação de vistorias mais pesadas.
- **Sugestão de RP:** Criar postagem elogiando o diálogo construtivo que o gabinete promoveu entre os sindicatos.`;
      } 
      else {
        replyText = `Li as matérias monitoradas e o contexto do gabinete. O termo analisado indica relevância moderada.

Gostaria de refinar sua pergunta? Posso responder sobre:
1. Andamento de projetos (PL 123/2026).
2. Fiscalização de obras de saúde (Hospital Leste).
3. Legislações recentes sancionadas (Apps de Mobilidade).`;
      }

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: replyText,
        date: 'Agora mesmo'
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1800);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in flex-1 flex flex-col min-h-0 max-w-4xl mx-auto w-full">
      
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            Bate-papo com Fontes Monitoradas
          </h1>
          <p className="text-zinc-400 mt-2">Questione a inteligência do gabinete e projete cenários políticos com base nas notícias indexadas.</p>
        </div>
      </header>

      {/* Caixa do Chat */}
      <div className="flex-1 glass-panel border border-border rounded-3xl flex flex-col min-h-0 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-primary/5 blur-[60px] rounded-full pointer-events-none"></div>

        {/* Informações da Base de Conhecimento */}
        <div className="px-6 py-3.5 bg-card/30 border-b border-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-500">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Base Ativa: 12 fontes e feed indexado atualizado de hora em hora
          </div>
          <span className="text-zinc-500">Isolado • Sem vazamento de dados</span>
        </div>

        {/* Mensagens */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 min-h-0">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                msg.sender === 'user' 
                ? 'bg-primary/20 text-primary' 
                : 'bg-zinc-800 border border-zinc-700 text-zinc-300'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Brain className="w-4 h-4 text-primary" />}
              </div>
              
              <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.sender === 'user'
                ? 'bg-primary/10 border border-primary/20 text-foreground rounded-tr-none'
                : 'bg-zinc-900/50 border border-border/80 text-zinc-200 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
                <Brain className="w-4 h-4 text-primary animate-pulse" />
              </div>
              <div className="p-4 bg-zinc-900/40 border border-border/50 rounded-2xl rounded-tl-none flex items-center gap-1.5 py-3">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Sugestões de Perguntas Rápidas */}
        {messages.length === 1 && (
          <div className="px-6 py-4 border-t border-border bg-card/10 space-y-2 shrink-0">
            <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Perguntas Recomendadas</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p.text)}
                  className="flex items-center gap-1.5 bg-zinc-900/60 hover:bg-zinc-800/80 border border-border rounded-lg px-3 py-1.5 text-xs text-zinc-300 transition-colors text-left cursor-pointer"
                >
                  <span className="text-[9px] font-bold text-primary bg-primary/10 px-1 py-0.5 rounded uppercase">{p.category}</span>
                  {p.text}
                  <ArrowRight className="w-3 h-3 text-zinc-500" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-border bg-card/20 shrink-0">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="flex gap-2 bg-zinc-900 border border-zinc-700 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-transparent rounded-2xl p-2 transition-all"
          >
            <input 
              type="text" 
              placeholder="Pergunte sobre as matérias e impactos... Ex: PL 123"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-transparent px-3 text-sm focus:outline-none text-foreground placeholder-zinc-500"
            />
            <button 
              type="submit"
              className="p-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-colors shadow-lg shadow-primary/10 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
