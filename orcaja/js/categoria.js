/**
 * ResolveAí — Página de categoria (SEO local)
 */
(function () {
  'use strict';

  const C = window.OrcajaCore;
  if (!C) return;

  const { cfg, mock, $, $$ } = C;

  function getPageContext() {
    const fromBody = document.body.dataset.categoria;
    if (fromBody) {
      return {
        categoriaId: fromBody,
        cidadeSlug: document.body.dataset.cidadeSlug || C.getCidadeSlug(),
        cidadeNome: C.getCidadeNome(),
      };
    }
    return C.parseCategoriaFromPath();
  }

  function renderBreadcrumb(ctx, cat) {
    const el = $('#breadcrumb');
    if (!el) return;
    el.innerHTML = `
      <a href="index.html">Início</a>
      <span aria-hidden="true">/</span>
      <a href="busca.html">Buscar</a>
      <span aria-hidden="true">/</span>
      <span>${cat.label} em ${ctx.cidadeNome}</span>
    `;
  }

  function renderRelated(categoriaId) {
    const el = $('#related-categorias');
    if (!el) return;
    el.innerHTML = (cfg.categorias || [])
      .filter((c) => c.id !== categoriaId)
      .map(
        (c) =>
          `<a href="${C.getCategoriaPageUrl(c.id)}" class="category-chip">
            <span>${c.icon}</span> ${c.label}
          </a>`
      )
      .join('');
  }

  function injectLeadExtraFields(form) {
    if (!form || form.querySelector('#problema')) return;
    const submit = form.querySelector('button[type="submit"]');
    if (!submit) return;
    submit.insertAdjacentHTML(
      'beforebegin',
      '<div class="form-group"><label for="bairro">Bairro (opcional)</label><input type="text" id="bairro" placeholder="Ex.: Pinheiros"></div>' +
        '<div class="form-group"><label for="problema">O que aconteceu?</label><textarea id="problema" rows="2" placeholder="Descreva a urgência em casa"></textarea></div>'
    );
  }

  function initInlineForm(categoriaId) {
    C.fillCategoriaSelect($('#servico'), categoriaId);
    C.fillUrgenciaSelect($('#urgencia'));
    const cidade = $('#cidade');
    if (cidade) {
      cidade.value = C.getCidadeNome();
      cidade.setAttribute('data-places-city', '');
    }

    const form = $('#orcamento-form');
    if (!form) return;

    injectLeadExtraFields(form);
    if (window.ResolveaiPlaces) ResolveaiPlaces.initPage();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const nome = $('#nome', form).value.trim();
      const telefone = $('#telefone', form).value.trim();
      const cid = $('#cidade', form).value.trim();
      const servico = $('#servico', form).value;
      if (!nome || !telefone || !servico) return;

      const data = {
        nome,
        telefone,
        cidade: cid,
        bairro: $('#bairro', form)?.value?.trim() || '',
        problema: $('#problema', form)?.value?.trim() || '',
        servico,
        urgencia: $('#urgencia', form)?.value || 'hoje',
        origem: 'categoria',
      };
      if (window.OrcajaLeads) {
        OrcajaLeads.submit(data);
        return;
      }
      window.location.href = `sucesso.html?nome=${encodeURIComponent(nome)}`;
    });
  }

  function injectCategoriaSchema(ctx, cat, list) {
    const seo = (mock.seoCategorias || {})[ctx.categoriaId] || {};
    const url = `${cfg.domain}/${C.getCategoriaPageUrl(ctx.categoriaId)}`;

    C.injectJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `${cat.label} em ${ctx.cidadeNome}`,
      description: seo.intro || cfg.tagline,
      areaServed: { '@type': 'City', name: ctx.cidadeNome },
      provider: {
        '@type': 'LocalBusiness',
        name: cfg.siteName,
        url: cfg.domain,
      },
    });

    if (list.length) {
      C.injectJsonLd({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: list.slice(0, 10).map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: p.nome,
          description: `${C.getCategoriaLabel(p.categoria)} — ${p.bairro}, ${p.cidade}`,
        })),
      });
    }
  }

  function init() {
    const ctx = getPageContext();
    if (!ctx) return;

    const cat = C.getCategoria(ctx.categoriaId);
    if (!cat) return;

    const seo = (mock.seoCategorias || {})[ctx.categoriaId] || {};
    const lista = C.filterPrestadores({
      categoria: ctx.categoriaId,
      cidade: ctx.cidadeNome,
    });

    renderBreadcrumb(ctx, cat);

    const h1 = $('#cat-h1');
    if (h1) h1.textContent = seo.h1 || `${cat.label} em ${ctx.cidadeNome}`;

    const intro = $('#cat-intro');
    if (intro) intro.textContent = seo.intro || '';

    const texto = $('#cat-seo-text');
    if (texto) texto.textContent = seo.textoSeo || '';

    const count = $('#cat-count');
    if (count) {
      const dest = lista.filter((p) => p.destaque).length;
      count.textContent =
        lista.length > 0
          ? `${lista.length} ${cat.label.toLowerCase()}${lista.length > 1 ? 's' : ''} em ${ctx.cidadeNome}${dest ? ` · ${dest} em destaque` : ''}`
          : `Em breve mais ${cat.label.toLowerCase()}s em ${ctx.cidadeNome}`;
    }

    C.renderProvidersGrid($('#providers-grid'), lista, {
      orcamentoHref: '#form-orcamento',
    });

    renderRelated(ctx.categoriaId);
    initInlineForm(ctx.categoriaId);
    injectCategoriaSchema(ctx, cat, lista);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
