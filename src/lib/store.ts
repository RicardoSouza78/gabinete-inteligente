// Store de Persistência Local e Integração de Dados
// Permite que mudanças em qualquer painel administrativo reflitam imediatamente em outras telas e no app do vereador.

const IS_BROWSER = typeof window !== 'undefined';

// --- SEED DATA ---

const DEFAULT_SOURCES = [
  { id: 1, name: 'Portal da CMM', url: 'https://cmm.am.gov.br', category: 'Câmara', status: 'ativo', priority: 5, lastRead: 'Há 2h', errorRate: 0, botFrequency: '1h' },
  { id: 2, name: 'A Crítica', url: 'https://acritica.com/politica', category: 'Jornal', status: 'ativo', priority: 4, lastRead: 'Há 5h', errorRate: 2, botFrequency: '1h' },
  { id: 3, name: 'BNC Amazonas', url: 'https://bncamazonas.com.br', category: 'Blog', status: 'ativo', priority: 3, lastRead: 'Há 12h', errorRate: 5, botFrequency: '2h' },
  { id: 4, name: 'Em Tempo', url: 'https://emtempo.com.br/politica', category: 'Portal', status: 'pausado', priority: 2, lastRead: 'Há 3 dias', errorRate: 15, botFrequency: '4h' },
];

const DEFAULT_NEWS = [
  {
    id: 1,
    title: 'Câmara aprova parecer sobre zoneamento comercial e ambiental na Zona Leste',
    url: 'https://cmm.am.gov.br/noticias/pl-zoneamento-leste',
    source: 'Portal da CMM',
    category: 'Zoneamento',
    date: 'Hoje, 09:30',
    sentiment: 'Positivo',
    relevance: 88,
    impact: 'Alto',
    readStatus: false,
    summary: 'A Comissão de Urbanismo aprovou por unanimidade o novo regramento urbanístico para a Zona Leste, visando fomentar o comércio local enquanto protege as bacias hidrográficas locais contra o adensamento irregular.',
    keyPoints: [
      'Criação de corredor comercial na Av. das Torres.',
      'Exigência de 20% de área verde preservada para novos loteamentos.',
      'Aprovada emenda que restringe indústrias poluentes na proximidade dos igarapés.',
      'Regra incentiva instalação de microempresas familiares.',
      'Texto segue para votação em plenário nesta tarde.'
    ],
    entities: [
      { name: 'Vereador Marcelo Silva', type: 'Pessoa' },
      { name: 'Secretaria de Urbanismo', type: 'Empresa' },
      { name: 'Zona Leste', type: 'Local' }
    ],
    linkedArticles: [
      'Empresários apoiam incentivo fiscal na Zona Leste',
      'Ambientalistas pressionam por maior proteção aos igarapés'
    ],
    biasAnalysis: {
      sourceA: 'Portal da CMM (Oficial)',
      headlineA: 'Comissão avança com plano verde e comercial para a Zona Leste',
      slantA: 'Foco técnico, institucional e com viés positivo focado nas diretrizes ecológicas da prefeitura.',
      sourceB: 'A Crítica (Independente)',
      headlineB: 'Emenda sob pressão comercial ameaça trechos florestais na Zona Leste',
      slantB: 'Tom crítico, focando na pressão exercida por incorporadoras imobiliárias sobre as cotas verdes.'
    },
    comments: [
      { author: 'Maria Clara', role: 'Assessora de Imprensa', text: 'Excelente matéria para publicarmos no Instagram! @Joao, prepare um card focado no viés positivo das áreas verdes.', date: 'Há 1h' }
    ]
  },
  {
    id: 2,
    title: 'Secretaria de Saúde investiga lentidão e falta de insumos em obras no Hospital Leste',
    url: 'https://acritica.com/politica/obras-hospital-leste-atraso',
    source: 'A Crítica',
    category: 'Saúde',
    date: 'Hoje, 07:15',
    sentiment: 'Negativo',
    relevance: 92,
    impact: 'Alto',
    readStatus: false,
    summary: 'Denúncias de moradores expõem paralisação na reforma da ala pediátrica do Hospital Municipal Leste. Obras encontram-se atrasadas por falta de repasse e problemas com fornecedores licitados.',
    keyPoints: [
      'Reforma da ala infantil está paralisada há 15 dias.',
      'Falta de repasse financeiro de 42% da segunda parcela contratual.',
      'Mães relatam transferência de crianças para postos distantes.',
      'Secretaria de Saúde alega pendências burocráticas da construtora.',
      'Gabinete protocolou requerimento de informações urgentes.'
    ],
    entities: [
      { name: 'Hospital Municipal Leste', type: 'Local' },
      { name: 'Secretaria Municipal de Saúde', type: 'Empresa' },
      { name: 'Construtora Forte Ltda', type: 'Empresa' }
    ],
    linkedArticles: [
      'Orçamento da Saúde municipal cresce 5% em 2026',
      'Vereador fiscaliza hospitais da Zona Norte em vistoria surpresa'
    ],
    biasAnalysis: {
      sourceA: 'A Crítica',
      headlineA: 'Falta de verba paralisa ampliação infantil do Hospital Leste',
      slantA: 'Linguagem contundente focada no prejuízo social e inércia do poder público local.',
      sourceB: 'BNC Amazonas',
      headlineB: 'Secretaria apura ajustes técnicos na obra do Hospital Leste',
      slantB: 'Linguagem conciliadora e protocolar, atenuando a paralisação como um ajuste burocrático.'
    },
    comments: [
      { author: 'Rodrigo', role: 'Assessor Político', text: 'Esta matéria é de alto impacto negativo para a imagem da prefeitura. Devemos intensificar a fiscalização regimental e usar isso na tribuna.', date: 'Há 3h' }
    ]
  },
  {
    id: 3,
    title: 'Prefeito sanciona regulamentação do transporte por aplicativos com taxa social',
    url: 'https://bncamazonas.com.br/transporte-apps-sancionado',
    source: 'BNC Amazonas',
    category: 'Mobilidade',
    date: 'Ontem',
    sentiment: 'Neutro',
    relevance: 75,
    impact: 'Médio',
    readStatus: true,
    summary: 'A nova lei estipula uma taxa de 1.5% sobre as corridas por aplicativo, revertendo todo o valor coletado para a melhoria de sinalização e pavimentação asfáltica nos bairros periféricos.',
    keyPoints: [
      'Cobrança de 1.5% por corrida começa em 30 dias.',
      'Recursos destinados exclusivamente ao Fundo de Mobilidade Urbana.',
      'Isenção de taxas para motoristas elétricos ou híbridos.',
      'Associação dos motoristas aprova, mas pede fiscalização de clandestinos.',
      'Taxistas cobram fiscalização igualitária de vistorias.'
    ],
    entities: [
      { name: 'Associação dos Motoristas de App', type: 'Empresa' },
      { name: 'Sindicato dos Taxistas', type: 'Empresa' }
    ],
    linkedArticles: [
      'Prefeitura promete asfalto em 40 ruas da periferia este mês'
    ],
    biasAnalysis: {
      sourceA: 'BNC Amazonas',
      headlineA: 'Lei sancionada promete asfalto novo gerado por corridas de App',
      slantA: 'Viés de benefício público, destacando a destinação da verba para pavimentação.',
      sourceB: 'A Crítica',
      headlineB: 'Lei de Apps desagrada taxistas e gera dúvidas sobre repasse real',
      slantB: 'Foco na insatisfação do sindicato dos taxistas e desconfiança sobre a aplicação do fundo.'
    },
    comments: []
  }
];

const DEFAULT_DOSSIERS = [
  {
    id: 1,
    title: 'PL 123/2026 - Zoneamento Urbano',
    category: 'Zoneamento',
    status: 'Crítico',
    date: '01 Jun 2026',
    author: 'Assessoria Legislativa',
    urgency: true,
    description: 'Este projeto de lei visa redefinir o zoneamento comercial e residencial da Zona Leste. A oposição articula emendas para reduzir o percentual de áreas verdes exigidas em novos empreendimentos imobiliários, o que tem gerado atrito com movimentos ambientalistas e com a base do governo.',
    summary: 'Análise estratégica do Plano de Zoneamento Urbano com foco no adensamento populacional da Zona Leste e emendas propostas pela oposição.',
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
      { name: 'Analise_Impacto_Zona_Leste.pdf', size: '1.1 MB' }
    ],
    stakeholders: [
      { name: 'Vereador Marcelo Silva', role: 'Relator na Comissão', stance: 'Favorável' },
      { name: 'Vereadora Sandra Lima', role: 'Líder da Oposição', stance: 'Contrário' }
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
    description: 'Relatório consolidado sobre as obras do Hospital Municipal Leste. Há indícios de lentidão no repasse da segunda parcela por parte do executivo, o que ameaça a data de entrega original prevista para julho.',
    summary: 'Dossiê técnico sobre a execução orçamentária, prazos contratuais e denúncias de paralisação nas obras de ampliação da ala infantil.',
    keyPoints: [
      'Execução orçamentária atual em 42% do planejado.',
      'Atraso na contratação da empresa terceirizada de climatização.',
      'Vereador cobrou esclarecimentos oficiais via requerimento nº 405/2026.'
    ],
    timeline: [
      { date: '25 Mai 2026', event: 'Requerimento de informações enviado à Sec. de Saúde' }
    ],
    documents: [
      { name: 'Contrato_Licitatorio_HML.pdf', size: '5.6 MB' }
    ],
    stakeholders: [
      { name: 'Secretário Executivo de Saúde', role: 'Gestor da Pasta', stance: 'Neutro' }
    ]
  }
];

const DEFAULT_DEMANDS = [
  { 
    id: 1, 
    title: 'Buraco Crítico na Avenida Grande Circular', 
    description: 'Cratera profunda na faixa da direita logo após a rotatória, causando freadas bruscas e risco iminente de acidentes de trânsito.', 
    citizen: 'Carlos Eduardo Lima', 
    phone: '(92) 98122-3344',
    neighborhood: 'São José', 
    priority: 'Alta', 
    status: 'Novo', 
    date: '31 Mai 2026' 
  },
  { 
    id: 2, 
    title: 'Falta de Medicamentos Básicos na UBS 12', 
    description: 'Cidadãos relatam desabastecimento de insulina e remédios de controle de pressão arterial há mais de duas semanas na unidade de saúde.', 
    citizen: 'Maria do Socorro Ramos', 
    phone: '(92) 99244-5566',
    neighborhood: 'Jorge Teixeira', 
    priority: 'Alta', 
    status: 'Em Análise', 
    date: '29 Mai 2026' 
  },
  { 
    id: 3, 
    title: 'Poste Sem Luz há 3 Semanas', 
    description: 'Rua inteira às escuras na quadra 14, facilitando assaltos no horário de retorno de estudantes e trabalhadores no período noturno.', 
    citizen: 'José Ribamar Silva', 
    phone: '(92) 98455-7788',
    neighborhood: 'Zumbi', 
    priority: 'Média', 
    status: 'Em Análise', 
    date: '28 Mai 2026' 
  }
];

const DEFAULT_ROADMAP = [
  { id: 1, title: 'Integração e Alertas no WhatsApp da Equipe', description: 'Permite enviar alertas automatizados de pauta diretamente no WhatsApp dos assessores e vereadores.', votes: 24, status: 'Em Desenvolvimento' },
  { id: 2, title: 'Exportador para PDF de Relatórios Semanais', description: 'Gera um PDF diagramado profissionalmente reunindo o compilado das notícias e o termômetro político semanal.', votes: 42, status: 'Planejado' },
  { id: 3, title: 'Importação automática de Diário Oficial', description: 'Monitora os Diários Oficiais do Município em busca de nomeações e decretos de interesse político.', votes: 15, status: 'Ideia' },
  { id: 4, title: 'Robô de Transcrição de Áudio de Sessões Plenárias', description: 'Usa IA para degravar instantaneamente a fala dos vereadores nos discursos ao vivo do YouTube.', votes: 31, status: 'Planejado' }
];

const DEFAULT_COMPETITORS = [
  { name: 'Nosso Mandato', mentions: 64, sentiment: 'Positivo', color: 'var(--primary)' },
  { name: 'Vereadora Sandra Lima (Oposição)', mentions: 45, sentiment: 'Neutro', color: '#f59e0b' },
  { name: 'Vereador Marcelo Silva (Independente)', mentions: 38, sentiment: 'Positivo', color: '#10b981' },
  { name: 'Prefeitura (Executivo)', mentions: 92, sentiment: 'Negativo', color: '#ef4444' }
];

const DEFAULT_BULLETIN = {
  date: '01 Jun 2026',
  published: true,
  summary: 'Sessão tensa prevista devido ao veto do executivo no repasse da ala infantil e debates do zoneamento. Base aliada desarticulada e oposição promete obstrução a partir das 10h.',
  relevanceScore: 75,
  headlines: [
    { title: 'Prefeito decreta emergência na Zona Leste após fortes chuvas.', source: 'A Crítica', time: 'Há 2h' },
    { title: 'CMM vota hoje PL 123 que regulamenta zoneamento urbano.', source: 'Portal da CMM', time: 'Há 3h' }
  ]
};

const DEFAULT_AGENDA = [
  { id: 1, time: '09:00', title: 'Sessão Plenária', location: 'Plenário Adriano Jorge' },
  { id: 2, time: '14:30', title: 'Reunião Lideranças Zona Leste', location: 'Sala de Comissões' },
  { id: 3, time: '17:00', title: 'Entrevista Rádio Difusora', location: 'Estúdio Central' }
];

const DEFAULT_DIARIO = [
  {
    id: 1,
    date: '31 Mai 2026',
    edition: 'Edição Nº 5.412',
    type: 'Nomeação',
    title: 'Nomeação de Diretores na Secretaria Municipal de Saúde',
    excerpt: 'O Prefeito de Manaus, no uso de suas atribuições legais, resolve nomear para o cargo em comissão de Diretor de Atenção Primária os senhores: Dr. Paulo Henrique Martins e Dra. Ana Lima Sóstenes.',
    relevance: 92,
    entities: ['Dr. Paulo Henrique Martins', 'Dra. Ana Lima Sóstenes', 'Secretaria de Saúde'],
    keywords: ['nomeação', 'saúde', 'atenção primária'],
    read: false,
    savedToDossier: false
  },
  {
    id: 2,
    date: '31 Mai 2026',
    edition: 'Edição Nº 5.412',
    type: 'Decreto',
    title: 'Decreto Nº 4.831 - Estado de Emergência na Zona Leste',
    excerpt: 'Decreta-se estado de emergência pública nos bairros da Zona Leste afetados pelas chuvas de maio, autorizando a mobilização imediata de recursos da Defesa Civil e Secretaria de Obras.',
    relevance: 99,
    entities: ['Zona Leste', 'Defesa Civil', 'Secretaria de Obras'],
    keywords: ['emergência', 'chuvas', 'zona leste', 'decreto'],
    read: false,
    savedToDossier: false
  },
  {
    id: 3,
    date: '30 Mai 2026',
    edition: 'Edição Nº 5.411',
    type: 'Licitação',
    title: 'Abertura de Licitação para Transporte Escolar Municipal',
    excerpt: 'A Secretaria Municipal de Educação torna público a abertura de processo licitatório na modalidade Pregão Eletrônico para contratação de serviços de transporte escolar, valor estimado R$ 12,4 milhões.',
    relevance: 78,
    entities: ['Secretaria de Educação', 'Pregão Eletrônico'],
    keywords: ['licitação', 'transporte escolar', 'educação'],
    read: false,
    savedToDossier: false
  },
  {
    id: 4,
    date: '30 Mai 2026',
    edition: 'Edição Nº 5.411',
    type: 'Contrato',
    title: 'Aditivo Contratual — Obras do Hospital Municipal Leste',
    excerpt: 'Fica firmado o 2º Termo Aditivo ao Contrato nº 078/2025 para execução das obras de ampliação da ala infantil do Hospital Municipal Leste, prorrogando o prazo por 90 (noventa) dias, até 30/09/2026.',
    relevance: 95,
    entities: ['Hospital Municipal Leste', 'Secretaria de Saúde'],
    keywords: ['contrato', 'hospital', 'aditivo', 'obras'],
    read: true,
    savedToDossier: true
  },
  {
    id: 5,
    date: '29 Mai 2026',
    edition: 'Edição Nº 5.410',
    type: 'Portaria',
    title: 'Portaria SMS nº 198 — Regulamentação das UBSs',
    excerpt: 'A Secretaria Municipal de Saúde regulamenta o funcionamento das Unidades Básicas de Saúde do município, estabelecendo critérios de atendimento preferêncial e grades de especialidades cobertas por zona geográfica.',
    relevance: 85,
    entities: ['Secretaria de Saúde', 'UBS', 'Zona Leste'],
    keywords: ['portaria', 'ubs', 'saúde', 'atendimento'],
    read: false,
    savedToDossier: false
  }
];

// --- CORE STORE CLASS ---

class CentralStore {
  private data: Record<string, any> = {};

  constructor() {
    this.init();
  }

  private init() {
    if (!IS_BROWSER) {
      this.data = {
        sources: DEFAULT_SOURCES,
        news: DEFAULT_NEWS,
        dossiers: DEFAULT_DOSSIERS,
        demands: DEFAULT_DEMANDS,
        roadmap: DEFAULT_ROADMAP,
        competitors: DEFAULT_COMPETITORS,
        bulletin: DEFAULT_BULLETIN,
        agenda: DEFAULT_AGENDA,
        theme: 'dark'
      };
      return;
    }

    // Load or initialize
    const load = (key: string, def: any) => {
      try {
        const val = localStorage.getItem(`gi_${key}`);
        return val ? JSON.parse(val) : def;
      } catch (e) {
        return def;
      }
    };

    this.data = {
      sources: load('sources', DEFAULT_SOURCES),
      news: load('news', DEFAULT_NEWS),
      dossiers: load('dossiers', DEFAULT_DOSSIERS),
      demands: load('demands', DEFAULT_DEMANDS),
      roadmap: load('roadmap', DEFAULT_ROADMAP),
      competitors: load('competitors', DEFAULT_COMPETITORS),
      bulletin: load('bulletin', DEFAULT_BULLETIN),
      agenda: load('agenda', DEFAULT_AGENDA),
      diario: load('diario', DEFAULT_DIARIO),
      theme: load('theme', 'dark')
    };

    // Apply theme on load
    if (this.data.theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }

  private save(key: string) {
    if (IS_BROWSER) {
      try {
        localStorage.setItem(`gi_${key}`, JSON.stringify(this.data[key]));
        // Trigger generic storage event for same-page updates
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.error('Falha ao salvar no localStorage', e);
      }
    }
  }

  // Generic Get/Set
  public get(key: string) {
    return this.data[key];
  }

  // Theme Management
  public getTheme() {
    return this.data.theme;
  }

  public setTheme(theme: 'light' | 'dark') {
    this.data.theme = theme;
    this.save('theme');
    if (IS_BROWSER) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }

  public addSource(source: any) {
    const newSource = {
      id: Date.now() + Math.floor(Math.random() * 10000),
      status: 'ativo',
      errorRate: 0,
      botFrequency: '1h',
      lastRead: 'Recém-adicionado',
      priority: 3,
      ...source
    };
    this.data.sources = [newSource, ...this.data.sources];
    this.save('sources');
    return newSource;
  }

  public deleteSource(id: number) {
    this.data.sources = this.data.sources.filter((s: any) => s.id !== id);
    this.save('sources');
  }

  public updateSource(id: number, fields: any) {
    this.data.sources = this.data.sources.map((s: any) => 
      s.id === id ? { ...s, ...fields } : s
    );
    this.save('sources');
  }

  // News CRUD & Actions
  public addNews(item: any) {
    const newItem = {
      id: Date.now(),
      readStatus: false,
      date: 'Agora mesmo',
      relevance: Math.floor(Math.random() * 40) + 60, // 60-100
      impact: 'Médio',
      keyPoints: [
        'Análise inicial coletada automaticamente.',
        'Robô indexou e processou os parágrafos.',
        'Sentimento estimado com base em regras semânticas.'
      ],
      entities: [],
      linkedArticles: [],
      comments: [],
      ...item
    };
    this.data.news = [newItem, ...this.data.news];
    this.save('news');
    return newItem;
  }

  public toggleNewsRead(id: number) {
    this.data.news = this.data.news.map((n: any) => 
      n.id === id ? { ...n, readStatus: !n.readStatus } : n
    );
    this.save('news');
  }

  public addCommentToNews(newsId: number, comment: string) {
    this.data.news = this.data.news.map((n: any) => {
      if (n.id === newsId) {
        return {
          ...n,
          comments: [
            ...n.comments,
            {
              author: 'Assessor Geral',
              role: 'Co-gestor',
              text: comment,
              date: 'Agora mesmo'
            }
          ]
        };
      }
      return n;
    });
    this.save('news');
  }

  // Dossiers CRUD
  public addDossier(dossier: any) {
    const newD = {
      id: Date.now(),
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
      author: 'Assessoria de Gabinete',
      urgency: dossier.status === 'Crítico',
      keyPoints: ['Ponto de análise inicial cadastrado.'],
      timeline: [{ date: 'Hoje', event: 'Dossiê criado no sistema' }],
      documents: [],
      stakeholders: [],
      ...dossier
    };
    this.data.dossiers = [newD, ...this.data.dossiers];
    this.save('dossiers');
    return newD;
  }

  public deleteDossier(id: number) {
    this.data.dossiers = this.data.dossiers.filter((d: any) => d.id !== id);
    this.save('dossiers');
  }

  public updateDossier(id: number, fields: any) {
    this.data.dossiers = this.data.dossiers.map((d: any) =>
      d.id === id ? { ...d, ...fields } : d
    );
    this.save('dossiers');
  }

  // Demands CRUD
  public addDemand(demand: any) {
    const newD = {
      id: Date.now(),
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
      ...demand
    };
    this.data.demands = [newD, ...this.data.demands];
    this.save('demands');
    return newD;
  }

  public updateDemandStatus(id: number, status: string) {
    this.data.demands = this.data.demands.map((d: any) => 
      d.id === id ? { ...d, status } : d
    );
    this.save('demands');
  }

  public deleteDemand(id: number) {
    this.data.demands = this.data.demands.filter((d: any) => d.id !== id);
    this.save('demands');
  }

  // Bulletin AI update
  public updateBulletin(bulletin: any) {
    this.data.bulletin = {
      ...this.data.bulletin,
      ...bulletin
    };
    this.save('bulletin');
  }

  // Roadmap Upvotes
  public upvoteRoadmap(id: number) {
    this.data.roadmap = this.data.roadmap.map((item: any) => 
      item.id === id ? { ...item, votes: item.votes + 1 } : item
    );
    this.save('roadmap');
  }

  public addRoadmapSuggestion(title: string, description: string) {
    const newR = {
      id: Date.now(),
      title,
      description,
      votes: 1,
      status: 'Ideia'
    };
    this.data.roadmap = [...this.data.roadmap, newR];
    this.save('roadmap');
    return newR;
  }
  // Diário Oficial CRUD
  public getDiario() {
    return this.data.diario || [];
  }

  public markDiarioRead(id: number) {
    this.data.diario = this.data.diario.map((d: any) =>
      d.id === id ? { ...d, read: true } : d
    );
    this.save('diario');
  }

  public markDiarioSavedToDossier(id: number) {
    this.data.diario = this.data.diario.map((d: any) =>
      d.id === id ? { ...d, savedToDossier: true, read: true } : d
    );
    this.save('diario');
  }

  public deleteDiarioEntry(id: number) {
    this.data.diario = this.data.diario.filter((d: any) => d.id !== id);
    this.save('diario');
  }

  public addDiarioEntry(entry: any) {
    const newEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
      edition: 'Edição Manual',
      read: false,
      savedToDossier: false,
      ...entry
    };
    this.data.diario = [newEntry, ...this.data.diario];
    this.save('diario');
    return newEntry;
  }
}

export const store = new CentralStore();
