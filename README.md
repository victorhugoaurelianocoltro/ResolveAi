# ResolveAi (ResolveAí MVP)

Site estático completo na pasta **[orcaja/](orcaja/)** — HTML, CSS e JavaScript.

| | |
|---|---|
| **Site ao vivo agora** | **https://raw.githack.com/victorhugoaurelianocoltro/ResolveAi/gh-pages/index.html** |
| **Site oficial (GitHub Pages)** | https://victorhugoaurelianocoltro.github.io/ResolveAi/ *(ative em Settings → Pages)* |
| **Repositório** | https://github.com/victorhugoaurelianocoltro/ResolveAi |
| **Documentação do MVP** | [orcaja/README.md](orcaja/README.md) |
| **Deploy (Netlify, Vercel, Pages)** | [DEPLOY.md](DEPLOY.md) |

## Ativar o link público (faça uma vez)

1. **Settings → Pages:** https://github.com/victorhugoaurelianocoltro/ResolveAi/settings/pages  
   → **Deploy from a branch** → branch **`gh-pages`** → **`/ (root)`** → **Save**
2. **Sobre → ⚙️** na página do repo → campo **Website:** `https://victorhugoaurelianocoltro.github.io/ResolveAi/`

Guia com prints: [LINK-NO-GITHUB.md](LINK-NO-GITHUB.md)

O workflow [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml) atualiza a branch `gh-pages` a cada push na `main`.

Links internos do site usam caminhos **relativos** (compatível com o subcaminho `/ResolveAi/` no Pages).

## Hospedagem alternativa

| Plataforma | Config |
|------------|--------|
| Netlify | `netlify.toml` (publish: `orcaja`) |
| Vercel | `vercel.json` |
