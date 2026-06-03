/**
 * ResolveAí — Base de prestadores (edite aqui)
 *
 * CAMPOS DE CADA PRESTADOR:
 * - id          → único (ex: p1)
 * - slug        → URL do perfil (ex: eletrosp-urgente)
 * - nome        → nome fantasia / profissional
 * - categoria   → id da profissão (ver config.js → categorias)
 * - cidade      → cidade de atuação
 * - bairro      → bairro principal
 * - nota        → 1 a 5
 * - avaliacoes  → número de avaliações
 * - tempoResposta → texto ex: "10 min"
 * - verificado  → true/false
 * - destaque    → true = aparece primeiro (plano pago)
 * - ativo       → false = não exibe no site
 * - whatsapp    → DDI+DDD+número (5511...)
 * - servicos    → trabalhos específicos (não a profissão)
 * - descricao   → frase curta (usada no perfil depois)
 * - googlePlaceId → opcional: ID do Google Business (exibe avaliações reais no perfil)
 */
const ORCAJA_MOCK = {
  prestadores: [
    {
      id: 'p1',
      slug: 'eletrosp-urgente',
      nome: 'EletroSP Urgente',
      categoria: 'eletricista',
      cidade: 'São Paulo',
      bairro: 'Pinheiros',
      nota: 4.9,
      avaliacoes: 127,
      tempoResposta: '8 min',
      anosExperiencia: 12,
      verificado: true,
      destaque: true,
      ativo: true,
      whatsapp: '5511987654321',
      servicos: ['Curto-circuito', 'Quadro elétrico', 'Instalação 220V'],
      descricao: 'Eletricista residencial e comercial com atendimento 24h na zona oeste.',
    },
    {
      id: 'p2',
      slug: 'master-eletrica-24h',
      nome: 'Master Elétrica 24h',
      categoria: 'eletricista',
      cidade: 'São Paulo',
      bairro: 'Moema',
      nota: 4.8,
      avaliacoes: 89,
      tempoResposta: '15 min',
      anosExperiencia: 9,
      verificado: true,
      destaque: true,
      ativo: true,
      whatsapp: '5511976543210',
      servicos: ['Emergência noturna', 'Tomadas e interruptores', 'Aterramento'],
      descricao: 'Equipe própria para condomínios e casas em Moema, Vila Mariana e região.',
    },
    {
      id: 'p3',
      slug: 'climafrio-refrigeracao',
      nome: 'ClimaFrio Refrigeração',
      categoria: 'tecnico-refrigeracao',
      cidade: 'São Paulo',
      bairro: 'Vila Mariana',
      nota: 4.7,
      avaliacoes: 64,
      tempoResposta: '20 min',
      anosExperiencia: 8,
      verificado: true,
      destaque: true,
      ativo: true,
      whatsapp: '5511965432109',
      servicos: ['Instalação de split', 'Manutenção preventiva', 'Carga de gás'],
      descricao: 'Técnico em refrigeração credenciado — instala e conserta ar-condicionado residencial.',
    },
    {
      id: 'p4',
      slug: 'hidraulica-express',
      nome: 'Hidráulica Express',
      categoria: 'encanador',
      cidade: 'São Paulo',
      bairro: 'Tatuapé',
      nota: 4.8,
      avaliacoes: 102,
      tempoResposta: '12 min',
      anosExperiencia: 15,
      verificado: true,
      destaque: true,
      ativo: true,
      whatsapp: '5511954321098',
      servicos: ['Vazamento oculto', 'Desentupimento', 'Troca de registro'],
      descricao: 'Encanador com detecção de vazamento e atendimento rápido na zona leste.',
    },
    {
      id: 'p5',
      slug: 'chaveiro-porta-certa',
      nome: 'Chaveiro Porta Certa',
      categoria: 'chaveiro',
      cidade: 'São Paulo',
      bairro: 'Santana',
      nota: 4.9,
      avaliacoes: 211,
      tempoResposta: '18 min',
      anosExperiencia: 10,
      verificado: true,
      destaque: true,
      ativo: true,
      whatsapp: '5511943210987',
      servicos: ['Abertura de porta', 'Troca de fechadura', 'Chave automotiva'],
      descricao: 'Chaveiro 24h — chega com ferramentas e peças para resolver na hora.',
    },
    {
      id: 'p6',
      slug: 'pragazero-dedetizacao',
      nome: 'PragaZero Dedetização',
      categoria: 'dedetizador',
      cidade: 'São Paulo',
      bairro: 'Brooklin',
      nota: 4.6,
      avaliacoes: 47,
      tempoResposta: '25 min',
      anosExperiencia: 7,
      verificado: true,
      destaque: false,
      ativo: true,
      whatsapp: '5511932109876',
      servicos: ['Baratas e formigas', 'Cupins', 'Desratização'],
      descricao: 'Dedetizador com produtos ANVISA e laudo para condomínios e residências.',
    },
    {
      id: 'p7',
      slug: 'rio-agua-encanamentos',
      nome: 'Rio Água Encanamentos',
      categoria: 'encanador',
      cidade: 'São Paulo',
      bairro: 'Ipiranga',
      nota: 4.5,
      avaliacoes: 38,
      tempoResposta: '22 min',
      anosExperiencia: 6,
      verificado: true,
      destaque: false,
      ativo: true,
      whatsapp: '5511921098765',
      servicos: ['Caixa d\'água', 'Vazamento em banheiro', 'Hidrojato'],
      descricao: 'Encanador para reformas e emergências no Ipiranga e ABC próximo.',
    },
    {
      id: 'p8',
      slug: 'arcool-tecnico',
      nome: 'ArCool Técnico',
      categoria: 'tecnico-refrigeracao',
      cidade: 'São Paulo',
      bairro: 'Perdizes',
      nota: 4.7,
      avaliacoes: 55,
      tempoResposta: '30 min',
      anosExperiencia: 11,
      verificado: true,
      destaque: false,
      ativo: true,
      whatsapp: '5511910987654',
      servicos: ['Limpeza de split', 'Instalação inverter', 'Conserto de compressor'],
      descricao: 'Técnico em refrigeração especializado em manutenção e instalação de splits.',
    },
    {
      id: 'p9',
      slug: 'volts-eletricistas',
      nome: 'Volts & Cia Eletricistas',
      categoria: 'eletricista',
      cidade: 'São Paulo',
      bairro: 'Lapa',
      nota: 4.6,
      avaliacoes: 41,
      tempoResposta: '25 min',
      anosExperiencia: 5,
      verificado: true,
      destaque: false,
      ativo: true,
      whatsapp: '5511909876543',
      servicos: ['Iluminação LED', 'Ventilador de teto', 'Chuveiro elétrico'],
      descricao: 'Eletricista para pequenos reparos e instalações na zona oeste e Lapa.',
    },
    {
      id: 'p10',
      slug: 'abrefacil-chaveiro',
      nome: 'AbreFácil Chaveiro',
      categoria: 'chaveiro',
      cidade: 'São Paulo',
      bairro: 'Penha',
      nota: 4.5,
      avaliacoes: 29,
      tempoResposta: '20 min',
      anosExperiencia: 4,
      verificado: false,
      destaque: false,
      ativo: true,
      whatsapp: '5511898765432',
      servicos: ['Cópia de chave', 'Cofre', 'Portão automático'],
      descricao: 'Chaveiro na zona leste com preço transparente antes de ir ao local.',
    },
  ],

  depoimentos: [
    {
      nome: 'Mariana S.',
      bairro: 'Tatuapé',
      texto: 'Pedi orçamento às 22h e em 10 minutos já tinha eletricista na porta. Salvou minha noite.',
      servico: 'Eletricista',
      estrelas: 5,
    },
    {
      nome: 'Carlos R.',
      bairro: 'Santana',
      texto: 'Comparei três profissionais verificados sem ligar para dezenas de anúncios. Muito prático.',
      servico: 'Encanador',
      estrelas: 5,
    },
    {
      nome: 'Fernanda L.',
      bairro: 'Brooklin',
      texto: 'O técnico em refrigeração instalou o split no mesmo dia. Selo verificado fez diferença.',
      servico: 'Técnico em refrigeração',
      estrelas: 5,
    },
    {
      nome: 'Roberto M.',
      bairro: 'Moema',
      texto: 'Fiquei trancado fora de casa. O chaveiro chegou em 20 minutos, sem taxa escondida.',
      servico: 'Chaveiro',
      estrelas: 5,
    },
    {
      nome: 'Patrícia A.',
      bairro: 'Pinheiros',
      texto: 'Dedetizador pontual, explicou o processo e deixou o apartamento pronto para voltar.',
      servico: 'Dedetizador',
      estrelas: 5,
    },
  ],

  seoCategorias: {
    eletricista: {
      h1: 'Eletricista em São Paulo',
      intro: 'Compare eletricistas verificados, veja avaliações e receba orçamento grátis em minutos. Atendimento urgente na capital.',
      textoSeo:
        'Precisa de eletricista em São Paulo com resposta rápida? No ResolveAí você encontra profissionais com selo Verificado e opção Destaque para quem precisa de atendimento ainda hoje — curto-circuito, quadro elétrico, tomadas e emergências 24h.',
    },
    encanador: {
      h1: 'Encanador em São Paulo',
      intro: 'Encanadores verificados para vazamento, desentupimento e emergências. Orçamento sem custo para você.',
      textoSeo:
        'Vazou cano ou entupiu o ralo? Nossa lista de encanadores em São Paulo prioriza quem responde rápido e já passou por checagem de documentos e avaliações de clientes reais.',
    },
    'tecnico-refrigeracao': {
      h1: 'Técnico em refrigeração em São Paulo',
      intro: 'Quem instala e conserta ar-condicionado — técnicos verificados para instalação, manutenção e carga de gás.',
      textoSeo:
        'Procurando técnico em refrigeração em São Paulo? Aqui não é “serviço de ar” genérico: são profissionais da área que instalam split, fazem manutenção preventiva e resolvem equipamento sem refrigeração.',
    },
    chaveiro: {
      h1: 'Chaveiro em São Paulo',
      intro: 'Chaveiros 24h para abertura de porta, troca de fechadura e cópias. Orçamento grátis pelo ResolveAí.',
      textoSeo:
        'Ficou trancado para fora? Chaveiros em São Paulo listados no ResolveAí informam tempo médio de chegada e trabalham com transparência — ideal para urgência em casa ou condomínio.',
    },
    dedetizador: {
      h1: 'Dedetizador em São Paulo',
      intro: 'Dedetizadores verificados para baratas, cupins e desratização. Peça orçamento sem compromisso.',
      textoSeo:
        'Controle de pragas com dedetizador profissional em São Paulo. Compare perfis, leia avaliações e escolha quem oferece laudo e produtos regulamentados quando necessário.',
    },
  },

  faq: [
    {
      pergunta: 'O ResolveAí cobra do cliente final?',
      resposta: 'Não. Pedir orçamento é 100% gratuito para quem precisa do serviço. Você só paga o profissional que escolher, diretamente com ele.',
    },
    {
      pergunta: 'Quanto tempo leva para receber contato?',
      resposta: 'Na maioria dos pedidos urgentes em São Paulo, o primeiro retorno chega em menos de 15 minutos, via WhatsApp ou telefone.',
    },
    {
      pergunta: 'Os prestadores são verificados?',
      resposta: 'Sim. Analisamos documentos, histórico e avaliações antes de exibir o selo Verificado. Prestadores em Destaque pagam para aparecer primeiro, mas também passam por checagem.',
    },
    {
      pergunta: 'Qual a diferença entre Verificado e Destaque?',
      resposta: 'Verificado significa que passou na nossa checagem. Destaque é um plano pago que coloca o profissional no topo da lista — ideal para quem quer mais leads.',
    },
    {
      pergunta: 'Funciona para qual cidade?',
      resposta: 'Estamos com foco total em São Paulo e Grande SP. Em breve expandimos para outras capitais.',
    },
    {
      pergunta: 'Sou prestador. Como apareço primeiro?',
      resposta: 'Cadastre-se em Anunciar minha empresa. Planos com Destaque colocam seu perfil no topo da busca e aumentam leads qualificados.',
    },
  ],
};

/** Lista ativa: destaque primeiro, depois maior nota */
ORCAJA_MOCK.getPrestadoresAtivos = function (opts) {
  const limite = (opts && opts.limite) || null;
  const soDestaque = opts && opts.soDestaque;

  let lista = (ORCAJA_MOCK.prestadores || []).filter((p) => p.ativo !== false);

  if (soDestaque) lista = lista.filter((p) => p.destaque);

  lista.sort((a, b) => {
    if (a.destaque !== b.destaque) return a.destaque ? -1 : 1;
    return b.nota - a.nota;
  });

  if (limite) lista = lista.slice(0, limite);
  return lista;
};

ORCAJA_MOCK.getPrestadorById = function (id) {
  return (ORCAJA_MOCK.prestadores || []).find((p) => p.id === id && p.ativo !== false);
};

ORCAJA_MOCK.getPrestadorBySlug = function (slug) {
  return (ORCAJA_MOCK.prestadores || []).find((p) => p.slug === slug && p.ativo !== false);
};

ORCAJA_MOCK.getPrestadorByIdAdmin = function (id) {
  return (ORCAJA_MOCK.prestadores || []).find((p) => p.id === id);
};

/** Compatibilidade com código antigo */
ORCAJA_MOCK.prestadoresDestaque = ORCAJA_MOCK.getPrestadoresAtivos({ soDestaque: true });

/** Aplica lista editada pelo painel admin (localStorage) */
(function aplicarPrestadoresAdmin() {
  const KEY = 'orcaja_prestadores_admin';
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const lista = JSON.parse(raw);
    if (Array.isArray(lista) && lista.length > 0) {
      ORCAJA_MOCK.prestadores = lista;
      ORCAJA_MOCK.prestadoresDestaque = ORCAJA_MOCK.getPrestadoresAtivos({ soDestaque: true });
    }
  } catch (e) {
    console.warn('ResolveAí: erro ao carregar prestadores do admin', e);
  }
})();

if (typeof module !== 'undefined') module.exports = ORCAJA_MOCK;
