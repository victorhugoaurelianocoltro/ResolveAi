# ResolveAí — MVP funcional

Site de conversão para serviços urgentes em São Paulo.

## Como visualizar (guia completo)

**Leia primeiro:** **[COMO-VISUALIZAR.md](COMO-VISUALIZAR.md)** — URLs ao vivo, roteiro de cliques (Home → admin PIN 1234) e checklist de produção em `config.js`.

## Abrir o site

**Recomendado:** duplo clique em `INICIAR-RESOLVEAI.bat` → **http://127.0.0.1:8080/index.html**

Alternativa: Live Server no Cursor (pasta `orcaja`) ou abrir `index.html` direto (alguns recursos podem falhar sem servidor).

## Fluxos que já funcionam

### Cliente (pedir orçamento)
1. Preenche formulário na Home ou página de categoria
2. Lead salvo em `localStorage` → chave `orcaja_leads`
3. Redireciona para `sucesso.html`

### Dono do site (ver leads)
No console do navegador (F12):

```javascript
JSON.parse(localStorage.getItem('orcaja_leads'))
```

Para ver botões de reenviar lead por WhatsApp/e-mail na página de sucesso, abra:
`sucesso.html?admin=1` (ou no console: `localStorage.setItem('orcaja_admin','1')`)

### Prestador (anunciar e pagar)
1. `anunciar.html` → escolhe plano ou preenche cadastro
2. `checkout.html?plano=destaque` (ou `mensal` / `leads`)
3. **Sem Stripe configurado:** clique em **Simular pagamento** → `checkout-sucesso.html`
4. **Com Stripe:** cole Payment Links em `config.js` → botão redireciona à Stripe

Pedidos e cadastros salvos:
- `orcaja_pedidos`
- `orcaja_cadastros`

## Configurar para produção (`js/config.js`)

```javascript
whatsappAdmin: '5511999999999',  // seu WhatsApp
contactEmail: 'contato@resolveai.com.br',
domain: 'https://seusite.com.br',

stripe: {
  destaque30dias: 'https://buy.stripe.com/xxxxx',
  planoMensal: 'https://buy.stripe.com/xxxxx',
  pacoteLeads10: 'https://buy.stripe.com/xxxxx',
},
```

No Stripe, página de confirmação após pagamento:
`https://seusite.com.br/checkout-sucesso.html?plano=destaque`

## Páginas

| Arquivo | Função |
|---------|--------|
| `index.html` | Home |
| `busca.html` | Buscar profissional |
| `*-em-sao-paulo.html` | SEO por profissão |
| `prestador.html?slug=...` | Perfil |
| `anunciar.html` | Planos prestador |
| `checkout.html?plano=...` | Pagamento |
| `checkout-sucesso.html` | Pós-pagamento |
| `sucesso.html` | Pós-orçamento cliente |

## Painel Admin (profissional)

1. Use `INICIAR-RESOLVEAI.bat` ou Live Server → `http://127.0.0.1:8080/admin.html`
2. PIN: **1234** (`js/config.js` → `admin.pin`)
3. **Dashboard** — KPIs + últimos leads
4. **Prestadores** — busca, selos clicáveis, editar modal
5. **Cadastros** — aprovar / destacar
6. **Pagamentos** — histórico Stripe/demo

CSS dedicado: `css/admin.css` (não depende mais do CSS do site público).

## Parte 8 — Google Places + polish (concluída)

- **`js/google-places.js`** — autocomplete de cidade (se houver API Key)
- **Perfil** — avaliações Google + mapa (com `googlePlaceId` no prestador)
- **Leads** — campos bairro + descrição do problema (Home e categorias)
- **`favicon.svg`**, **`robots.txt`**, **`404.html`**
- Guia: **`GOOGLE-PLACES.md`**

```javascript
// js/config.js
googlePlacesApiKey: 'SUA_API_KEY',
```

## Publicar na internet

1. Hospede a pasta `orcaja/` (Netlify, Vercel static, Hostinger, etc.)
2. Aponte o domínio `resolveai.com.br` para a hospedagem
3. Configure Stripe, WhatsApp e Google Places em `config.js`
4. Altere o PIN do admin (`admin.pin`)

## Próximos passos opcionais

- Backend real (API + banco) para leads e pagamentos
- E-mail transacional (Resend, SendGrid)
- Analytics (Plausible, GA4)
- PWA / notificações push
