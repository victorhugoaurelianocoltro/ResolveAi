# Google Places — ResolveAí

## O que faz (com API Key)

- Autocomplete de **cidade** nos formulários (Home, categorias, busca, perfil)
- **Avaliações do Google** no perfil do prestador (se tiver `googlePlaceId`)
- **Mapa** embed na área de atendimento do prestador

Sem API Key, o site continua 100% funcional com dados mock.

## Configurar

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto e ative:
   - **Maps JavaScript API**
   - **Places API**
3. Crie uma **API Key** e restrinja por domínio (HTTP referrer) em produção
4. Cole em `js/config.js`:

```javascript
googlePlacesApiKey: 'AIza...',
```

## Avaliações reais no perfil

Em `js/data.js`, no prestador desejado:

```javascript
googlePlaceId: 'ChIJ...', // ID do Google Business
```

Para achar o Place ID: Google Maps → seu negócio → compartilhar → ou use a [Place ID Finder](https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder).

## Custos

Google cobra por uso das APIs. Para MVP/teste, use crédito gratuito do Cloud e limite de requisições no console.
