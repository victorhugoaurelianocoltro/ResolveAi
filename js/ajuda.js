/**
 * ResolveAí — Assistente de ajuda (regras locais + handoff humano + OpenAI opcional)
 */
(function () {
  'use strict';

  const cfg = typeof ORCAJA_CONFIG !== 'undefined' ? ORCAJA_CONFIG : {};
  const aiCfg = cfg.ai || {};
  const atendCfg = cfg.atendimento || {};
  const assistantName = aiCfg.assistantName || 'Assistente ResolveAí';
  const typingDelayMs = aiCfg.typingDelayMs ?? 800;
  const minSendIntervalMs = aiCfg.minSendIntervalMs ?? 1200;
  const showTimestamps = aiCfg.showTimestamps !== false;
  const typewriterEnabled = aiCfg.typewriterEnabled !== false;

  const messagesEl = document.getElementById('chat-messages');
  const welcomeEl = document.getElementById('welcome-panel');
  const suggestedEl = document.getElementById('suggested-questions');
  const formEl = document.getElementById('chat-form');
  const inputEl = document.getElementById('chat-input');
  const chipsEl = document.getElementById('quick-chips');
  const sendBtn = formEl ? formEl.querySelector('.ajuda-send') : null;
  const btnHumano = document.getElementById('btn-humano');
  const horarioEl = document.getElementById('atendimento-horario');

  const history = [];
  const userContext = [];
  let isTyping = false;
  let hasConversation = false;
  let lastSendAt = 0;
  let messageCount = 0;

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

  function getRecentUserContext() {
    return userContext.slice(-5);
  }

  function getChatContextSummary() {
    const lines = getRecentUserContext().map((t) => `• ${t}`);
    if (!lines.length) return '';
    return lines.join('\n');
  }

  function contextMentionsServico() {
    const joined = normalize(getRecentUserContext().join(' '));
    return detectServico(joined);
  }

  function buildHumanWhatsAppUrl() {
    const num = getWhatsAppNum();
    if (!num) return null;
    const base = atendCfg.mensagemPadrao || 'Olá! Preciso de ajuda pelo ResolveAí.';
    const ctx = getChatContextSummary();
    const serv = contextMentionsServico();
    const extra = serv ? `\nServiço mencionado: ${serv.label}` : '';
    const msg = ctx
      ? `${base}\n\nResumo do assistente (${assistantName}):\n${ctx}${extra}`
      : base;
    return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
  }

  function scrollToBottom() {
    if (!messagesEl) return;
    requestAnimationFrame(() => {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    });
  }

  function formatTime(date) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
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

  function hideWelcome() {
    if (!hasConversation && welcomeEl) {
      hasConversation = true;
      welcomeEl.classList.add('is-hidden');
    }
  }

  function announceToScreenReader(text) {
    const live = document.getElementById('sr-announcer');
    if (live) live.textContent = text;
  }

  function appendMessage(role, text, opts) {
    if (!messagesEl || text == null || text === undefined) return null;
    if (text === '' && role !== 'bot') return null;
    hideWelcome();

    const wrap = document.createElement('div');
    wrap.className = `ajuda-msg ajuda-msg--${role}`;
    wrap.setAttribute('role', role === 'user' ? 'article' : 'article');

    if (showTimestamps && role !== 'system') {
      const meta = document.createElement('span');
      meta.className = 'ajuda-msg__meta';
      meta.textContent = formatTime(new Date());
      wrap.appendChild(meta);
    }

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
    } else if (role === 'system') {
      bubble.textContent = text;
    } else {
      bubble.textContent = text;
    }

    wrap.appendChild(bubble);
    messagesEl.appendChild(wrap);
    history.push({ role, text, at: Date.now() });
    if (role === 'user') userContext.push(text);
    scrollToBottom();
    return { wrap, bubble };
  }

  function showTyping() {
    if (!messagesEl || isTyping) return;
    isTyping = true;
    if (sendBtn) sendBtn.disabled = true;
    const el = document.createElement('div');
    el.className = 'ajuda-msg ajuda-msg--bot ajuda-msg--typing';
    el.id = 'typing-indicator';
    el.setAttribute('aria-label', `${assistantName} está digitando`);
    el.innerHTML =
      '<div class="ajuda-msg__bubble"><span class="ajuda-typing" aria-hidden="true"><span></span><span></span><span></span></span></div>';
    messagesEl.appendChild(el);
    scrollToBottom();
  }

  function hideTyping() {
    isTyping = false;
    if (sendBtn) sendBtn.disabled = false;
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
  }

  function typewriterReveal(bubble, fullText, actions) {
    if (!typewriterEnabled || fullText.length > 600) {
      bubble.innerHTML = formatBotHtml(fullText);
      if (actions) appendActionsToBubble(bubble, actions);
      announceToScreenReader(fullText.replace(/\*\*/g, ''));
      return Promise.resolve();
    }

    bubble.classList.add('is-typing-cursor');
    const plain = fullText;
    const chunk = Math.max(2, Math.floor(plain.length / 40));
    let i = 0;

    return new Promise((resolve) => {
      function tick() {
        i = Math.min(plain.length, i + chunk);
        bubble.innerHTML = formatBotHtml(plain.slice(0, i));
        scrollToBottom();
        if (i < plain.length) {
          requestAnimationFrame(() => setTimeout(tick, 12));
        } else {
          bubble.classList.remove('is-typing-cursor');
          if (actions) appendActionsToBubble(bubble, actions);
          announceToScreenReader(plain.replace(/\*\*/g, ''));
          resolve();
        }
      }
      tick();
    });
  }

  function appendActionsToBubble(bubble, actions) {
    const actionsEl = document.createElement('div');
    actionsEl.className = 'ajuda-msg__actions';
    actions.forEach((a) => {
      const link = document.createElement('a');
      link.href = a.href;
      link.className = 'ajuda-msg__action-link';
      link.textContent = a.label;
      if (a.external) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
      actionsEl.appendChild(link);
    });
    bubble.appendChild(actionsEl);
  }

  async function appendBotMessage(text, actions) {
    hideTyping();
    const nodes = appendMessage('bot', '');
    if (!nodes) return;
    const { bubble, wrap } = nodes;
    bubble.innerHTML = '';
    history[history.length - 1].text = text;
    await typewriterReveal(bubble, text, actions);
    if (inputEl) inputEl.focus();
    messagesEl.focus({ preventScroll: true });
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
      { keys: ['eletric', 'tomada', 'disjuntor', 'luz', 'curto', 'energia caiu'], id: 'eletricista' },
      { keys: ['encan', 'vazamento', 'cano', 'pia', 'vaso', 'agua', 'entup'], id: 'encanador' },
      { keys: ['chave', 'fechadura', 'porta tranc', 'trancou'], id: 'chaveiro' },
      { keys: ['ar cond', 'geladeira', 'refrig', 'freezer', 'nao gela'], id: 'tecnico-refrigeracao' },
      { keys: ['dedetiz', 'barata', 'cupim', 'praga', 'rato'], id: 'dedetizador' },
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
      /\b(190|192|193|bombeiro|ambulancia|incendio|arma|sequestro|violencia)\b/.test(n)
    ) {
      return 'emergencia_real';
    }

    if (
      /\b(humano|atendente|pessoa|gente|operador|falar com alguem|whatsapp direto|atendimento humano|nao e robo|nao e bot)\b/.test(
        n
      )
    ) {
      return 'humano';
    }

    if (
      /\b(area|regiao|bairro|cidade|atendem|cobertura|grande sp|capital|abc|zona sul|zona norte|zona leste|zona oeste|metropolitana)\b/.test(
        n
      ) &&
      /\b(sp|sao paulo|paulo|paulista)\b/.test(n)
    ) {
      return 'area';
    }

    if (/\b(area|regiao|atendem onde|cobertura|grande sao paulo)\b/.test(n)) {
      return 'area';
    }

    if (/\b(como funciona|passo a passo|explica|triagem|processo|como usar)\b/.test(n)) {
      return 'como';
    }

    if (
      /\b(como contrat|contratar|fechar com|chamar profissional|marcar visita|agendar)\b/.test(n)
    ) {
      return 'contratar';
    }

    if (/\b(contato|email|e-mail|telefone|falar com voces|suporte|fale conosco)\b/.test(n)) {
      return 'contato';
    }

    if (/\b(preco|custo|valor|gratis|gratuito|pago|cobra|quanto custa|taxa)\b/.test(n)) {
      return 'preco';
    }

    if (/\b(orcamento|profissional|pedir|marcar|enviar pedido|formulario|solicitar)\b/.test(n)) {
      return 'pedir';
    }

    if (/\b(urgente|agora|emergencia|rapido|hoje|imediato|socorro)\b/.test(n)) {
      return 'urgente';
    }

    const servico = detectServico(text);
    if (servico) return { type: 'servico', servico };

    if (/\b(ola|oi|bom dia|boa tarde|boa noite|e ai|hey)\b/.test(n)) return 'saudacao';
    if (/\b(obrigad|valeu|brigad|agradec)\b/.test(n)) return 'obrigado';

    return 'fallback';
  }

  function getWelcomeMessage() {
    const cidade = cfg.defaultCity || 'São Paulo';
    const hint = aiCfg.welcomeHint || cfg.copy?.heroSubtitle || '';
    const disclaimer = aiCfg.disclaimer || '';
    const lines = [
      `Olá! Sou o **${assistantName}**, assistente oficial do ResolveAí.`,
      '',
      `Posso orientar sobre **serviços em casa** em **${cidade}**, **como contratar** um profissional verificado, **preços da triagem**, **área de atendimento** e encaminhar para um **atendente humano** quando preferir.`,
      '',
      hint,
    ];
    if (disclaimer) {
      lines.push('', `_${disclaimer}_`);
    }
    lines.push('', 'Por onde começamos? Descreva o que está acontecendo ou escolha uma sugestão abaixo.');
    return lines.join('\n');
  }

  function respondLocal(text) {
    const intent = matchIntent(text);
    const cidade = cfg.defaultCity || 'São Paulo';
    const estado = cfg.defaultState || 'SP';
    const email = cfg.contactEmail || 'contato@resolveai.com.br';
    const proof = cfg.socialProof || {};
    const servFromText = detectServico(text);
    const servFromCtx = contextMentionsServico();
    const serv = servFromText || servFromCtx;
    const leadUrl = buildLeadUrl(serv);
    const humanUrl = buildHumanWhatsAppUrl();
    const recent = getRecentUserContext();

    if (intent === 'empty') {
      return {
        text: 'Escreva sua dúvida no campo abaixo ou toque em uma das sugestões — estou aqui para orientar.',
      };
    }

    if (intent === 'emergencia_real') {
      return {
        text: [
          '**Se há risco imediato à vida ou segurança**, ligue agora:',
          '',
          '• **190** — Polícia',
          '• **192** — SAMU',
          '• **193** — Bombeiros',
          '',
          'Depois que a situação estiver estável, o ResolveAí pode ajudar com reparos em casa (eletricista, encanador, etc.).',
        ].join('\n'),
        actions: [{ label: 'Triagem para reparo em casa', href: leadUrl }],
      };
    }

    if (intent === 'humano') {
      return {
        text: [
          'Com certeza — um **atendente humano** continua pelo WhatsApp com o contexto do que você já escreveu aqui.',
          '',
          atendCfg.horario || 'Atendimento humano em horário comercial.',
          '',
          'Use o botão **Atendente humano** abaixo ou o link na mensagem.',
        ].join('\n'),
        actions: humanUrl
          ? [{ label: 'Abrir WhatsApp do atendimento', href: humanUrl, external: true }]
          : [{ label: 'Triagem no site', href: leadUrl }],
      };
    }

    if (intent === 'area') {
      return {
        text: [
          `O ResolveAí foca em **${cidade}** e **Grande ${estado}** (capital e região metropolitana).`,
          '',
          'Na triagem você informa cidade e bairro — profissionais **verificados da sua região** recebem o pedido e respondem no **WhatsApp**.',
          '',
          'Ainda não atendemos outras capitais; se estiver fora de SP, avise no formulário e buscaremos encaminhar quando possível.',
        ].join('\n'),
        actions: [
          { label: 'Iniciar triagem em SP', href: leadUrl },
          { label: 'Buscar profissionais', href: 'busca.html' },
        ],
      };
    }

    if (intent === 'como') {
      return {
        text: [
          '**Como o ResolveAí funciona**',
          '',
          '1. Você descreve o problema (aqui ou na **triagem de 30s**).',
          '2. Profissionais **verificados** e em destaque da região veem seu pedido.',
          '3. **Quem responde primeiro** te chama no WhatsApp para combinar visita e valor.',
          '',
          `Média de resposta: **${proof.tempoMedioResposta || '12 min'}** · Avaliação **${proof.notaMedia || '4,8'}**.`,
          '',
          'Sem app, sem cadastro longo — só WhatsApp e transparência.',
        ].join('\n'),
        actions: [
          { label: 'Triagem 30s', href: leadUrl },
          { label: 'Ver profissionais', href: 'busca.html' },
        ],
      };
    }

    if (intent === 'contratar') {
      const servLine = serv
        ? ` Para **${serv.label}**, já deixamos o serviço pré-selecionado na triagem.`
        : '';
      return {
        text: [
          '**Como contratar um profissional:**',
          '',
          `1. Abra a **triagem grátis (30s)** na Home.${servLine}`,
          '2. Preencha nome, WhatsApp, cidade, descrição e urgência.',
          '3. Aguarde contato no WhatsApp — você combina **valor e horário** direto com o profissional.',
          '',
          'Quer ajuda humana antes? Use **Atendente humano** abaixo.',
        ].join('\n'),
        actions: [
          { label: 'Contratar agora (triagem)', href: buildLeadUrl(serv) },
          ...(humanUrl
            ? [{ label: 'WhatsApp com atendente', href: humanUrl, external: true }]
            : []),
        ],
      };
    }

    if (intent === 'contato') {
      const wa = getWhatsAppNum();
      return {
        text: [
          '**Contato ResolveAí**',
          '',
          `E-mail: **${email}**`,
          wa ? `WhatsApp atendimento: **+${wa}**` : 'WhatsApp: configure em `config.js`.',
          '',
          atendCfg.horario || '',
          '',
          'Para urgência com profissional na região, a triagem no site costuma ser mais rápida.',
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
          'A **triagem para quem precisa de serviço em casa é 100% grátis**.',
          '',
          'Você combina valor e pagamento **direto com o profissional** no WhatsApp — o ResolveAí não cobra do morador pela indicação.',
          '',
          'Prestadores podem contratar planos de destaque (veja **Para empresas**).',
        ].join('\n'),
        actions: [{ label: 'Triagem grátis', href: leadUrl }],
      };
    }

    if (intent === 'pedir' || intent === 'urgente') {
      const urg =
        intent === 'urgente'
          ? ' Na triagem, marque **“Preciso agora”** — seu pedido ganha prioridade na fila.'
          : '';
      return {
        text: [
          serv
            ? `Perfeito — para **${serv.label}** em **${cidade}**, abra a triagem rápida.${urg}`
            : `Para pedir um profissional em **${cidade}**, use a triagem de 30 segundos.${urg}`,
          '',
          'Campos: nome, WhatsApp, cidade, o que aconteceu e nível de urgência. Profissionais verificados te chamam em seguida.',
        ].join('\n'),
        actions: [
          { label: 'Pedir profissional agora', href: buildLeadUrl(serv) },
          ...(humanUrl
            ? [{ label: 'Prefiro atendente humano', href: humanUrl, external: true }]
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
          'Se for **urgente**, na triagem escolha **“Preciso agora”**.',
          '',
          `Há também profissionais listados na página de **${s.label}**.`,
        ].join('\n'),
        actions: [
          { label: `Pedir ${s.label}`, href: buildLeadUrl(s) },
          { label: `Ver ${s.label} em SP`, href: catUrl },
          { label: 'Buscar todos', href: 'busca.html' },
        ],
      };
    }

    if (intent === 'saudacao') {
      const follow =
        recent.length > 1
          ? ' Vi que você já começou a conversa — quer continuar de onde parou ou pedir um profissional?'
          : ' Conte o que está acontecendo em casa ou escolha uma sugestão.';
      return { text: `Olá! Bom te ver por aqui.${follow}` };
    }

    if (intent === 'obrigado') {
      return {
        text: 'Por nada! Qualquer hora pode voltar, pedir um profissional ou falar com um atendente humano. Boa sorte com o reparo.',
      };
    }

    return {
      text: [
        'Para eu ajudar melhor, reformule em uma frase — por exemplo:',
        '',
        '• “vazamento no banheiro preciso hoje”',
        '• “atendem Guarulhos?”',
        '• “quanto custa pedir eletricista”',
        '',
        'Ou use **Triagem 30s** / **Atendente humano** abaixo.',
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

    const contextBlock = getRecentUserContext().length
      ? `Contexto recente do usuário:\n${getRecentUserContext().join('\n')}\n\n`
      : '';

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
              content: `${contextBlock}Você é o ${assistantName}, assistente do ResolveAí em ${cfg.defaultCity || 'São Paulo'}. Responda em português do Brasil: profissional, acolhedor, objetivo. Serviços: eletricista, encanador, chaveiro, refrigeração, dedetização. Triagem grátis 30s; profissionais verificados no WhatsApp. Pedido: index.html#form-orcamento. Não invente preços. Emergência real: oriente 190/192/193.`,
            },
            ...history
              .filter((m) => m.role !== 'system')
              .slice(-8)
              .map((m) => ({
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
    const delay = typingDelayMs + Math.min(userText.length * 4, 400);
    await new Promise((r) => setTimeout(r, delay));

    let payload = null;
    if ((aiCfg.openaiApiKey || '').trim()) {
      const apiText = await respondWithOpenAI(userText);
      if (apiText) payload = { text: apiText };
    }
    if (!payload) payload = respondLocal(userText);

    await appendBotMessage(payload.text, payload.actions || null);
  }

  function handleUserSend(text) {
    const trimmed = (text || '').trim();
    const now = Date.now();

    if (!trimmed) {
      appendMessage('system', 'Digite uma mensagem antes de enviar.');
      return;
    }

    if (isTyping) return;

    if (now - lastSendAt < minSendIntervalMs && messageCount > 0) {
      appendMessage(
        'system',
        'Um instante — estou processando sua mensagem anterior.'
      );
      return;
    }

    lastSendAt = now;
    messageCount += 1;
    appendMessage('user', trimmed);
    if (inputEl) {
      inputEl.value = '';
      inputEl.style.height = '';
    }
    botReply(trimmed);
  }

  function renderSuggestedQuestions() {
    if (!suggestedEl) return;
    const items = aiCfg.suggestedQuestions || [];
    suggestedEl.innerHTML = '';
    items.forEach((q) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ajuda-welcome-card';
      btn.setAttribute('role', 'listitem');
      btn.setAttribute('data-message', q.message || q.title);
      btn.innerHTML = `<span class="ajuda-welcome-card__title">${escapeHtml(q.title || '')}</span><span class="ajuda-welcome-card__subtitle">${escapeHtml(q.subtitle || '')}</span>`;
      btn.addEventListener('click', () => handleUserSend(q.message || q.title));
      suggestedEl.appendChild(btn);
    });
  }

  function renderQuickChips() {
    if (!chipsEl) return;
    const chips = aiCfg.quickChips || [
      'Preciso de eletricista urgente',
      'Como funciona?',
      'Falar com humano',
    ];
    chipsEl.innerHTML = '';
    chips.forEach((label) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ajuda-chip';
      btn.setAttribute('data-chip', label);
      btn.textContent = label;
      chipsEl.appendChild(btn);
    });
  }

  function initUi() {
    const nameEl = document.getElementById('assistant-name');
    if (nameEl) nameEl.textContent = assistantName;

    const monoEl = document.getElementById('assistant-monogram');
    if (monoEl && cfg.brand && cfg.brand.monogram) {
      monoEl.textContent = cfg.brand.monogram;
    }

    const taglineEl = document.getElementById('assistant-tagline');
    if (taglineEl) taglineEl.textContent = aiCfg.tagline || cfg.tagline || '';

    const statusEl = document.getElementById('assistant-status-label');
    if (statusEl) statusEl.textContent = aiCfg.statusLabel || 'Online';

    const disclaimerEl = document.getElementById('assistant-disclaimer');
    if (disclaimerEl) {
      disclaimerEl.textContent = aiCfg.disclaimer || '';
      if (!aiCfg.disclaimer) disclaimerEl.hidden = true;
    }

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
        btnHumano.textContent = 'Triagem (configure WhatsApp)';
      }
    }

    document.title = `${assistantName} | ResolveAí`;

    const announcer = document.createElement('div');
    announcer.id = 'sr-announcer';
    announcer.className = 'visually-hidden';
    announcer.setAttribute('aria-live', 'assertive');
    announcer.setAttribute('aria-atomic', 'true');
    document.body.appendChild(announcer);
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

  async function init() {
    if (aiCfg.enabled === false) {
      window.location.href = 'index.html#form-orcamento';
      return;
    }
    initUi();
    renderSuggestedQuestions();
    renderQuickChips();
    bindEvents();
    applyServicoFromQuery();
    await appendBotMessage(getWelcomeMessage());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
