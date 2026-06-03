/**
 * ResolveAí — Persistência de prestadores (painel admin)
 */
window.OrcajaPrestadoresStore = (function () {
  'use strict';

  const KEY = 'orcaja_prestadores_admin';
  const mock = typeof ORCAJA_MOCK !== 'undefined' ? ORCAJA_MOCK : { prestadores: [] };

  function getBase() {
    return JSON.parse(JSON.stringify(mock.prestadores || []));
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const lista = JSON.parse(raw);
        if (Array.isArray(lista)) return lista;
      }
    } catch (e) {}
    return getBase();
  }

  function save(lista) {
    localStorage.setItem(KEY, JSON.stringify(lista));
    mock.prestadores = lista;
    if (typeof mock.getPrestadoresAtivos === 'function') {
      mock.prestadoresDestaque = mock.getPrestadoresAtivos({ soDestaque: true });
    }
    return lista;
  }

  function getAll() {
    return load();
  }

  function getById(id) {
    return load().find((p) => p.id === id);
  }

  function update(id, patch) {
    const lista = load();
    const i = lista.findIndex((p) => p.id === id);
    if (i === -1) return null;
    lista[i] = { ...lista[i], ...patch };
    return save(lista)[i];
  }

  function toggle(id, field) {
    const p = getById(id);
    if (!p) return null;
    if (field === 'ativo') {
      return update(id, { ativo: p.ativo === false });
    }
    return update(id, { [field]: !p[field] });
  }

  function addFromCadastro(cad, extras) {
    const lista = load();
    const id = 'p' + Date.now();
    const slug = (cad.empresa || 'novo')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40);

    const novo = {
      id,
      slug: slug || id,
      nome: cad.empresa || cad.nome,
      categoria: cad.profissao || 'eletricista',
      cidade: cad.cidade || 'São Paulo',
      bairro: extras?.bairro || 'São Paulo',
      nota: 4.5,
      avaliacoes: 0,
      tempoResposta: '30 min',
      anosExperiencia: 1,
      verificado: extras?.verificado ?? false,
      destaque: extras?.destaque ?? false,
      ativo: extras?.ativo ?? true,
      whatsapp: (cad.whatsapp || '').replace(/\D/g, ''),
      servicos: extras?.servicos || ['Atendimento geral'],
      descricao: cad.descricao || `Profissional cadastrado via ResolveAí.`,
    };

    lista.push(novo);
    save(lista);
    return novo;
  }

  function remove(id) {
    return update(id, { ativo: false });
  }

  function resetToMock() {
    localStorage.removeItem(KEY);
    location.reload();
  }

  function exportJson() {
    return JSON.stringify(load(), null, 2);
  }

  return {
    KEY,
    load,
    save,
    getAll,
    getById,
    update,
    toggle,
    addFromCadastro,
    remove,
    resetToMock,
    exportJson,
  };
})();
