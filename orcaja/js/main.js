/**
 * ResolveAí — Home: interações e renderização
 */
(function () {
  'use strict';

  const C = window.OrcajaCore;
  const cfg = C ? C.cfg : typeof ORCAJA_CONFIG !== 'undefined' ? ORCAJA_CONFIG : {};
  const mock = C ? C.mock : typeof ORCAJA_MOCK !== 'undefined' ? ORCAJA_MOCK : {};
  const $ = C ? C.$ : (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = C ? C.$$ : (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const getCategoriaLabel = C ? C.getCategoriaLabel : (id) => id;

  function getPrestadoresParaHome() {
    if (typeof mock.getPrestadoresAtivos === 'function') {
      const homeCfg = cfg.home || {};
      return mock.getPrestadoresAtivos({
        limite: homeCfg.maxCards || null,
        soDestaque: homeCfg.mostrarApenasDestaque || false,
      });
    }
    return mock.prestadoresDestaque || mock.prestadores || [];
  }

  /* ——— Render prestadores ——— */
  function renderProviders() {
    const grid = $('#providers-grid');
    if (!grid) return;

    const list = getPrestadoresParaHome();
    const countEl = $('#providers-count');
    if (countEl) {
      const destaque = list.filter((p) => p.destaque).length;
      countEl.textContent =
        destaque > 0
          ? `${list.length} profissionais · ${destaque} em destaque agora`
          : `${list.length} profissionais disponíveis`;
    }
    if (C) {
      C.renderProvidersGrid(grid, list, { orcamentoHref: '#form-orcamento' });
    }
  }

  /* ——— Render categorias ——— */
  function renderCategories() {
    const container = $('#category-chips');
    if (!container || !cfg.categorias) return;

    container.innerHTML = cfg.categorias
      .map((c) => {
        const href = C ? C.getCategoriaPageUrl(c.id) : '#';
        return `<a href="${href}" class="category-chip" title="${c.label} em São Paulo">
            <span>${c.icon}</span> ${c.label}
          </a>`;
      })
      .join('');
  }

  /* ——— Render depoimentos ——— */
  function renderTestimonials() {
    const grid = $('#testimonials-grid');
    if (!grid || !mock.depoimentos) return;

    grid.innerHTML = mock.depoimentos
      .map(
        (d) => `
        <blockquote class="testimonial-card">
          <div class="testimonial-card__stars" aria-hidden="true">${'★'.repeat(d.estrelas)}</div>
          <p class="testimonial-card__text">"${d.texto}"</p>
          <footer>
            <cite class="testimonial-card__author">${d.nome}</cite>
            <p class="testimonial-card__meta">${d.bairro} · ${d.servico}</p>
          </footer>
        </blockquote>
      `
      )
      .join('');
  }

  /* ——— Render FAQ ——— */
  function renderFaq() {
    const list = $('#faq-list');
    if (!list || !mock.faq) return;

    list.innerHTML = mock.faq
      .map(
        (item, i) => `
        <div class="faq-item" data-faq="${i}">
          <button type="button" class="faq-item__question" aria-expanded="false">
            ${item.pergunta}
            <span class="faq-item__icon" aria-hidden="true">+</span>
          </button>
          <div class="faq-item__answer" role="region">
            <div class="faq-item__answer-inner">${item.resposta}</div>
          </div>
        </div>
      `
      )
      .join('');

    $$('.faq-item__question', list).forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const isOpen = item.classList.contains('is-open');
        $$('.faq-item', list).forEach((el) => {
          el.classList.remove('is-open');
          el.querySelector('.faq-item__question')?.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ——— Preencher selects do formulário ——— */
  function initFormSelects() {
    const servico = $('#servico');
    const urgencia = $('#urgencia');
    const cidade = $('#cidade');

    if (servico && cfg.categorias) {
      servico.innerHTML =
        '<option value="">Selecione o profissional</option>' +
        cfg.categorias.map((c) => `<option value="${c.id}">${c.label}</option>`).join('');
      if (cfg.mainNiche) servico.value = cfg.mainNiche;
    }

    if (urgencia && cfg.urgenciaOpcoes) {
      urgencia.innerHTML = cfg.urgenciaOpcoes
        .map((u) => `<option value="${u.value}">${u.label}</option>`)
        .join('');
    }

    if (cidade && cfg.defaultCity) {
      cidade.value = cfg.defaultCity;
    }
  }

  /* ——— Validação e envio do formulário ——— */
  function showToast(msg) {
    let toast = $('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('is-visible');
    setTimeout(() => toast.classList.remove('is-visible'), 4000);
  }

  function validatePhone(phone) {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 13;
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    let valid = true;

    const fields = [
      { id: 'nome', check: (v) => v.trim().length >= 2 },
      { id: 'telefone', check: (v) => validatePhone(v) },
      { id: 'cidade', check: (v) => v.trim().length >= 2 },
      { id: 'servico', check: (v) => v.length > 0 },
    ];

    fields.forEach(({ id, check }) => {
      const input = $('#' + id, form);
      const group = input?.closest('.form-group');
      if (!input || !group) return;
      if (!check(input.value)) {
        group.classList.add('is-invalid');
        valid = false;
      } else {
        group.classList.remove('is-invalid');
      }
    });

    if (!valid) {
      showToast('Preencha nome, telefone, cidade e profissional corretamente.');
      return;
    }

    const data = {
      nome: $('#nome', form).value.trim(),
      telefone: $('#telefone', form).value.trim(),
      cidade: $('#cidade', form).value.trim(),
      bairro: $('#bairro', form)?.value?.trim() || '',
      problema: $('#problema', form)?.value?.trim() || '',
      servico: $('#servico', form).value,
      urgencia: $('#urgencia', form)?.value || 'hoje',
      origem: 'home',
    };

    if (window.OrcajaLeads) {
      OrcajaLeads.submit(data);
      return;
    }

    window.location.href = `sucesso.html?nome=${encodeURIComponent(data.nome)}`;
  }

  /* ——— Schema JSON-LD dinâmico ——— */
  function injectSchema() {
    const city = cfg.defaultCity || 'São Paulo';
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: (mock.faq || []).map((f) => ({
        '@type': 'Question',
        name: f.pergunta,
        acceptedAnswer: { '@type': 'Answer', text: f.resposta },
      })),
    };

    const businessSchema = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: cfg.siteName || 'ResolveAí',
      description: cfg.tagline,
      url: cfg.domain,
      areaServed: {
        '@type': 'City',
        name: city,
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: cfg.socialProof?.notaMedia || '4.8',
        reviewCount: '240',
      },
      priceRange: '$$',
    };

    [faqSchema, businessSchema].forEach((schema) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });
  }

  /* ——— Atualizar textos dinâmicos da config ——— */
  function applyConfigTexts() {
    const sp = cfg.socialProof || {};
    const copy = cfg.copy || {};
    const map = {
      '[data-pedidos]': sp.pedidosMes,
      '[data-prestadores]': sp.prestadoresAtivos,
      '[data-resposta]': sp.tempoMedioResposta,
      '[data-nota]': sp.notaMedia,
      '[data-cidade]': cfg.defaultCity,
      '[data-nicho]': cfg.mainNicheLabel,
    };

    Object.entries(map).forEach(([sel, val]) => {
      if (!val) return;
      $$(sel).forEach((el) => {
        el.textContent = val;
      });
    });

    const heroTitle = $('#hero-title');
    if (heroTitle && copy.heroTitle) {
      const city = cfg.defaultCity || 'São Paulo';
      heroTitle.innerHTML = copy.heroTitle
        .replace('São Paulo', `<span data-cidade>${city}</span>`)
        .replace('ResolveAí', '<em>ResolveAí</em>');
    }

    const heroSub = $('.hero__subtitle');
    if (heroSub && copy.heroSubtitle) heroSub.textContent = copy.heroSubtitle;

    const ctaPrimary = $('.hero__ctas .btn--primary');
    if (ctaPrimary && copy.ctaPrimary) ctaPrimary.textContent = copy.ctaPrimary;

    const ctaSecondary = $('.hero__ctas .btn--secondary');
    if (ctaSecondary && copy.ctaSecondary) ctaSecondary.textContent = copy.ctaSecondary;

    const prestadorCta = $('#anunciar-title');
    if (prestadorCta && copy.prestadorCta) prestadorCta.textContent = copy.prestadorCta;

    if (cfg.siteName && $('#hero-title')) {
      document.title = `${cfg.siteName} — Emergência em casa em ${cfg.defaultCity || 'São Paulo'} | Triagem grátis`;
    }
  }

  /* ——— Init ——— */
  function init() {
    renderProviders();
    renderCategories();
    renderTestimonials();
    renderFaq();
    initFormSelects();
    applyConfigTexts();
    injectSchema();

    if (window.ResolveaiPlaces) ResolveaiPlaces.initPage();

    const form = $('#orcamento-form');
    if (form) form.addEventListener('submit', handleFormSubmit);

    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const id = link.getAttribute('href');
        if (id === '#') return;
        const target = $(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
