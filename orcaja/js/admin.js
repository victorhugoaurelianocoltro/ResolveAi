/**
 * ResolveAí — Painel Admin (profissional, autônomo)
 */
(function () {
  'use strict';

  const cfg = typeof ORCAJA_CONFIG !== 'undefined' ? ORCAJA_CONFIG : { admin: { pin: '1234' }, categorias: [] };
  const Store = window.OrcajaPrestadoresStore;
  const P = window.OrcajaPagamentos;

  const AUTH_KEY = 'orcaja_admin_auth';
  const TITLES = {
    dashboard: 'Dashboard',
    prestadores: 'Prestadores',
    leads: 'Leads',
    cadastros: 'Cadastros',
    pedidos: 'Pagamentos',
  };

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function toast(msg, type) {
    const wrap = $('toast-wrap');
    if (!wrap) return;
    const el = document.createElement('div');
    el.className = 'adm-toast' + (type ? ' adm-toast--' + type : '');
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(function () {
      el.remove();
    }, 3500);
  }

  function loadJson(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveJson(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function formatDate(iso) {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return iso;
    }
  }

  function getCategoriaLabel(id) {
    const cat = (cfg.categorias || []).find(function (c) {
      return c.id === id;
    });
    return cat ? cat.label : id || '—';
  }

  function fillCategoriaSelect(el, selected) {
    if (!el) return;
    el.innerHTML =
      '<option value="">Selecione</option>' +
      (cfg.categorias || [])
        .map(function (c) {
          return '<option value="' + c.id + '">' + escapeHtml(c.label) + '</option>';
        })
        .join('');
    if (selected) el.value = selected;
  }

  function getProfileUrl(p) {
    if (!p) return '#';
    const q = p.slug ? 'slug=' + encodeURIComponent(p.slug) : 'id=' + encodeURIComponent(p.id);
    return 'prestador.html?' + q;
  }

  function initials(name) {
    return (name || '?')
      .split(' ')
      .slice(0, 2)
      .map(function (w) {
        return w[0];
      })
      .join('')
      .toUpperCase();
  }

  /* ——— Auth ——— */
  function checkAuth() {
    return sessionStorage.getItem(AUTH_KEY) === 'ok';
  }

  function showApp() {
    const loginEl = $('adm-login');
    const appEl = $('adm-app');
    if (loginEl) loginEl.setAttribute('hidden', '');
    if (appEl) appEl.removeAttribute('hidden');
    document.body.classList.add('is-adm-authed');
    document.body.classList.remove('is-adm-login');
    goToPanel('dashboard');
    renderAll();
  }

  function showLogin() {
    const loginEl = $('adm-login');
    const appEl = $('adm-app');
    if (loginEl) loginEl.removeAttribute('hidden');
    if (appEl) appEl.setAttribute('hidden', '');
    document.body.classList.remove('is-adm-authed');
    document.body.classList.add('is-adm-login');
    const pinInput = $('admin-pin');
    if (pinInput) pinInput.value = '';
    const err = $('login-error');
    if (err) err.setAttribute('hidden', '');
  }

  function login(pin) {
    const expected = String((cfg.admin && cfg.admin.pin) || '1234').trim();
    if (String(pin).trim() === expected) {
      sessionStorage.setItem(AUTH_KEY, 'ok');
      localStorage.setItem('orcaja_admin', '1');
      showApp();
      toast('Bem-vindo ao painel ResolveAí', 'success');
      return true;
    }
    return false;
  }

  function logout() {
    sessionStorage.removeItem(AUTH_KEY);
    try {
      localStorage.removeItem('orcaja_admin');
    } catch (e) {}
    showLogin();
    toast('Sessão encerrada');
  }

  function seedDemoDataIfNeeded() {
    if (loadJson('orcaja_leads').length) return;
    saveJson('orcaja_leads', [
      {
        data: new Date().toISOString(),
        nome: 'Maria Silva',
        telefone: '11999887766',
        cidade: 'São Paulo',
        bairro: 'Vila Mariana',
        servico: 'eletricista',
        servicoLabel: 'Eletricista',
        urgencia: 'Esta semana',
        problema: 'Tomada com faísca na cozinha — lead de demonstração',
        origem: 'demo',
      },
    ]);
  }

  /* ——— Stats ——— */
  function getStats() {
    if (!Store) return { prestadores: 0, destaque: 0, leads: 0, cadastros: 0, pedidos: 0 };
    const prestadores = Store.getAll();
    return {
      prestadores: prestadores.filter(function (p) {
        return p.ativo !== false;
      }).length,
      destaque: prestadores.filter(function (p) {
        return p.destaque && p.ativo !== false;
      }).length,
      leads: loadJson('orcaja_leads').length,
      cadastros: loadJson('orcaja_cadastros').length,
      pedidos: loadJson('orcaja_pedidos').length,
    };
  }

  function renderKpis() {
    const s = getStats();
    const row = $('kpis-row');
    if (!row) return;

    row.innerHTML =
      '<div class="adm-kpi"><div class="adm-kpi__value">' +
      s.prestadores +
      '</div><div class="adm-kpi__label">Profissionais ativos</div></div>' +
      '<div class="adm-kpi adm-kpi--accent"><div class="adm-kpi__value">' +
      s.destaque +
      '</div><div class="adm-kpi__label">Em destaque</div></div>' +
      '<div class="adm-kpi adm-kpi--success"><div class="adm-kpi__value">' +
      s.leads +
      '</div><div class="adm-kpi__label">Leads totais</div></div>' +
      '<div class="adm-kpi"><div class="adm-kpi__value">' +
      s.cadastros +
      '</div><div class="adm-kpi__label">Cadastros pendentes</div></div>' +
      '<div class="adm-kpi"><div class="adm-kpi__value">' +
      s.pedidos +
      '</div><div class="adm-kpi__label">Pagamentos</div></div>';

    var bl = $('badge-leads');
    var bc = $('badge-cadastros');
    if (bl) bl.textContent = s.leads > 99 ? '99+' : s.leads;
    if (bc) bc.textContent = s.cadastros > 99 ? '99+' : s.cadastros;
    if (bl) bl.style.display = s.leads ? '' : 'none';
    if (bc) bc.style.display = s.cadastros ? '' : 'none';
  }

  function renderDashboardLeads() {
    const tbody = $('tbody-dashboard-leads');
    if (!tbody) return;
    const leads = loadJson('orcaja_leads').slice(-5).reverse();

    if (!leads.length) {
      tbody.innerHTML =
        '<tr><td colspan="5"><div class="adm-empty"><strong>Nenhum lead ainda</strong>Peça um orçamento no site público para testar.</div></td></tr>';
      return;
    }

    tbody.innerHTML = leads
      .map(function (l) {
        const wa = P ? P.notificarAdminLead({ servicoLabel: l.servicoLabel || getCategoriaLabel(l.servico), nome: l.nome, telefone: l.telefone, cidade: l.cidade, servico: l.servico, urgencia: l.urgencia, origem: l.origem }) : '';
        return (
          '<tr><td>' +
          formatDate(l.data) +
          '</td><td>' +
          escapeHtml(l.nome) +
          '</td><td>' +
          escapeHtml(l.servicoLabel || getCategoriaLabel(l.servico)) +
          '</td><td>' +
          escapeHtml(l.cidade) +
          '</td><td>' +
          (wa ? '<a href="' + wa + '" target="_blank" class="adm-btn adm-btn--success adm-btn--sm">WhatsApp</a>' : '') +
          '</td></tr>'
        );
      })
      .join('');
  }

  /* ——— Prestadores ——— */
  var searchQuery = '';

  function renderPrestadores() {
    const tbody = $('tbody-prestadores');
    if (!tbody || !Store) return;

    var lista = Store.getAll().sort(function (a, b) {
      if (a.destaque !== b.destaque) return a.destaque ? -1 : 1;
      return (b.nota || 0) - (a.nota || 0);
    });

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      lista = lista.filter(function (p) {
        return (
          (p.nome && p.nome.toLowerCase().includes(q)) ||
          (p.bairro && p.bairro.toLowerCase().includes(q)) ||
          getCategoriaLabel(p.categoria).toLowerCase().includes(q)
        );
      });
    }

    if (!lista.length) {
      tbody.innerHTML =
        '<tr><td colspan="6"><div class="adm-empty"><strong>Nenhum resultado</strong>Tente outra busca ou resete os dados.</div></td></tr>';
      return;
    }

    tbody.innerHTML = lista
      .map(function (p) {
        const inactive = p.ativo === false;
        return (
          '<tr class="' +
          (inactive ? 'is-inactive' : '') +
          '">' +
          '<td><div class="adm-provider-cell"><span class="adm-avatar">' +
          initials(p.nome) +
          '</span><div><strong>' +
          escapeHtml(p.nome) +
          '</strong><small>' +
          escapeHtml(p.slug) +
          '</small></div></div></td>' +
          '<td>' +
          escapeHtml(getCategoriaLabel(p.categoria)) +
          '</td>' +
          '<td>' +
          escapeHtml(p.bairro) +
          ', ' +
          escapeHtml(p.cidade) +
          '</td>' +
          '<td>★ ' +
          p.nota +
          ' <small>(' +
          p.avaliacoes +
          ')</small></td>' +
          '<td><div class="adm-badges-row">' +
          '<button type="button" class="adm-pill ' +
          (p.verificado ? 'is-on' : '') +
          '" data-type="verificado" data-action="verificado" data-id="' +
          p.id +
          '">✓ Verificado</button>' +
          '<button type="button" class="adm-pill ' +
          (p.destaque ? 'is-on' : '') +
          '" data-type="destaque" data-action="destaque" data-id="' +
          p.id +
          '">★ Destaque</button>' +
          '<button type="button" class="adm-pill ' +
          (p.ativo !== false ? 'is-on' : '') +
          '" data-type="ativo" data-action="ativo" data-id="' +
          p.id +
          '">● Ativo</button>' +
          '</div></td>' +
          '<td><a href="' +
          getProfileUrl(p) +
          '" target="_blank" class="adm-btn adm-btn--outline adm-btn--sm">Ver</a> ' +
          '<button type="button" class="adm-btn adm-btn--outline adm-btn--sm" data-edit="' +
          p.id +
          '">Editar</button></td>' +
          '</tr>'
        );
      })
      .join('');

    tbody.querySelectorAll('[data-action]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const id = btn.dataset.id;
        const field = btn.dataset.action;
        const p = Store.getById(id);
        if (!p) return;
        if (field === 'ativo') {
          Store.update(id, { ativo: p.ativo === false });
        } else {
          Store.toggle(id, field);
        }
        toast('Atualizado: ' + field, 'success');
        renderPrestadores();
        renderKpis();
      });
    });

    tbody.querySelectorAll('[data-edit]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        openEditModal(btn.dataset.edit);
      });
    });
  }

  function renderLeads() {
    const tbody = $('tbody-leads');
    if (!tbody) return;
    const leads = loadJson('orcaja_leads').slice().reverse();

    if (!leads.length) {
      tbody.innerHTML =
        '<tr><td colspan="8"><div class="adm-empty"><strong>Nenhum lead</strong>Os pedidos de orçamento do site aparecem aqui.</div></td></tr>';
      return;
    }

    tbody.innerHTML = leads
      .map(function (l) {
        const wa = P ? P.notificarAdminLead(l) : '';
        const local =
          escapeHtml(l.cidade) + (l.bairro ? '<br><small>' + escapeHtml(l.bairro) + '</small>' : '');
        const situacao = l.problema
          ? escapeHtml(l.problema.length > 60 ? l.problema.slice(0, 60) + '…' : l.problema)
          : '—';
        return (
          '<tr><td>' +
          formatDate(l.data) +
          '</td><td><strong>' +
          escapeHtml(l.nome) +
          '</strong></td><td>' +
          escapeHtml(l.telefone) +
          '</td><td>' +
          local +
          '</td><td><small>' +
          situacao +
          '</small></td><td>' +
          escapeHtml(l.servicoLabel || getCategoriaLabel(l.servico)) +
          '</td><td><span class="adm-tag adm-tag--new">' +
          escapeHtml(l.urgencia || '—') +
          '</span></td><td>' +
          (wa ? '<a href="' + wa + '" target="_blank" class="adm-btn adm-btn--success adm-btn--sm">Responder WA</a>' : '—') +
          '</td></tr>'
        );
      })
      .join('');
  }

  function renderCadastros() {
    const tbody = $('tbody-cadastros');
    if (!tbody) return;
    const cadastros = loadJson('orcaja_cadastros');
    const lista = cadastros.slice().reverse();

    if (!lista.length) {
      tbody.innerHTML =
        '<tr><td colspan="6"><div class="adm-empty"><strong>Nenhum cadastro</strong>Vindos da página Anunciar empresa.</div></td></tr>';
      return;
    }

    tbody.innerHTML = lista
      .map(function (c) {
        const idx = cadastros.indexOf(c);
        const wa = P ? P.notificarAdminCadastro(c) : '';
        return (
          '<tr><td>' +
          formatDate(c.criadoEm) +
          '</td><td><strong>' +
          escapeHtml(c.empresa) +
          '</strong></td><td>' +
          escapeHtml(c.nome) +
          '<br><small>' +
          escapeHtml(c.whatsapp) +
          '</small></td><td>' +
          escapeHtml(c.profissaoLabel || getCategoriaLabel(c.profissao)) +
          '</td><td>' +
          escapeHtml(c.planoInteresse || '—') +
          '</td><td style="white-space:nowrap">' +
          '<button type="button" class="adm-btn adm-btn--success adm-btn--sm" data-approve="' +
          idx +
          '">Aprovar</button> ' +
          '<button type="button" class="adm-btn adm-btn--warning adm-btn--sm" data-destaque="' +
          idx +
          '">+ Destaque</button> ' +
          (wa ? '<a href="' + wa + '" target="_blank" class="adm-btn adm-btn--outline adm-btn--sm">WA</a>' : '') +
          '</td></tr>'
        );
      })
      .join('');

    tbody.querySelectorAll('[data-approve]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const c = cadastros[Number(btn.dataset.approve)];
        if (!c || !Store) return;
        Store.addFromCadastro(c, { verificado: true, destaque: false });
        toast(c.empresa + ' publicado no site!', 'success');
        renderAll();
      });
    });

    tbody.querySelectorAll('[data-destaque]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const c = cadastros[Number(btn.dataset.destaque)];
        if (!c || !Store) return;
        Store.addFromCadastro(c, { verificado: true, destaque: true });
        toast(c.empresa + ' publicado com Destaque!', 'success');
        renderAll();
      });
    });
  }

  function renderPedidos() {
    const tbody = $('tbody-pedidos');
    if (!tbody) return;
    const pedidos = loadJson('orcaja_pedidos').slice().reverse();

    if (!pedidos.length) {
      tbody.innerHTML =
        '<tr><td colspan="5"><div class="adm-empty"><strong>Nenhum pagamento</strong>Checkout ou simulação demo.</div></td></tr>';
      return;
    }

    tbody.innerHTML = pedidos
      .map(function (p) {
        const tagClass = (p.status || '').includes('demo') ? 'adm-tag--demo' : 'adm-tag--paid';
        return (
          '<tr><td>' +
          formatDate(p.criadoEm) +
          '</td><td>' +
          escapeHtml(p.planoNome || p.planoId) +
          '</td><td>R$ ' +
          (p.valor != null ? p.valor : '—') +
          '</td><td><span class="adm-tag ' +
          tagClass +
          '">' +
          escapeHtml(p.status) +
          '</span></td><td>' +
          escapeHtml((p.empresa && p.empresa.empresa) || (p.empresa && p.empresa.nome) || '—') +
          '</td></tr>'
        );
      })
      .join('');
  }

  function openEditModal(id) {
    if (!Store) return;
    const p = Store.getById(id);
    if (!p) return;

    $('edit-id').value = p.id;
    $('edit-nome').value = p.nome || '';
    $('edit-whatsapp').value = p.whatsapp || '';
    $('edit-bairro').value = p.bairro || '';
    $('edit-nota').value = p.nota != null ? p.nota : 4.5;
    $('edit-descricao').value = p.descricao || '';
    fillCategoriaSelect($('edit-categoria'), p.categoria);
    $('modal-edit').removeAttribute('hidden');
  }

  function closeEditModal() {
    $('modal-edit').setAttribute('hidden', '');
  }

  function saveEdit(e) {
    if (e) e.preventDefault();
    if (!Store) return;
    Store.update($('edit-id').value, {
      nome: $('edit-nome').value.trim(),
      whatsapp: $('edit-whatsapp').value.replace(/\D/g, ''),
      bairro: $('edit-bairro').value.trim(),
      categoria: $('edit-categoria').value,
      nota: parseFloat($('edit-nota').value) || 4.5,
      descricao: $('edit-descricao').value.trim(),
    });
    closeEditModal();
    toast('Profissional salvo. Recarregue o site público (F5).', 'success');
    renderPrestadores();
    renderKpis();
  }

  function goToPanel(name) {
    document.querySelectorAll('.adm-nav__item').forEach(function (t) {
      t.classList.toggle('is-active', t.dataset.panel === name);
    });
    document.querySelectorAll('.adm-panel').forEach(function (p) {
      p.setAttribute('hidden', '');
    });
    const panel = $('panel-' + name);
    if (panel) panel.removeAttribute('hidden');
    const title = $('page-title');
    if (title) title.textContent = TITLES[name] || name;
    $('adm-sidebar').classList.remove('is-open');
  }

  function renderAll() {
    renderKpis();
    renderDashboardLeads();
    renderPrestadores();
    renderLeads();
    renderCadastros();
    renderPedidos();
  }

  function initNav() {
    document.querySelectorAll('.adm-nav__item').forEach(function (tab) {
      tab.addEventListener('click', function () {
        goToPanel(tab.dataset.panel);
      });
    });

    document.querySelectorAll('[data-goto]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        goToPanel(btn.dataset.goto);
      });
    });
  }

  function init() {
    if (typeof ORCAJA_MOCK === 'undefined') {
      document.body.innerHTML =
        '<div style="padding:40px;font-family:sans-serif"><h1>Erro ao carregar</h1><p>Não foi possível carregar <code>js/data.js</code>. Abra o admin pela pasta <code>orcaja/</code> (Live Server ou duplo clique em admin.html).</p></div>';
      return;
    }

    if (!Store) {
      document.body.innerHTML =
        '<div style="padding:40px;font-family:sans-serif"><h1>Erro ao carregar</h1><p>Falta o arquivo <code>js/prestadores-store.js</code></p></div>';
      return;
    }

    $('form-login').addEventListener('submit', function (e) {
      e.preventDefault();
      const pin = $('admin-pin').value;
      if (!login(pin)) {
        $('login-error').removeAttribute('hidden');
        toast('PIN incorreto', 'error');
      } else {
        $('login-error').setAttribute('hidden', '');
      }
    });

    $('btn-logout').addEventListener('click', logout);

    $('btn-export').addEventListener('click', function () {
      const blob = new Blob([Store.exportJson()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'resolveai-prestadores-' + Date.now() + '.json';
      a.click();
      toast('JSON exportado', 'success');
    });

    $('btn-reset').addEventListener('click', function () {
      if (confirm('Restaurar prestadores originais do data.js? Isso apaga edições do admin.')) {
        Store.resetToMock();
      }
    });

    $('btn-refresh').addEventListener('click', function () {
      renderAll();
      toast('Dados atualizados', 'success');
    });

    $('form-edit').addEventListener('submit', saveEdit);
    $('modal-close').addEventListener('click', closeEditModal);
    $('modal-edit').addEventListener('click', function (e) {
      if (e.target === $('modal-edit')) closeEditModal();
    });

    $('search-prestadores').addEventListener('input', function (e) {
      searchQuery = e.target.value.trim();
      renderPrestadores();
    });

    $('btn-clear-leads').addEventListener('click', function () {
      if (confirm('Apagar todos os leads salvos?')) {
        saveJson('orcaja_leads', []);
        renderAll();
        toast('Leads limpos');
      }
    });

    $('btn-menu').addEventListener('click', function () {
      $('adm-sidebar').classList.toggle('is-open');
    });

    fillCategoriaSelect($('edit-categoria'));
    initNav();
    seedDemoDataIfNeeded();

    if (checkAuth()) {
      showApp();
    } else {
      showLogin();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
