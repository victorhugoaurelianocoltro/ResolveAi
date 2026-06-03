/**
 * ResolveAí — Checkout / pagamento
 */
(function () {
  'use strict';

  const C = window.OrcajaCore;
  const P = window.OrcajaPagamentos;
  if (!C || !P) return;

  const { cfg, $ } = C;

  function getDadosForm() {
    return {
      empresa: $('#chk-empresa')?.value?.trim() || '',
      nome: $('#chk-nome')?.value?.trim() || '',
      whatsapp: $('#chk-whatsapp')?.value?.trim() || '',
      email: $('#chk-email')?.value?.trim() || '',
    };
  }

  function prefillFromQuery() {
    const params = new URLSearchParams(location.search);
    const emp = params.get('empresa');
    const wa = params.get('whatsapp');
    if (emp && $('#chk-empresa')) $('#chk-empresa').value = decodeURIComponent(emp);
    if (wa && $('#chk-whatsapp')) $('#chk-whatsapp').value = decodeURIComponent(wa);
  }

  function renderPlano(planoId) {
    const plano = P.getPlano(planoId);
    const main = $('#checkout-main');
    const nf = $('#checkout-not-found');

    if (!plano) {
      if (main) main.hidden = true;
      if (nf) nf.hidden = false;
      return null;
    }

    if (nf) nf.hidden = true;
    if (main) main.hidden = false;

    document.title = `Checkout — ${plano.nome} | ResolveAí`;

    $('#checkout-plano-nome').textContent = plano.nome;
    $('#checkout-plano-preco').textContent = P.formatPreco(plano);
    $('#checkout-beneficios').innerHTML = plano.beneficios.map((b) => `<li>${b}</li>`).join('');

    const stripeUrl = P.getStripeUrl(plano);
    const btnStripe = $('#btn-pagar-stripe');
    const btnDemo = $('#btn-pagar-demo');
    const aviso = $('#checkout-aviso');

    if (stripeUrl && btnStripe) {
      btnStripe.hidden = false;
      btnStripe.textContent = `Pagar ${P.formatPreco(plano)} com Stripe`;
    } else if (btnStripe) {
      btnStripe.hidden = true;
    }

    if (cfg.permitirPagamentoDemo && btnDemo) {
      btnDemo.hidden = false;
      btnDemo.textContent = `Simular pagamento (${P.formatPreco(plano)})`;
    } else if (btnDemo) {
      btnDemo.hidden = true;
    }

    if (aviso) {
      aviso.textContent = stripeUrl
        ? 'Você será redirecionado ao checkout seguro da Stripe.'
        : 'Stripe não configurado — use simular pagamento para testar ou cole seus Payment Links em js/config.js.';
    }

    return plano;
  }

  function validar(dados) {
    if (!dados.empresa || dados.empresa.length < 2) return 'Informe o nome da empresa';
    if (!dados.nome || dados.nome.length < 2) return 'Informe seu nome';
    const digits = dados.whatsapp.replace(/\D/g, '');
    if (digits.length < 10) return 'WhatsApp inválido';
    return null;
  }

  function init() {
    const params = new URLSearchParams(location.search);
    const planoId = params.get('plano') || 'destaque';
    const plano = renderPlano(planoId);
    if (!plano) return;

    prefillFromQuery();

    const form = $('#checkout-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const dados = getDadosForm();
      const erro = validar(dados);
      if (erro) {
        alert(erro);
        return;
      }

      P.salvarCadastro({ ...dados, planoInteresse: planoId, profissaoLabel: '—' });

      const stripeUrl = P.getStripeUrl(plano);
      if (stripeUrl) {
        P.irParaStripe(planoId, dados);
        return;
      }

      if (cfg.permitirPagamentoDemo) {
        P.concluirDemo(planoId, dados);
      } else {
        alert('Configure os links Stripe em js/config.js para aceitar pagamentos.');
      }
    });

    $('#btn-pagar-stripe')?.addEventListener('click', function () {
      form.requestSubmit();
    });

    $('#btn-pagar-demo')?.addEventListener('click', function () {
      const dados = getDadosForm();
      const erro = validar(dados);
      if (erro) {
        alert(erro);
        return;
      }
      P.concluirDemo(planoId, dados);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
