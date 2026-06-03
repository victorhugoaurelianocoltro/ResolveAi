# Colocar o ResolveAi no ar (deploy)

Este repositorio contem o site estatico na pasta **`orcaja/`**. Nao ha build (npm) — so publicar os arquivos HTML, CSS e JS.

Dominio alvo (placeholder): **https://resolveai.com.br**

---

## 1. Enviar o codigo para o GitHub (primeira vez)

Se o Git ainda nao estiver instalado no Windows, baixe em: https://git-scm.com/download/win  
Reabra o terminal depois de instalar.

No PowerShell, na pasta do projeto (pai de `orcaja`):

```powershell
cd "c:\Users\CINTIA\OneDrive\Documentos\site para fazer dinheiro"
git init
git add .
git commit -m "ResolveAi MVP: site estatico e configuracao de deploy"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```

Substitua `SEU_USUARIO` e `SEU_REPOSITORIO` pela URL do repositorio que voce ja criou no GitHub (copie em **Code** no GitHub).

Se o repositorio remoto ja tiver commits, use antes do push:

```powershell
git pull origin main --rebase
```

---

## 2. Escolher hospedagem (recomendado: Netlify ou Vercel)

### Opcao A — Netlify (gratis, facil)

1. Acesse https://app.netlify.com e faca login (GitHub).
2. **Add new site** → **Import an existing project** → escolha o repositorio.
3. Netlify le o arquivo `netlify.toml` na raiz:
   - **Publish directory:** `orcaja`
   - **Build command:** vazio ou o echo do toml (nao gera build).
4. **Deploy site**.
5. Dominio customizado: **Domain settings** → **Add custom domain** → `resolveai.com.br`  
   Siga as instrucoes de DNS no registrador do dominio (registro A/CNAME que a Netlify mostrar).

### Opcao B — Vercel (gratis)

1. Acesse https://vercel.com e importe o repositorio do GitHub.
2. O `vercel.json` na raiz define **`outputDirectory`: `orcaja`**.
3. Framework Preset: **Other** (site estatico).
4. Deploy → depois **Settings** → **Domains** → adicione `resolveai.com.br`.

### Opcao C — GitHub Pages

1. No GitHub: **Settings** → **Pages** → **Source:** **GitHub Actions**.
2. O workflow `.github/workflows/deploy-pages.yml` publica a pasta `orcaja` a cada push em `main` ou `master`.
3. A URL ficara em `https://SEU_USUARIO.github.io/SEU_REPOSITORIO/` (ou dominio customizado em Pages).

---

## 3. Ajustes de producao em `orcaja/js/config.js`

Antes ou logo apos o primeiro deploy, edite e faca commit:

| Campo | O que colocar |
|-------|----------------|
| `domain` | `https://resolveai.com.br` (ja padrao) |
| `whatsappAdmin` | Seu WhatsApp com DDI (ex.: `5511987654321`) |
| `contactEmail` | E-mail real de contato |
| `googlePlacesApiKey` | Chave do Google Cloud (Maps JavaScript + Places API) |
| `stripe.*` | Links reais do Stripe Checkout (substituir `SEU_LINK_*`) |
| `permitirPagamentoDemo` | `false` em producao |
| `admin.pin` | Troque o PIN padrao `1234` por um PIN forte |

Nao commite arquivos `.env` com segredos; use apenas `config.js` ou variaveis no painel da hospedagem se no futuro migrar para build.

Depois de editar:

```powershell
git add orcaja/js/config.js
git commit --trailer "Co-authored-by: Cursor <cursoragent@cursor.com>" -m "Config producao ResolveAi"
git push
```

A hospedagem redeploya automaticamente (Netlify/Vercel/Pages).

---

## 4. Google Places (mapa / busca)

1. Console: https://console.cloud.google.com  
2. Ative **Maps JavaScript API** e **Places API**.  
3. Crie uma API Key e restrinja por dominio (`resolveai.com.br` e o dominio temporario da Netlify/Vercel).  
4. Cole a chave em `googlePlacesApiKey` no `config.js`.

Detalhes: `orcaja/GOOGLE-PLACES.md`.

---

## 5. Testar localmente (opcional)

```powershell
cd orcaja
node servidor-local.js
```

Ou abra `orcaja/index.html` via servidor local (evite `file://` para APIs).

Scripts: `INICIAR-RESOLVEAI.bat`.

---

## 6. Checklist pos-deploy

- [ ] Home abre sem erro no console (F12)
- [ ] Links de WhatsApp abrem com numero correto
- [ ] Checkout Stripe (quando links reais estiverem configurados)
- [ ] `robots.txt` e `sitemap.xml` acessiveis na URL publicada
- [ ] HTTPS ativo no dominio `resolveai.com.br`

---

## Problemas comuns

**Git nao reconhecido no terminal**  
Instale Git for Windows e reinicie o terminal.

**Push rejeitado (autenticacao)**  
Use GitHub CLI (`gh auth login`) ou Personal Access Token como senha no HTTPS.

**Pagina em branco na hospedagem**  
Confirme que a pasta publicada e **`orcaja`**, nao a raiz do repo.

**API do Google nao funciona**  
Verifique dominio autorizado na chave e HTTPS.