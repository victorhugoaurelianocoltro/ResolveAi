/**
 * ResolveAí — Funções compartilhadas (Home, Busca, Categoria)
 */
window.OrcajaCore = (function () {
  'use strict';

  const cfg = typeof ORCAJA_CONFIG !== 'undefined' ? ORCAJA_CONFIG : {};
  const mock = typeof ORCAJA_MOCK !== 'undefined' ? ORCAJA_MOCK : {};

  function $(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }

  function $$(sel, ctx) {
    return Array.from((ctx || document).querySelectorAll(sel));
  }

  function getCategoria(id) {
    return (cfg.categorias || []).find((c) => c.id === id || c.slug === id);
  }

  function getCategoriaLabel(id) {
    const cat = getCategoria(id);
    return cat ? cat.label : id;
  }

  function getCidadeSlug() {
    return (cfg.seo && cfg.seo.cidadeSlug) || 'sao-paulo';
  }

  function getCidadeNome() {
    return cfg.defaultCity || 'São Paulo';
  }

  /** URL amigável: eletricista-em-sao-paulo.html */
  function getCategoriaPageUrl(categoriaId) {
    const cat = getCategoria(categoriaId);
    if (!cat) return 'busca.html';
    return `${cat.slug}-em-${getCidadeSlug()}.html`;
  }

  function getBuscaUrl(params) {
    const q = new URLSearchParams(params || {});
    const s = q.toString();
    return s ? `busca.html?${s}` : 'busca.html';
  }

  function getPrestadoresAtivos() {
    if (typeof mock.getPrestadoresAtivos === 'function') {
      return mock.getPrestadoresAtivos();
    }
    return mock.prestadores || [];
  }

  function filterPrestadores(opts) {
    opts = opts || {};
    let lista = getPrestadoresAtivos();
    if (opts.categoria) {
      lista = lista.filter((p) => p.categoria === opts.categoria);
    }
    if (opts.cidade) {
      const c = opts.cidade.toLowerCase();
      lista = lista.filter((p) => p.cidade.toLowerCase() === c);
    }
    return lista;
  }

  function initials(name) {
    return (name || '?')
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }

  function escapeAttr(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;');
  }

  /** URL da foto: base64 em `foto` ou link externo em `fotoUrl` */
  function getPrestadorFoto(p) {
    if (!p) return null;
    const src = (p.foto && String(p.foto).trim()) || (p.fotoUrl && String(p.fotoUrl).trim());
    if (!src) return null;
    if (p.fotoUrl && src === String(p.fotoUrl).trim() && !/^https?:\/\//i.test(src)) {
      return null;
    }
    return src;
  }

  function renderProviderAvatarHtml(p) {
    const src = getPrestadorFoto(p);
    if (src) {
      const alt = escapeAttr(p.nome || 'Profissional');
      return `<img src="${escapeAttr(src)}" alt="${alt}" loading="lazy" decoding="async">`;
    }
    return initials(p.nome);
  }

  function stars(n) {
    const full = Math.floor(n);
    const half = n % 1 >= 0.5 ? 1 : 0;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half);
  }

  function whatsappLink(phone, message) {
    const num = String(phone).replace(/\D/g, '');
    const text = encodeURIComponent(message || 'Olá! Vi seu perfil no ResolveAí.');
    return `https://wa.me/${num}?text=${text}`;
  }

  function getPrestadorById(id) {
    if (typeof mock.getPrestadorById === 'function') return mock.getPrestadorById(id);
    return getPrestadoresAtivos().find((p) => p.id === id);
  }

  function getPrestadorBySlug(slug) {
    if (typeof mock.getPrestadorBySlug === 'function') return mock.getPrestadorBySlug(slug);
    return getPrestadoresAtivos().find((p) => p.slug === slug);
  }

  function resolvePrestadorFromQuery() {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const slug = params.get('slug');
    if (slug) return getPrestadorBySlug(slug);
    if (id) return getPrestadorById(id);
    const pathMatch = location.pathname.match(/prestador-([a-z0-9-]+)\.html$/i);
    if (pathMatch) return getPrestadorBySlug(pathMatch[1]);
    return null;
  }

  function getPrestadorProfileUrl(p) {
    if (!p) return 'busca.html';
    const q = p.slug ? `slug=${p.slug}` : `id=${p.id}`;
    return `prestador.html?${q}`;
  }

  /** Mensagem WhatsApp estruturada para conversão */
  function buildWhatsappMessage(p, opts) {
    opts = opts || {};
    const profissao = getCategoriaLabel(p.categoria);
    const linhas = [
      `Olá, ${p.nome}! Encontrei seu perfil no ResolveAí.`,
      '',
      `*Preciso de:* ${profissao}`,
      `*Cidade:* ${opts.cidade || p.cidade}`,
    ];
    if (opts.bairro) linhas.push(`*Bairro:* ${opts.bairro}`);
    if (opts.problema && opts.problema.trim()) {
      linhas.push(`*Situação:* ${opts.problema.trim()}`);
    }
    if (opts.urgenciaLabel) linhas.push(`*Urgência:* ${opts.urgenciaLabel}`);
    linhas.push('', 'Pode me enviar um orçamento? Obrigado(a)!');
    return linhas.join('\n');
  }

  function getWhatsappUrl(p, opts) {
    return whatsappLink(p.whatsapp, buildWhatsappMessage(p, opts));
  }

  function renderProviderCard(p, opts) {
    opts = opts || {};
    const orcamentoHref = opts.orcamentoHref || 'index.html#form-orcamento';
    const badges = [];
    if (p.destaque) badges.push('<span class="badge badge--destaque">★ Destaque</span>');
    if (p.verificado) badges.push('<span class="badge badge--verified">✓ Verificado</span>');

    const tags = (p.servicos || [])
      .slice(0, 3)
      .map((s) => `<span class="provider-card__tag">${s}</span>`)
      .join('');

    const profissao = getCategoriaLabel(p.categoria);
    const profileUrl = getPrestadorProfileUrl(p);
    const waUrl = getWhatsappUrl(p, { cidade: p.cidade, bairro: p.bairro });
    const cardClass = p.destaque ? 'provider-card' : 'provider-card provider-card--standard';

    return `
      <article class="${cardClass}" data-id="${p.id}">
        <div class="provider-card__header">
          <div class="provider-card__avatar" aria-hidden="true">${renderProviderAvatarHtml(p)}</div>
          <div class="provider-card__info">
            <h3 class="provider-card__name"><a href="${profileUrl}">${p.nome}</a></h3>
            <p class="provider-card__meta">${profissao} · ${p.bairro}, ${p.cidade}</p>
            <div class="provider-card__badges">${badges.join('')}</div>
          </div>
        </div>
        <div class="provider-card__rating">
          <span class="provider-card__stars" aria-label="Nota ${p.nota}">${stars(p.nota)}</span>
          <strong>${p.nota}</strong>
          <span>(${p.avaliacoes} avaliações)</span>
        </div>
        <p class="provider-card__meta">
          <span class="live-pulse"><span class="live-pulse__dot"></span> Responde em ~${p.tempoResposta}</span>
        </p>
        <div class="provider-card__tags">${tags}</div>
        <div class="provider-card__actions">
          <a href="${profileUrl}" class="btn btn--secondary btn--sm">Ver perfil</a>
          <a href="${orcamentoHref}" class="btn btn--primary btn--sm">Orçamento</a>
          <a href="${waUrl}" class="btn btn--whatsapp btn--sm" data-wa-provider="${p.id}" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp ${p.nome}">WhatsApp</a>
        </div>
      </article>
    `;
  }

  function renderProvidersGrid(gridEl, list, opts) {
    if (!gridEl) return;
    if (!list.length) {
      gridEl.innerHTML = `
        <div class="empty-state">
          <p>Nenhum profissional encontrado para este filtro.</p>
          <a href="busca.html" class="btn btn--secondary">Nova busca</a>
        </div>
      `;
      return;
    }
    gridEl.innerHTML = list.map((p) => renderProviderCard(p, opts)).join('');
  }

  function fillCategoriaSelect(selectEl, selectedId) {
    if (!selectEl || !cfg.categorias) return;
    selectEl.innerHTML =
      '<option value="">Selecione a profissão</option>' +
      cfg.categorias.map((c) => `<option value="${c.id}">${c.label}</option>`).join('');
    if (selectedId) selectEl.value = selectedId;
  }

  function fillUrgenciaSelect(selectEl) {
    if (!selectEl || !cfg.urgenciaOpcoes) return;
    selectEl.innerHTML = cfg.urgenciaOpcoes
      .map((u) => `<option value="${u.value}">${u.label}</option>`)
      .join('');
  }

  function injectJsonLd(schema) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }

  function parseCategoriaFromPath() {
    const match = location.pathname.match(/([^/]+)-em-([^/]+)\.html$/i);
    if (!match) return null;
    const cat = getCategoria(match[1]);
    if (!cat) return null;
    return { categoriaId: cat.id, cidadeSlug: match[2], cidadeNome: getCidadeNome() };
  }

  return {
    cfg,
    mock,
    $,
    $$,
    getCategoria,
    getCategoriaLabel,
    getCidadeSlug,
    getCidadeNome,
    getCategoriaPageUrl,
    getBuscaUrl,
    getPrestadoresAtivos,
    filterPrestadores,
    renderProviderCard,
    renderProvidersGrid,
    fillCategoriaSelect,
    fillUrgenciaSelect,
    injectJsonLd,
    parseCategoriaFromPath,
    whatsappLink,
    getPrestadorById,
    getPrestadorBySlug,
    resolvePrestadorFromQuery,
    getPrestadorProfileUrl,
    buildWhatsappMessage,
    getWhatsappUrl,
    initials,
    stars,
    getPrestadorFoto,
    renderProviderAvatarHtml,
  };
})();
