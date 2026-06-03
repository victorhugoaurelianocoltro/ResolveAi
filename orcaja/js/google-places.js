/**
 * ResolveAí — Google Places (opcional)
 * Sem API key: site usa apenas dados mock — nada quebra.
 */
window.ResolveaiPlaces = (function () {
  'use strict';

  const cfg = typeof ORCAJA_CONFIG !== 'undefined' ? ORCAJA_CONFIG : {};
  const key =
    (cfg.googlePlaces && cfg.googlePlaces.apiKey) || cfg.googlePlacesApiKey || '';

  let loadPromise = null;

  function isEnabled() {
    return typeof key === 'string' && key.length > 10 && !key.includes('SUA_');
  }

  function loadMaps() {
    if (!isEnabled()) return Promise.resolve(false);
    if (window.google && window.google.maps && window.google.maps.places) {
      return Promise.resolve(true);
    }
    if (loadPromise) return loadPromise;

    loadPromise = new Promise(function (resolve) {
      const cb = '__resolveaiMapsReady';
      window[cb] = function () {
        resolve(true);
      };
      const script = document.createElement('script');
      script.async = true;
      script.defer = true;
      script.src =
        'https://maps.googleapis.com/maps/api/js?key=' +
        encodeURIComponent(key) +
        '&libraries=places&language=pt-BR&region=BR&callback=' +
        cb;
      script.onerror = function () {
        console.warn('ResolveAí: não foi possível carregar Google Maps.');
        resolve(false);
      };
      document.head.appendChild(script);
    });

    return loadPromise;
  }

  function extractCity(place) {
    const comps = place.address_components || [];
    const locality = comps.find(function (c) {
      return c.types.indexOf('locality') >= 0;
    });
    const admin2 = comps.find(function (c) {
      return c.types.indexOf('administrative_area_level_2') >= 0;
    });
    return (locality || admin2 || {}).long_name || '';
  }

  function bindAutocomplete(input) {
    if (!input || input.dataset.placesBound === '1') return;
    if (!window.google || !window.google.maps || !window.google.maps.places) return;

    input.dataset.placesBound = '1';
    const ac = new google.maps.places.Autocomplete(input, {
      types: ['(cities)'],
      componentRestrictions: { country: 'br' },
      fields: ['address_components', 'formatted_address'],
    });

    ac.addListener('place_changed', function () {
      const place = ac.getPlace();
      if (!place) return;
      const city = extractCity(place);
      if (city) input.value = city;
      else if (place.formatted_address) {
        input.value = place.formatted_address.split(',')[0].trim();
      }
    });
  }

  function initAutocompleteOn(inputs) {
    if (!isEnabled()) return;
    const list = Array.isArray(inputs) ? inputs : [inputs];
    const valid = list.filter(Boolean);
    if (!valid.length) return;

    loadMaps().then(function (ok) {
      if (!ok) return;
      valid.forEach(bindAutocomplete);
    });
  }

  function collectCityInputs() {
    const selectors = [
      '#cidade',
      '#cidade-busca',
      '#wa-cidade',
      '#busca-cidade',
      'input[data-places-city]',
    ];
    const out = [];
    selectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (out.indexOf(el) < 0) out.push(el);
      });
    });
    return out;
  }

  function initPage() {
    initAutocompleteOn(collectCityInputs());
    showApiBanner();
  }

  function showApiBanner() {
    const el = document.querySelector('[data-places-status]');
    if (!el) return;
    if (isEnabled()) {
      el.textContent = 'Autocomplete de cidade ativo (Google Places).';
      el.classList.add('places-status--on');
    } else {
      el.textContent = 'Cidade manual — configure googlePlacesApiKey em config.js para autocomplete.';
      el.classList.remove('places-status--on');
    }
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function enrichProfile(prestador) {
    const block = document.getElementById('profile-google-block');
    if (!block || !prestador) return;

    const placeId = prestador.googlePlaceId;
    if (!isEnabled() || !placeId) {
      block.hidden = true;
      return;
    }

    loadMaps().then(function (ok) {
      if (!ok) {
        block.hidden = true;
        return;
      }

      const host = document.createElement('div');
      const service = new google.maps.places.PlacesService(host);

      service.getDetails(
        {
          placeId: placeId,
          fields: ['name', 'rating', 'user_ratings_total', 'url', 'reviews', 'formatted_address'],
        },
        function (place, status) {
          if (
            status !== google.maps.places.PlacesServiceStatus.OK ||
            !place
          ) {
            block.hidden = true;
            return;
          }
          renderGoogleBlock(block, place);
        }
      );
    });
  }

  function renderGoogleBlock(container, place) {
    const reviews = (place.reviews || []).slice(0, 3);
    container.hidden = false;
    container.innerHTML =
      '<h2 class="inline-form-title" style="text-align:left;">Avaliações no Google</h2>' +
      '<p class="form-hint places-google-meta">Nota <strong>' +
      (place.rating || '—') +
      '</strong> · ' +
      (place.user_ratings_total || 0) +
      ' avaliações públicas</p>' +
      '<div class="google-reviews">' +
      reviews
        .map(function (r) {
          return (
            '<blockquote class="google-review-card">' +
            '<div class="google-review-card__stars" aria-hidden="true">' +
            '★'.repeat(Math.round(r.rating || 5)) +
            '</div>' +
            '<p>' +
            escapeHtml((r.text || '').slice(0, 280)) +
            '</p>' +
            '<footer>— ' +
            escapeHtml(r.author_name) +
            '</footer></blockquote>'
          );
        })
        .join('') +
      '</div>' +
      (place.url
        ? '<a href="' +
          escapeHtml(place.url) +
          '" target="_blank" rel="noopener noreferrer" class="btn btn--secondary btn--sm places-google-link">Ver no Google Maps</a>'
        : '');
  }

  function mapEmbedUrl(prestador) {
    if (!prestador) return null;
    const center = cfg.googlePlaces && cfg.googlePlaces.defaultCenter;
    const q = encodeURIComponent(
      (prestador.bairro ? prestador.bairro + ', ' : '') +
        prestador.cidade +
        ', SP, Brasil'
    );
    if (isEnabled() && center) {
      return (
        'https://www.google.com/maps/embed/v1/place?key=' +
        encodeURIComponent(key) +
        '&q=' +
        q
      );
    }
    return 'https://maps.google.com/maps?q=' + q + '&output=embed';
  }

  return {
    isEnabled: isEnabled,
    loadMaps: loadMaps,
    initAutocompleteOn: initAutocompleteOn,
    initPage: initPage,
    enrichProfile: enrichProfile,
    mapEmbedUrl: mapEmbedUrl,
  };
})();
