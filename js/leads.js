/**
 * ResolveAí — Envio de leads (localStorage + notificação admin)
 */
window.OrcajaLeads = (function () {
  'use strict';

  const cfg = typeof ORCAJA_CONFIG !== 'undefined' ? ORCAJA_CONFIG : {};

  function getCategoriaLabel(id) {
    if (window.OrcajaCore) return OrcajaCore.getCategoriaLabel(id);
    const cat = (cfg.categorias || []).find((c) => c.id === id);
    return cat ? cat.label : id;
  }

  function submit(lead) {
    lead.servicoLabel = lead.servicoLabel || getCategoriaLabel(lead.servico);
    lead.data = lead.data || new Date().toISOString();

    try {
      const lista = JSON.parse(localStorage.getItem('orcaja_leads') || '[]');
      lista.push(lead);
      localStorage.setItem('orcaja_leads', JSON.stringify(lista));
    } catch (e) {
      console.warn('ResolveAí: erro ao salvar lead', e);
    }

    const notify = { wa: null, mailto: null };
    if (window.OrcajaPagamentos) {
      notify.wa = OrcajaPagamentos.notificarAdminLead(lead);
      notify.mailto = OrcajaPagamentos.mailtoLead(lead);
    }

    try {
      sessionStorage.setItem('orcaja_last_lead_notify', JSON.stringify(notify));
    } catch (e) {}

    const params = new URLSearchParams({
      nome: lead.nome,
      servico: lead.servicoLabel,
      cidade: lead.cidade,
    });
    if (lead.bairro) params.set('bairro', lead.bairro);
    if (lead.problema) params.set('problema', lead.problema);
    window.location.href = `sucesso.html?${params.toString()}`;
  }

  return { submit, getCategoriaLabel };
})();
