# ResolveAi (ResolveAí MVP)

Site estático completo na pasta **[orcaja/](orcaja/)** — HTML, CSS e JavaScript.

| | |
|---|---|
| **Site no ar (GitHub Pages)** | https://victorhugoaurelianocoltro.github.io/ResolveAi/ |
| **Repositório** | https://github.com/victorhugoaurelianocoltro/ResolveAi |
| **Documentação do MVP** | [orcaja/README.md](orcaja/README.md) |
| **Deploy (Netlify, Vercel, Pages)** | [DEPLOY.md](DEPLOY.md) |

## Primeira publicação no GitHub Pages

1. Faça push da branch `main` (este repositório).
2. No GitHub: **Settings → Pages → Build and deployment → Source** = **GitHub Actions**.
3. O workflow [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml) publica a pasta `orcaja/` a cada push.

Links internos do site usam caminhos **relativos** (compatível com o subcaminho `/ResolveAi/` no Pages).

## Hospedagem alternativa

| Plataforma | Config |
|------------|--------|
| Netlify | `netlify.toml` (publish: `orcaja`) |
| Vercel | `vercel.json` |
