/**
 * ResolveAí — Pagamentos (Stripe + demo)
 */
window.OrcajaPagamentos = (function () {
  'use strict';

  const cfg = typeof ORCAJA_CONFIG !== 'undefined' ? ORCAJA_CONFIG : {};

  function getPlano(id) {
    return (cfg.planos && cfg.planos[id]) || null;
  }

  function getStripeUrl(plano) {
    if (!plano || !cfg.stripe) return null;
    const url = cfg.stripe[plano.stripeUrlKey];
    if (!url || url.includes('SEU_LINK')) return null;
    return url;
  }

  function isStripeAtivo() {
    return !!(getStripeUrl(getPlano('destaque')) || getStripeUrl(getPlano('mensal')) || getStripeUrl(getPlano('leads')));
  }

  function formatPreco(plano) {
    if (!plano) return '';
    if (plano.precoUnitario && plano.quantidade) {
      return `R$ ${plano.preco * plano.quantidade} (${plano.quantidade} × R$ ${plano.preco})`;
    }
    return `R$ ${plano.preco}`;
  }

  function salvarPedido(dados) {
    try {
      const key = 'orcaja_pedidos';
      const lista = JSON.parse(localStorage.getItem(key) || '[]');
      lista.push({ ...dados, criadoEm: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(lista));
      return true;
    } catch (e) {
      return false;
    }
  }

  function salvarCadastro(dados) {
    try {
      const key = 'orcaja_cadastros';
      const lista = JSON.parse(localStorage.getItem(key) || '[]');
      lista.push({ ...dados, criadoEm: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(lista));
      return true;
    } catch (e) {
      return false;
    }
  }

  function irParaStripe(planoId, dadosEmpresa) {
    const plano = getPlano(planoId);
    const url = getStripeUrl(plano);
    if (!url) return false;

    salvarPedido({
      planoId,
      planoNome: plano.nome,
      valor: plano.precoUnitario ? plano.preco * (plano.quantidade || 1) : plano.preco,
      status: 'redirecionado_stripe',
      empresa: dadosEmpresa,
    });

    window.location.href = url;
    return true;
  }

  function concluirDemo(planoId, dadosEmpresa) {
    const plano = getPlano(planoId);
    if (!plano) return null;

    const pedido = {
      planoId,
      planoNome: plano.nome,
      valor: plano.precoUnitario ? plano.preco * (plano.quantidade || 1) : plano.preco,
      status: 'pago_demo',
      empresa: dadosEmpresa,
      modo: 'demo',
    };
    salvarPedido(pedido);

    const params = new URLSearchParams({
      plano: planoId,
      empresa: dadosEmpresa.empresa || '',
      demo: '1',
    });
    window.location.href = `checkout-sucesso.html?${params.toString()}`;
    return pedido;
  }

  function notificarAdminCadastro(dados) {
    const num = (cfg.whatsappAdmin || '').replace(/\D/g, '');
    if (!num) return null;
    const msg = [
      '🆕 *Novo cadastro ResolveAí*',
      `Empresa: ${dados.empresa}`,
      `Responsável: ${dados.nome}`,
      `WhatsApp: ${dados.whatsapp}`,
      `Profissão: ${dados.profissaoLabel || dados.profissao}`,
      `Cidade: ${dados.cidade}`,
      `Plano interesse: ${dados.planoInteresse || '—'}`,
    ].join('\n');
    return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
  }

  function notificarAdminLead(lead) {
    const num = (cfg.whatsappAdmin || '').replace(/\D/g, '');
    if (!num) return null;
    const msg = [
      '📋 *Novo pedido de orçamento*',
      `Nome: ${lead.nome}`,
      `Tel: ${lead.telefone}`,
      `Cidade: ${lead.cidade}`,
      lead.bairro ? `Bairro: ${lead.bairro}` : null,
      lead.problema ? `Situação: ${lead.problema}` : null,
      `Profissional: ${lead.servicoLabel || lead.servico}`,
      `Urgência: ${lead.urgencia || '—'}`,
      `Origem: ${lead.origem || 'site'}`,
    ]
      .filter(Boolean)
      .join('\n');
    return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
  }

  function mailtoLead(lead) {
    const email = cfg.contactEmail || 'contato@resolveai.com.br';
    const subject = encodeURIComponent(`Orçamento: ${lead.servicoLabel || lead.servico} — ${lead.cidade}`);
    const body = encodeURIComponent(
      [
        'Novo lead ResolveAí',
        '',
        `Nome: ${lead.nome}`,
        `Telefone: ${lead.telefone}`,
        `Cidade: ${lead.cidade}`,
        lead.bairro ? `Bairro: ${lead.bairro}` : '',
        lead.problema ? `Situação: ${lead.problema}` : '',
        `Profissional: ${lead.servicoLabel || lead.servico}`,
        `Urgência: ${lead.urgencia || ''}`,
      ]
        .filter(Boolean)
        .join('\n')
    );
    return `mailto:${email}?subject=${subject}&body=${body}`;
  }

  return {
    getPlano,
    getStripeUrl,
    isStripeAtivo,
    formatPreco,
    salvarPedido,
    salvarCadastro,
    irParaStripe,
    concluirDemo,
    notificarAdminCadastro,
    notificarAdminLead,
    mailtoLead,
  };
})();
