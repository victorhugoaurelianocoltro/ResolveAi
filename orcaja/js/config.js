/**
 * ResolveAí — Configuração central (edite aqui antes de publicar)
 * https://resolveai.com.br
 */
const RESOLVEAI_CONFIG = {
  siteName: 'ResolveAí',
  tagline: 'Emergência em casa? Profissional verificado em minutos.',
  domain: 'https://resolveai.com.br',
  defaultCity: 'São Paulo',
  defaultState: 'SP',

  brand: {
    monogram: 'RA',
    slug: 'resolveai',
  },

  copy: {
    heroTitle: 'Emergência em casa? ResolveAí em São Paulo.',
    heroHighlight: 'Triagem grátis em 30 segundos.',
    heroSubtitle:
      'Descreva o problema. Profissionais verificados da sua região respondem no WhatsApp — sem app, sem cadastro longo.',
    ctaPrimary: 'Pedir ajuda agora',
    ctaTriagem: 'Triagem rápida (30s)',
    ctaSecondary: 'Sou profissional — quero aparecer primeiro',
    prestadorCta: 'Apareça quando alguém precisa AGORA',
  },

  seo: {
    cidadeSlug: 'sao-paulo',
  },
  mainNiche: 'eletricista',
  mainNicheLabel: 'Eletricista',
  whatsappAdmin: '5511999999999',
  contactEmail: 'contato@resolveai.com.br',

  /** Cole sua API Key (Maps JavaScript API + Places API ativadas no Google Cloud) */
  googlePlacesApiKey: '',

  googlePlaces: {
    apiKey: '', // opcional: se vazio, usa googlePlacesApiKey acima
    defaultCenter: { lat: -23.5505, lng: -46.6333 },
    locale: 'pt-BR',
  },

  stripe: {
    planoMensal: 'https://buy.stripe.com/SEU_LINK_PLANO_MENSAL',
    destaque30dias: 'https://buy.stripe.com/SEU_LINK_DESTAQUE',
    pacoteLeads10: 'https://buy.stripe.com/SEU_LINK_LEADS_10',
  },

  precos: {
    leadAvulso: 19,
    destaque30dias: 97,
    planoMensal: 149,
  },

  planos: {
    destaque: {
      id: 'destaque',
      nome: 'Destaque 30 dias',
      preco: 97,
      periodo: '30 dias',
      stripeUrlKey: 'destaque30dias',
      destaque: true,
      beneficios: [
        'Primeiro na fila de pedidos urgentes',
        'Selo ★ Prioridade no perfil',
        'Até 3x mais contatos qualificados',
        'Leads direto no seu WhatsApp',
      ],
    },
    mensal: {
      id: 'mensal',
      nome: 'Plano Profissional Mensal',
      preco: 149,
      periodo: 'mês',
      stripeUrlKey: 'planoMensal',
      destaque: true,
      beneficios: [
        'Tudo do Destaque incluso',
        'Perfil otimizado para conversão',
        'Prioridade em pedidos “preciso agora”',
        'Suporte para atualizar serviços',
      ],
    },
    leads: {
      id: 'leads',
      nome: 'Pacote 10 leads',
      preco: 19,
      precoUnitario: true,
      quantidade: 10,
      periodo: 'avulso',
      stripeUrlKey: 'pacoteLeads10',
      destaque: false,
      beneficios: [
        '10 contatos com urgência real',
        'Pague só quando a demanda chegar',
        'Ideal para testar o ResolveAí',
        'Complementa perfil gratuito',
      ],
    },
  },

  permitirPagamentoDemo: true,

  /** Tamanho máximo da foto de perfil (base64) após compressão no admin */
  maxFotoKb: 400,

  admin: {
    pin: '1234',
  },

  ai: {
    assistantName: 'Assistente ResolveAí',
    enabled: true,
    /** Opcional: preencha para respostas via OpenAI (senão usa regras locais) */
    openaiApiKey: '',
    welcomeHint:
      'Triagem grátis em ~30s, profissionais verificados na sua região e retorno no WhatsApp — sem app.',
  },

  atendimento: {
    whatsapp: '', // vazio = usa whatsappAdmin
    horario: 'Atendimento humano: seg–sáb, 8h–20h',
    mensagemPadrao:
      'Olá! Vim pelo Assistente ResolveAí e gostaria de falar com um atendente humano.',
  },

  categorias: [
    { id: 'eletricista', label: 'Eletricista', icon: '⚡', slug: 'eletricista' },
    { id: 'encanador', label: 'Encanador', icon: '🔧', slug: 'encanador' },
    { id: 'tecnico-refrigeracao', label: 'Técnico em refrigeração', icon: '❄️', slug: 'tecnico-refrigeracao' },
    { id: 'chaveiro', label: 'Chaveiro', icon: '🔑', slug: 'chaveiro' },
    { id: 'dedetizador', label: 'Dedetizador', icon: '🛡️', slug: 'dedetizador' },
  ],

  urgenciaOpcoes: [
    { value: 'agora', label: 'Preciso agora (urgente)' },
    { value: 'hoje', label: 'Ainda hoje' },
    { value: 'semana', label: 'Nesta semana' },
  ],

  socialProof: {
    pedidosMes: '2.400+',
    prestadoresAtivos: '180+',
    tempoMedioResposta: '12 min',
    notaMedia: '4,8',
  },

  home: {
    maxCards: null,
    mostrarApenasDestaque: false,
  },
};

if (RESOLVEAI_CONFIG.googlePlacesApiKey && !RESOLVEAI_CONFIG.googlePlaces.apiKey) {
  RESOLVEAI_CONFIG.googlePlaces.apiKey = RESOLVEAI_CONFIG.googlePlacesApiKey;
}

if (RESOLVEAI_CONFIG.atendimento && !RESOLVEAI_CONFIG.atendimento.whatsapp) {
  RESOLVEAI_CONFIG.atendimento.whatsapp = RESOLVEAI_CONFIG.whatsappAdmin;
}

/** Compatibilidade com scripts existentes */
const ORCAJA_CONFIG = RESOLVEAI_CONFIG;

if (typeof module !== 'undefined') module.exports = RESOLVEAI_CONFIG;
