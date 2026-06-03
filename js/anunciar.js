/**
 * ResolveAí — Página Anunciar
 */
(function () {
  'use strict';

  const C = window.OrcajaCore;
  const P = window.OrcajaPagamentos;
  if (!C || !P) return;

  const { cfg, $ } = C;

  function renderPlanos() {
    const grid = $('#planos-grid');
    if (!grid || !cfg.planos) return;

    const ordem = ['destaque', 'mensal', 'leads'];
    grid.innerHTML = ordem
      .map((id, i) => {
        const plano = cfg.planos[id];
        if (!plano) return '';
        const popular = id === 'destaque';
        const precoHtml = plano.precoUnitario
          ? `<span class="pricing-card__price">R$ ${plano.preco * plano.quantidade}</span><span class="pricing-card__period">${plano.quantidade} leads × R$ ${plano.preco}</span>`
          : `<span class="pricing-card__price">R$ ${plano.preco}</span><span class="pricing-card__period">/${plano.periodo}</span>`;

        return `
          <article class="pricing-card ${popular ? 'pricing-card--popular' : ''}">
            ${popular ? '<span class="pricing-card__badge">Mais vendido</span>' : ''}
            <h3 class="pricing-card__name">${plano.nome}</h3>
            <div class="pricing-card__price-wrap">${precoHtml}</div>
            <ul class="pricing-card__features">
              ${plano.beneficios.map((b) => `<li>${b}</li>`).join('')}
            </ul>
            <a href="checkout.html?plano=${id}" class="btn ${popular ? 'btn--primary' : 'btn--secondary'} btn--lg">Contratar agora</a>
          </article>
        `;
      })
      .join('');

    const stripeOk = P.isStripeAtivo();
    const hint = $('#stripe-hint');
    if (hint) {
      hint.textContent = stripeOk
        ? 'Pagamento seguro via Stripe. Ativação após confirmação.'
        : 'Modo demonstração ativo — configure links Stripe em config.js para cobrar de verdade.';
    }
  }

  function initCadastroForm() {
    const form = $('#cadastro-prestador');
    if (!form) return;

    C.fillCategoriaSelect($('#cad-profissao'));

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const cat = $('#cad-profissao', form).value;
      const dados = {
        empresa: $('#cad-empresa', form).value.trim(),
        nome: $('#cad-nome', form).value.trim(),
        whatsapp: $('#cad-whatsapp', form).value.trim(),
        profissao: cat,
        profissaoLabel: C.getCategoriaLabel(cat),
        cidade: $('#cad-cidade', form).value.trim(),
        planoInteresse: $('#cad-plano', form).value,
      };

      if (!dados.empresa || !dados.nome || !dados.whatsapp || !cat) {
        alert('Preencha empresa, nome, WhatsApp e profissão.');
        return;
      }

      P.salvarCadastro(dados);

      const waUrl = P.notificarAdminCadastro(dados);
      if (waUrl) window.open(waUrl, '_blank');

      const plano = dados.planoInteresse || 'destaque';
      window.location.href = `checkout.html?plano=${plano}&empresa=${encodeURIComponent(dados.empresa)}&whatsapp=${encodeURIComponent(dados.whatsapp)}`;
    });
  }

  function init() {
    renderPlanos();
    initCadastroForm();

    const params = new URLSearchParams(location.search);
    const plano = params.get('plano');
    if (plano && cfg.planos && cfg.planos[plano]) {
      const el = document.querySelector(`[href="checkout.html?plano=${plano}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
