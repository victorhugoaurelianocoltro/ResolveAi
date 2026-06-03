/**
 * ResolveAí — Assistente de ajuda (regras locais + handoff humano)
 */
(function () {
  'use strict';

  const cfg = typeof ORCAJA_CONFIG !== 'undefined' ? ORCAJA_CONFIG : {};
  const aiCfg = cfg.ai || {};
  const atendCfg = cfg.atendimento || {};
  const assistantName = aiCfg.assistantName || 'Assistente ResolveAí';

  const messagesEl = document.getElementById('chat-messages');
  const formEl = document.getElementById('chat-form');
  const inputEl = document.getElementById('chat-input');
  const chipsEl = document.getElementById('quick-chips');
  const btnHumano = document.getElementById('btn-humano');
  const horarioEl = document.getElementById('atendimento-horario');

  const history = [];
  let isTyping = false;

  function normalize(text) {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function getWhatsAppNum() {
    const raw = atendCfg.whatsapp || cfg.whatsappAdmin || '';
    return String(raw).replace(/\D/g, '');
  }

  function getChatContextSummary() {
    const userLines = history
      .filter((m) => m.role === 'user')
      .slice(-4)
      .map((m) => `• ${m.text}`);
    if (!userLines.length) return '';
    return userLines.join('\n');
  }

  function buildHumanWhatsAppUrl() {
    const num = getWhatsAppNum();
    if (!num) return null;
    const base = atendCfg.mensagemPadrao || 'Olá! Preciso de ajuda pelo ResolveAí.';
    const ctx = getChatContextSummary();
    const msg = ctx ? `${base}\n\nO que conversei no assistente:\n${ctx}` : base;
    return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
  }

  function scrollToBottom() {
    if (!messagesEl) return;
    requestAnimationFrame(() => {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatBotHtml(text) {
    const safe = escapeHtml(text);
    return safe
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  function appendMessage(role, text, opts) {
    if (!messagesEl || !text) return;
    const wrap = document.createElement('div');
    wrap.className = `ajuda-msg ajuda-msg--${role}`;
    const bubble = document.createElement('div');
    bubble.className = 'ajuda-msg__bubble';
    if (role === 'bot') {
      bubble.innerHTML = formatBotHtml(text);
      if (opts && opts.actions) {
        const actions = document.createElement('div');
        actions.className = 'ajuda-msg__actions';
        opts.actions.forEach((a) => {
          const link = document.createElement('a');
          link.href = a.href;
          link.className = 'ajuda-msg__action-link';
          link.textContent = a.label;
          if (a.external) {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
          }
          actions.appendChild(link);
        });
        bubble.appendChild(actions);
      }
    } else {
      bubble.textContent = text;
    }
    wrap.appendChild(bubble);
    messagesEl.appendChild(wrap);
    history.push({ role, text, at: Date.now() });
    scrollToBottom();
  }

  function showTyping() {
    if (!messagesEl || isTyping) return;
    isTyping = true;
    const el = document.createElement('div');
    el.className = 'ajuda-msg ajuda-msg--bot ajuda-msg--typing';
    el.id = 'typing-indicator';
    el.innerHTML =
      '<div class="ajuda-msg__bubble"><span class="ajuda-typing"><span></span><span></span><span></span></span></div>';
    messagesEl.appendChild(el);
    scrollToBottom();
  }

  function hideTyping() {
    isTyping = false;
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
  }

  function detectServico(text) {
    const n = normalize(text);
    const cats = cfg.categorias || [];
    for (const c of cats) {
      const slug = normalize(c.slug || c.id || '');
      const label = normalize(c.label || '');
      if (n.includes(slug) || n.includes(label)) return c;
    }
    const aliases = [
      { keys: ['eletric', 'tomada', 'disjuntor', 'luz', 'curto'], id: 'eletricista' },
      { keys: ['encan', 'vazamento', 'cano', 'pia', 'vaso', 'agua'], id: 'encanador' },
      { keys: ['chave', 'fechadura', 'porta tranc'], id: 'chaveiro' },
      { keys: ['ar cond', 'geladeira', 'refrig', 'freezer'], id: 'tecnico-refrigeracao' },
      { keys: ['dedetiz', 'barata', 'cupim', 'praga'], id: 'dedetizador' },
    ];
    for (const a of aliases) {
      if (a.keys.some((k) => n.includes(k))) {
        return cats.find((c) => c.id === a.id) || { id: a.id, label: a.id };
      }
    }
    return null;
  }

  function getCategoriaPageUrl(catId) {
    const slug = cfg.seo && cfg.seo.cidadeSlug ? cfg.seo.cidadeSlug : 'sao-paulo';
    return `${catId}-em-${slug}.html`;
  }

  function buildLeadUrl(servico) {
    let url = 'index.html#form-orcamento';
    if (servico && servico.id) {
      url += `?servico=${encodeURIComponent(servico.id)}`;
    }
    return url;
  }

  function matchIntent(text) {
    const n = normalize(text);
    if (!n) return 'empty';

    if (
      /\b(humano|atendente|pessoa|gente|operador|falar com alguem|whatsapp direto|atendimento humano)\b/.test(
        n
      )
    ) {
      return 'humano';
    }
    if (/\b(como funciona|passo a passo|explica|triagem|processo)\b/.test(n)) return 'como';
    if (/\b(contato|email|e-mail|telefone|falar com voces|suporte)\b/.test(n)) return 'contato';
    if (/\b(preco|custo|valor|gratis|gratuito|pago|cobra)\b/.test(n)) return 'preco';
    if (/\b(orcamento|profissional|pedir|contratar|marcar|enviar pedido|formulario)\b/.test(n)) {
      return 'pedir';
    }
    if (/\b(urgente|agora|emergencia|rapido|hoje)\b/.test(n)) return 'urgente';

    const servico = detectServico(text);
    if (servico) return { type: 'servico', servico };

    if (/\b(ola|oi|bom dia|boa tarde|boa noite|e ai)\b/.test(n)) return 'saudacao';
    if (/\b(obrigad|valeu|brigad)\b/.test(n)) return 'obrigado';

    return 'fallback';
  }

  function getWelcomeMessage() {
    const cidade = cfg.defaultCity || 'São Paulo';
    const hint = aiCfg.welcomeHint || cfg.copy?.heroSubtitle || '';
    return [
      `Olá! Sou o **${assistantName}**.`,
      '',
      `Em ~30 segundos você pode iniciar uma **triagem grátis** em **${cidade}**: profissionais **verificados** da sua região respondem no **WhatsApp** — sem app e sem cadastro longo.`,
      '',
      hint,
      '',
      'Posso ajudar com: emergências em casa (eletricista, encanador, chaveiro…), como o ResolveAí funciona, contato e encaminhar para um **atendente humano** quando quiser.',
      '',
      'O que está acontecendo aí em casa?',
    ].join('\n');
  }

  function respondLocal(text) {
    const intent = matchIntent(text);
    const cidade = cfg.defaultCity || 'São Paulo';
    const email = cfg.contactEmail || 'contato@resolveai.com.br';
    const proof = cfg.socialProof || {};
    const leadUrl = buildLeadUrl(detectServico(text));
    const humanUrl = buildHumanWhatsAppUrl();

    if (intent === 'empty') {
      return { text: 'Digite sua dúvida ou toque em uma sugestão acima.' };
    }

    if (intent === 'humano') {
      return {
        text: [
          'Claro! Um **atendente humano** pode continuar pelo WhatsApp.',
          '',
          atendCfg.horario || 'Atendimento humano em horário comercial.',
          '',
          'Toque no botão verde abaixo ou em **Falar com atendente humano** — levo o contexto do que você já digitou aqui.',
        ].join('\n'),
        actions: humanUrl
          ? [{ label: 'Abrir WhatsApp do atendimento', href: humanUrl, external: true }]
          : [{ label: 'Triagem no site', href: leadUrl }],
      };
    }

    if (intent === 'como') {
      return {
        text: [
          '**Como o ResolveAí funciona:**',
          '',
          '1. Você descreve o problema (aqui ou na triagem de 30s).',
          '2. Profissionais **verificados** e em destaque da região veem seu pedido.',
          '3. **Quem responde primeiro** te chama no WhatsApp para combinar visita e valor.',
          '',
          `Média de resposta: **${proof.tempoMedioResposta || '12 min'}** · Nota **${proof.notaMedia || '4,8'}**.`,
          '',
          'Quer ir direto? Use **Pedir profissional agora** abaixo.',
        ].join('\n'),
        actions: [
          { label: 'Iniciar triagem (30s)', href: leadUrl },
          { label: 'Buscar profissionais', href: 'busca.html' },
        ],
      };
    }

    if (intent === 'contato') {
      const wa = getWhatsAppNum();
      return {
        text: [
          '**Contato ResolveAí:**',
          '',
          `📧 E-mail: **${email}**`,
          wa ? `📱 WhatsApp atendimento: **+${wa}**` : '📱 WhatsApp: configure em `config.js` → `whatsappAdmin`.',
          '',
          atendCfg.horario || '',
          '',
          'Para urgência com profissional na região, a triagem no site costuma ser mais rápida que só e-mail.',
        ]
          .filter(Boolean)
          .join('\n'),
        actions: [
          { label: 'Enviar e-mail', href: `mailto:${email}`, external: true },
          ...(humanUrl
            ? [{ label: 'WhatsApp humano', href: humanUrl, external: true }]
            : []),
          { label: 'Pedir profissional', href: leadUrl },
        ],
      };
    }

    if (intent === 'preco') {
      return {
        text: [
          'A **triagem para quem precisa de serviço em casa é 100% grátis** no ResolveAí.',
          '',
          'Você combina valor e forma de pagamento **direto com o profissional** no WhatsApp — o site não cobra do morador pela indicação.',
          '',
          'Prestadores podem ter planos de destaque (veja em **Para empresas**).',
        ].join('\n'),
        actions: [{ label: 'Triagem grátis agora', href: leadUrl }],
      };
    }

    if (intent === 'pedir' || intent === 'urgente') {
      const serv = detectServico(text);
      const urg =
        intent === 'urgente'
          ? ' Marque **“Preciso agora”** no formulário — seu pedido vai para o topo da fila.'
          : '';
      return {
        text: [
          serv
            ? `Perfeito! Para **${serv.label}** em **${cidade}**, abra a triagem rápida (30s).${urg}`
            : `Para pedir um profissional em **${cidade}**, use a triagem de 30 segundos na Home.${urg}`,
          '',
          'Campos: nome, WhatsApp, cidade, o que aconteceu e urgência. Depois os verificados da região te chamam.',
        ].join('\n'),
        actions: [
          { label: 'Pedir profissional agora', href: buildLeadUrl(serv) },
          ...(humanUrl
            ? [{ label: 'Prefiro falar com humano', href: humanUrl, external: true }]
            : []),
        ],
      };
    }

    if (intent.type === 'servico') {
      const s = intent.servico;
      const catUrl = getCategoriaPageUrl(s.slug || s.id);
      return {
        text: [
          `Entendi — você precisa de **${s.label}** em **${cidade}**.`,
          '',
          '⚡ Se for **urgente**, na triagem escolha **“Preciso agora”** para prioridade.',
          '',
          `Também há profissionais listados na página de **${s.label}**.`,
        ].join('\n'),
        actions: [
          { label: `Pedir ${s.label} agora`, href: buildLeadUrl(s) },
          { label: `Ver ${s.label} em SP`, href: catUrl },
          { label: 'Buscar todos', href: 'busca.html' },
        ],
      };
    }

    if (intent === 'saudacao') {
      return { text: 'Olá! 👋 Conte o que está acontecendo em casa ou escolha uma sugestão abaixo.' };
    }

    if (intent === 'obrigado') {
      return {
        text: 'Por nada! Se precisar de profissional ou de um humano, estou por aqui. Boa sorte com o reparo! 🙌',
      };
    }

    return {
      text: [
        'Não tenho certeza do tema, mas posso ajudar assim:',
        '',
        '• **Serviços:** eletricista, encanador, chaveiro, refrigeração, dedetização',
        '• **Como funciona** a triagem em 30s',
        '• **Pedir profissional** ou **falar com humano** no WhatsApp',
        '',
        'Reformule em uma frase — ex.: “vazamento no banheiro preciso hoje”.',
      ].join('\n'),
      actions: [
        { label: 'Pedir profissional', href: leadUrl },
        ...(humanUrl
          ? [{ label: 'Atendente humano', href: humanUrl, external: true }]
          : []),
      ],
    };
  }

  async function respondWithOpenAI(text) {
    const key = (aiCfg.openaiApiKey || '').trim();
    if (!key) return null;

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 400,
          messages: [
            {
              role: 'system',
              content: `Você é o ${assistantName}, assistente do site ResolveAí em ${cfg.defaultCity || 'São Paulo'}. Responda em português do Brasil, de forma curta e útil. Serviços: eletricista, encanador, chaveiro, técnico em refrigeração, dedetizador. Triagem grátis em 30s; profissionais verificados contactam via WhatsApp. Para pedir profissional: index.html#form-orcamento. Não invente preços de serviços.`,
            },
            ...history.slice(-6).map((m) => ({
              role: m.role === 'user' ? 'user' : 'assistant',
              content: m.text,
            })),
            { role: 'user', content: text },
          ],
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const reply = data.choices && data.choices[0] && data.choices[0].message;
      return reply && reply.content ? reply.content.trim() : null;
    } catch (e) {
      return null;
    }
  }

  async function botReply(userText) {
    showTyping();
    const delay = 400 + Math.min(userText.length * 8, 800);
    await new Promise((r) => setTimeout(r, delay));

    let payload = null;
    if ((aiCfg.openaiApiKey || '').trim()) {
      const apiText = await respondWithOpenAI(userText);
      if (apiText) payload = { text: apiText };
    }
    if (!payload) payload = respondLocal(userText);

    hideTyping();
    appendMessage('bot', payload.text, payload.actions ? { actions: payload.actions } : undefined);
  }

  function handleUserSend(text) {
    const trimmed = (text || '').trim();
    if (!trimmed || isTyping) return;
    appendMessage('user', trimmed);
    if (inputEl) {
      inputEl.value = '';
      inputEl.style.height = '';
    }
    botReply(trimmed);
  }

  function initUi() {
    const nameEl = document.getElementById('assistant-name');
    if (nameEl) nameEl.textContent = assistantName;

    const emailEl = document.getElementById('footer-email');
    if (emailEl && cfg.contactEmail) {
      emailEl.href = `mailto:${cfg.contactEmail}`;
      emailEl.textContent = cfg.contactEmail;
    }

    if (horarioEl && atendCfg.horario) {
      horarioEl.textContent = atendCfg.horario;
    }

    const humanUrl = buildHumanWhatsAppUrl();
    if (btnHumano) {
      if (humanUrl) {
        btnHumano.href = humanUrl;
      } else {
        btnHumano.href = 'index.html#form-orcamento';
        btnHumano.removeAttribute('target');
        btnHumano.textContent = 'Triagem no site (configure WhatsApp)';
      }
    }

    document.title = `${assistantName} | ResolveAí`;
  }

  function bindEvents() {
    if (formEl && inputEl) {
      formEl.addEventListener('submit', (e) => {
        e.preventDefault();
        handleUserSend(inputEl.value);
      });

      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          formEl.requestSubmit();
        }
      });

      inputEl.addEventListener('input', () => {
        inputEl.style.height = 'auto';
        inputEl.style.height = `${Math.min(inputEl.scrollHeight, 120)}px`;
      });
    }

    if (chipsEl) {
      chipsEl.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-chip]');
        if (!btn) return;
        handleUserSend(btn.getAttribute('data-chip'));
      });
    }

    if (btnHumano) {
      btnHumano.addEventListener('click', () => {
        const url = buildHumanWhatsAppUrl();
        if (url) btnHumano.href = url;
      });
    }
  }

  function applyServicoFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const servico = params.get('servico');
    if (!servico || !cfg.categorias) return;
    const cat = cfg.categorias.find((c) => c.id === servico);
    if (cat && inputEl) {
      inputEl.placeholder = `Ex.: preciso de ${cat.label.toLowerCase()}…`;
    }
  }

  function init() {
    if (aiCfg.enabled === false) {
      window.location.href = 'index.html#form-orcamento';
      return;
    }
    initUi();
    bindEvents();
    applyServicoFromQuery();
    appendMessage('bot', getWelcomeMessage());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
