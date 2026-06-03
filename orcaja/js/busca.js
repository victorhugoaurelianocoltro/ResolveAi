/**
 * ResolveAí — Página de busca
 */
(function () {
  'use strict';

  const C = window.OrcajaCore;
  if (!C) return;

  const { cfg, mock, $, $$ } = C;

  function initFormFromQuery() {
    const params = new URLSearchParams(location.search);
    const prof = params.get('profissao') || params.get('p');
    const cidade = params.get('cidade');

    C.fillCategoriaSelect($('#profissao'), prof || cfg.mainNiche);
    const cidadeInput = $('#cidade-busca');
    if (cidadeInput) {
      cidadeInput.value = cidade ? decodeURIComponent(cidade) : C.getCidadeNome();
      cidadeInput.setAttribute('data-places-city', '');
    }

    if (prof) runSearch(prof, cidadeInput?.value, false);
  }

  function runSearch(profissaoId, cidade, scrollResults) {
    const cat = C.getCategoria(profissaoId);
    if (!cat) return;

    const cidadeNome = (cidade || C.getCidadeNome()).trim();
    const lista = C.filterPrestadores({ categoria: profissaoId, cidade: cidadeNome });

    const title = $('#busca-result-title');
    const subtitle = $('#busca-result-sub');
    if (title) title.textContent = `${cat.label} em ${cidadeNome}`;
    if (subtitle) {
      subtitle.textContent = lista.length
        ? `${lista.length} profissional${lista.length > 1 ? 'is' : ''} encontrado${lista.length > 1 ? 's' : ''}`
        : 'Nenhum resultado — tente outra cidade ou veja a página completa da profissão';
    }

    C.renderProvidersGrid($('#busca-grid'), lista, {
      orcamentoHref: `index.html#form-orcamento`,
    });

    const linkVerTodos = $('#link-categoria-completa');
    if (linkVerTodos) {
      linkVerTodos.href = C.getCategoriaPageUrl(profissaoId);
      linkVerTodos.textContent = `Ver página completa: ${cat.label} em ${cidadeNome}`;
      linkVerTodos.style.display = 'inline-flex';
    }

    const section = $('#busca-resultados');
    if (section) section.hidden = false;
    if (scrollResults && section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function renderProfissaoLinks() {
    const el = $('#busca-categorias');
    if (!el) return;
    el.innerHTML = (cfg.categorias || [])
      .map(
        (c) =>
          `<a href="${C.getCategoriaPageUrl(c.id)}" class="category-chip">
            <span>${c.icon}</span> ${c.label}
          </a>`
      )
      .join('');
  }

  function init() {
    renderProfissaoLinks();

    const form = $('#busca-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const prof = $('#profissao', form).value;
        const cidade = $('#cidade-busca', form).value.trim();
        if (!prof) return;

        const url = C.getCategoriaPageUrl(prof);
        const params = new URLSearchParams();
        if (cidade && cidade.toLowerCase() !== C.getCidadeNome().toLowerCase()) {
          params.set('cidade', cidade);
        }
        window.location.href = params.toString() ? `${url}?${params}` : url;
      });
    }

    const btnPreview = $('#busca-preview');
    if (btnPreview) {
      btnPreview.addEventListener('click', function () {
        const prof = $('#profissao')?.value;
        const cidade = $('#cidade-busca')?.value;
        if (prof) runSearch(prof, cidade, true);
      });
    }

    initFormFromQuery();
    if (window.ResolveaiPlaces) ResolveaiPlaces.initPage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
