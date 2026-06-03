/**
 * ResolveAí — Página de perfil do prestador
 */
(function () {
  'use strict';

  const C = window.OrcajaCore;
  if (!C) return;

  const { cfg, mock, $ } = C;
  let prestador = null;

  function getWaOpts() {
    const urgEl = $('#wa-urgencia');
    const urgVal = urgEl?.value;
    const urgLabel = urgEl?.selectedOptions?.[0]?.textContent;
    return {
      cidade: $('#wa-cidade')?.value?.trim() || prestador.cidade,
      bairro: $('#wa-bairro')?.value?.trim() || prestador.bairro,
      problema: $('#wa-problema')?.value?.trim() || '',
      urgenciaLabel: urgLabel && urgVal !== 'semana' ? urgLabel : '',
    };
  }

  function updateWhatsappLinks() {
    if (!prestador) return;
    const url = C.getWhatsappUrl(prestador, getWaOpts());
    ['btn-wa-hero', 'btn-wa-custom', 'btn-wa-mobile'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.href = url;
    });
  }

  function setMeta(p) {
    const profissao = C.getCategoriaLabel(p.categoria);
    const title = `${p.nome} — ${profissao} em ${p.cidade} | ResolveAí`;
    const desc = `${p.descricao || profissao} Nota ${p.nota} (${p.avaliacoes} avaliações). Orçamento grátis pelo ResolveAí.`;

    document.title = title;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', desc);

    const canonical = document.getElementById('canonical-link');
    if (canonical && cfg.domain) {
      canonical.href = `${cfg.domain}/prestador.html?slug=${p.slug}`;
    }
  }

  function renderBreadcrumb(p) {
    const el = $('#breadcrumb');
    if (!el) return;
    const catUrl = C.getCategoriaPageUrl(p.categoria);
    const profissao = C.getCategoriaLabel(p.categoria);
    el.innerHTML = `
      <a href="index.html">Início</a>
      <span aria-hidden="true">/</span>
      <a href="${catUrl}">${profissao} em ${p.cidade}</a>
      <span aria-hidden="true">/</span>
      <span>${p.nome}</span>
    `;
  }

  function renderRelated(p) {
    const el = $('#profile-related');
    if (!el) return;
    const outros = C.filterPrestadores({ categoria: p.categoria, cidade: p.cidade })
      .filter((x) => x.id !== p.id)
      .slice(0, 4);

    if (!outros.length) {
      el.innerHTML = '<p class="form-hint">Nenhum outro profissional listado agora.</p>';
      return;
    }

    el.innerHTML = outros
      .map(
        (o) => `
        <a href="${C.getPrestadorProfileUrl(o)}" class="profile-mini-card">
          <span class="profile-mini-card__avatar">${C.initials(o.nome)}</span>
          <span>
            <strong style="display:block;font-size:var(--text-sm);">${o.nome}</strong>
            <span style="font-size:var(--text-xs);color:var(--color-text-muted);">★ ${o.nota} · ${o.tempoResposta}</span>
          </span>
        </a>
      `
      )
      .join('');
  }

  function injectSchema(p) {
    const profissao = C.getCategoriaLabel(p.categoria);
    C.injectJsonLd({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: p.nome,
      description: p.descricao,
      address: {
        '@type': 'PostalAddress',
        addressLocality: p.cidade,
        addressRegion: cfg.defaultState || 'SP',
        addressCountry: 'BR',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: String(p.nota),
        reviewCount: String(p.avaliacoes),
      },
      areaServed: p.cidade,
      knowsAbout: p.servicos,
      telephone: `+${p.whatsapp}`,
    });
  }

  function renderMapEmbed(p) {
    const wrap = $('#profile-map');
    if (!wrap || !window.ResolveaiPlaces) return;
    const url = ResolveaiPlaces.mapEmbedUrl(p);
    if (!url) return;
    wrap.hidden = false;
    wrap.innerHTML =
      '<h2 class="inline-form-title" style="text-align:left;">Área de atendimento</h2>' +
      '<iframe class="profile-map__frame" title="Mapa ' +
      p.nome +
      '" src="' +
      url +
      '" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>';
  }

  function showNotFound() {
    const main = $('#profile-main');
    const nf = $('#profile-not-found');
    const bar = $('#mobile-wa-bar');
    if (main) main.hidden = true;
    if (nf) nf.hidden = false;
    if (bar) bar.hidden = true;
    document.title = 'Profissional não encontrado | ResolveAí';
  }

  function renderProfile(p) {
    prestador = p;
    const profissao = C.getCategoriaLabel(p.categoria);
    const catUrl = C.getCategoriaPageUrl(p.categoria);
    const orcamentoUrl = `${catUrl}#form-orcamento`;

    setMeta(p);
    renderBreadcrumb(p);
    injectSchema(p);

    $('#profile-avatar').textContent = C.initials(p.nome);
    $('#profile-name').textContent = p.nome;
    $('#profile-profissao').textContent = `${profissao} · ${p.bairro}, ${p.cidade}`;

    const badges = [];
    if (p.destaque) badges.push('<span class="badge badge--destaque">★ Destaque</span>');
    if (p.verificado) badges.push('<span class="badge badge--verified">✓ Verificado</span>');
    else badges.push('<span class="badge badge--urgent">Em análise</span>');
    $('#profile-badges').innerHTML = badges.join('');

    $('#profile-rating').innerHTML = `
      <span class="provider-card__stars">${C.stars(p.nota)}</span>
      <strong>${p.nota}</strong>
      <span>(${p.avaliacoes} avaliações)</span>
    `;

    $('#profile-stats').innerHTML = `
      <div class="profile-stat"><strong>${p.tempoResposta}</strong>tempo de resposta</div>
      ${p.anosExperiencia ? `<div class="profile-stat"><strong>${p.anosExperiencia} anos</strong>de experiência</div>` : ''}
      <div class="profile-stat"><strong>${p.bairro}</strong>bairro base</div>
    `;

    $('#profile-desc').textContent = p.descricao || `${profissao} atendendo ${p.cidade} e região.`;

    const servicosEl = $('#profile-servicos');
    if (servicosEl) {
      servicosEl.innerHTML = (p.servicos || []).map((s) => `<li>${s}</li>`).join('');
    }

    const linkCat = $('#link-categoria');
    if (linkCat) {
      linkCat.href = catUrl;
      linkCat.textContent = `Ver todos os ${profissao.toLowerCase()}s`;
    }

    ['btn-orcamento-hero', 'btn-orc-mobile'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.href = orcamentoUrl;
    });

    const waCidade = $('#wa-cidade');
    if (waCidade) waCidade.value = p.cidade;
    const waBairro = $('#wa-bairro');
    if (waBairro && p.bairro) waBairro.placeholder = `Ex.: ${p.bairro}`;

    C.fillUrgenciaSelect($('#wa-urgencia'));
    updateWhatsappLinks();
    renderRelated(p);

    if (window.ResolveaiPlaces) {
      ResolveaiPlaces.initPage();
      ResolveaiPlaces.enrichProfile(p);
      renderMapEmbed(p);
    }

    const bar = $('#mobile-wa-bar');
    if (bar) bar.hidden = false;

    ['wa-cidade', 'wa-bairro', 'wa-problema', 'wa-urgencia'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', updateWhatsappLinks);
      if (el) el.addEventListener('change', updateWhatsappLinks);
    });
  }

  function init() {
    prestador = C.resolvePrestadorFromQuery();
    if (!prestador) {
      showNotFound();
      return;
    }
    renderProfile(prestador);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
