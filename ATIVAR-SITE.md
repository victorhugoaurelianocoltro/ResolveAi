# Ativar o site ResolveAí no GitHub Pages

O deploy automático já publica a pasta `orcaja` na branch **gh-pages** a cada push na `main`. Se o link ainda retorna **404**, falta só ligar o GitHub Pages no repositório (uma vez).

## URL final

https://victorhugoaurelianocoltro.github.io/ResolveAi/

---

## Passo a passo (GitHub no navegador)

1. Abra o repositório: https://github.com/victorhugoaurelianocoltro/ResolveAi  
2. Clique em **Settings** (Configurações).  
3. No menu lateral, clique em **Pages**.  
4. Em **Build and deployment** → **Source**, escolha: **Deploy from a branch**.  
5. Em **Branch**, selecione: **gh-pages** e pasta **/ (root)**.  
6. Clique em **Save**.  
7. Aguarde 1–5 minutos e abra: https://victorhugoaurelianocoltro.github.io/ResolveAi/

### O que você deve ver

- Uma mensagem verde tipo: *"Your site is live at …/ResolveAi/"*  
- O workflow **Publicar no GitHub Pages** continua atualizando a branch `gh-pages` automaticamente.

---

## Se não aparecer a opção Pages

- O repositório precisa ser **público** (ou Pages habilitado no plano).  
- Você precisa ser **dono** ou ter permissão de administrador no repositório.

---

## Alternativa: Netlify (sem configurar Pages)

1. Crie conta em https://www.netlify.com  
2. **Add new site** → **Import an existing project** → **GitHub** → escolha **ResolveAi**.  
3. **Branch to deploy:** `main` (ou conecte só a pasta publicada — veja abaixo).  
4. Como o site está em subpasta, use uma destas opções:  
   - **Opção A:** Conecte o repositório e defina **Base directory** vazio e **Publish directory** = `orcaja`  
   - **Opção B:** Use a branch `gh-pages` com **Publish directory** = `/` (raiz)  
5. Deploy → Netlify gera uma URL `*.netlify.app` (você pode colocar domínio depois).

---

## Verificar se o deploy rodou

1. Aba **Actions** no GitHub: workflow **Publicar no GitHub Pages** deve estar **verde (success)**.  
2. Aba **Code** → branch **gh-pages** → deve existir `index.html`, pasta `css/`, etc.

---

## Token / linha de comando (opcional)

Se instalar o [GitHub CLI](https://cli.github.com/) e fizer login (`gh auth login`), pode tentar ativar Pages por workflow (modo antigo) — **não é necessário** se usar **Deploy from branch → gh-pages** acima.

```bash
gh auth login
gh api -X POST repos/victorhugoaurelianocoltro/ResolveAi/pages -f build_type=legacy
```

Para o fluxo atual (branch `gh-pages`), use apenas a interface **Settings → Pages** descrita no início.
