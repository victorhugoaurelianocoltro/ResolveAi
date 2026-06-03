# Como visualizar o ResolveAí (experiência final)

Guia em **uma página** para ver o site e o painel como ficarão quando tudo estiver funcionando em produção.

---

## 1. Abrir no seu computador (recomendado)

1. Vá até a pasta `orcaja/`.
2. Dê **duplo clique** em **`INICIAR-RESOLVEAI.bat`**.
3. O navegador abre automaticamente:
   - **Site:** http://127.0.0.1:8080/index.html
   - **Admin:** http://127.0.0.1:8080/admin.html

Se não tiver Node.js, o `.bat` tenta abrir `index.html` direto (alguns recursos podem falhar sem servidor).

**PIN do admin (demonstração):** `1234` (altere em `js/config.js` → `admin.pin` antes de publicar).

---

## 2. URLs na internet (sem instalar nada)

| O quê | URL |
|--------|-----|
| **Ao vivo agora** (githack, branch `gh-pages`) | https://raw.githack.com/victorhugoaurelianocoltro/ResolveAi/gh-pages/index.html |
| **Site oficial** (GitHub Pages — ative uma vez) | https://victorhugoaurelianocoltro.github.io/ResolveAi/ |
| **Repositório GitHub** | https://github.com/victorhugoaurelianocoltro/ResolveAi |
| **Ativar Pages** | https://github.com/victorhugoaurelianocoltro/ResolveAi/settings/pages → branch **`gh-pages`** → pasta **`/ (root)`** → Save |
| **Campo Website (Sobre)** | Na página do repo → ícone ⚙️ em **About** → **Website:** `https://victorhugoaurelianocoltro.github.io/ResolveAi/` |

Detalhes com prints: [LINK-NO-GITHUB.md](../LINK-NO-GITHUB.md) (na raiz do repositório).

---

## 3. O que clicar para ver a “versão final”

### Site público (cliente + prestador)

| Passo | Onde | O que você vê |
|--------|------|----------------|
| 1 | **Home** (`index.html`) | Tema escuro ResolveAí, hero com urgência, 10 profissionais, depoimentos, FAQ |
| 2 | **Assistente** (`ajuda.html`) | Chat com IA (regras locais): dúvidas, serviços, chips rápidos; **Falar com humano** → WhatsApp; **Pedir profissional** → triagem na Home |
| 3 | Formulário **“Triagem rápida (30s)”** na Home | Preencha nome, WhatsApp, cidade, profissão → **sucesso** (`sucesso.html`) |
| 4 | **Buscar** (`busca.html`) | Filtros por profissão e cards dos prestadores |
| 5 | **Perfil** | Ex.: `prestador.html?slug=eletrosp-urgente` — selos, WhatsApp, serviços |
| 6 | **Para empresas** (`anunciar.html`) | Planos + cadastro → `checkout.html` → **Simular pagamento** (demo) → `checkout-sucesso.html` |
| 7 | Páginas SEO | `eletricista-em-sao-paulo.html`, `encanador-em-sao-paulo.html`, etc. |

### Painel admin (dono do site)

1. Abra **http://127.0.0.1:8080/admin.html** (ou githack + `/admin.html`).
2. Digite PIN **`1234`**.
3. Na **primeira visita** (localStorage vazio), o sistema cria dados de demonstração:
   - 1 lead de exemplo
   - 2 cadastros pendentes
   - 2 pagamentos demo
4. Explore os menus:

| Menu | Conteúdo de demo |
|------|------------------|
| **Dashboard** | KPIs + últimos leads |
| **Prestadores** | 10 do `data.js` — busca, editar, selos Verificado/Destaque |
| **Leads** | Lead “Maria Silva” + leads que você criar no site |
| **Cadastros** | FrioRápido SP e Chaveiro Express — botões **Aprovar** / **+ Destaque** |
| **Pagamentos** | Dois pedidos `pago_demo` (Destaque e Mensal) |

Para limpar dados de teste: DevTools (F12) → Application → Local Storage → apague chaves `orcaja_*` e recarregue o admin (o seed demo roda de novo se estiver vazio).

---

## 4. Checklist — quando estiver tudo certo em produção

Edite **`js/config.js`** antes de divulgar o site de verdade:

- [ ] **`whatsappAdmin`** e **`atendimento.whatsapp`** — WhatsApp com DDI (atendimento humano no assistente)
- [ ] **`ai.openaiApiKey`** — opcional; vazio = assistente por regras locais (sem API)
- [ ] **`contactEmail`** — e-mail que recebe leads
- [ ] **`domain`** — URL final (ex.: `https://resolveai.com.br`)
- [ ] **`stripe`** — Payment Links reais (substituir `SEU_LINK_*`)
- [ ] **`admin.pin`** — troque `1234` por senha forte
- [ ] **`googlePlacesApiKey`** — opcional: autocomplete de cidade e mapa no perfil
- [ ] **`permitirPagamentoDemo`** — defina `false` quando Stripe estiver ativo
- [ ] **GitHub Pages** — Settings → Pages ativado; **About → Website** preenchido
- [ ] **Domínio próprio** — DNS apontando para hospedagem (se não usar só GitHub Pages)

Stripe: página de sucesso após pagamento →  
`https://SEU-DOMINIO/checkout-sucesso.html?plano=destaque`

---

## 5. Mais documentação

| Arquivo | Conteúdo |
|---------|----------|
| [README.md](README.md) | Visão técnica do MVP |
| [GOOGLE-PLACES.md](GOOGLE-PLACES.md) | API Google Places |
| [../DEPLOY.md](../DEPLOY.md) | Netlify, Vercel, Git |
| [../LINK-NO-GITHUB.md](../LINK-NO-GITHUB.md) | Ativar link público no GitHub |

---

**Resumo:** use **`INICIAR-RESOLVEAI.bat`** para a melhor prévia local; use o link **githack** para mostrar a alguém sem instalar nada; ative **GitHub Pages** uma vez para o link oficial `.github.io`.
