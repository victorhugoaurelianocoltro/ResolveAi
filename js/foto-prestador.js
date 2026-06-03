/**
 * ResolveAí — Foto de perfil do prestador (compressão no admin)
 */
window.OrcajaFotoPrestador = (function () {
  'use strict';

  const ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_INPUT_MB = 8;
  const MAX_DIM = 512;

  function getMaxKb() {
    const cfg = typeof ORCAJA_CONFIG !== 'undefined' ? ORCAJA_CONFIG : {};
    return cfg.maxFotoKb != null ? cfg.maxFotoKb : 400;
  }

  function readFile(file) {
    return new Promise(function (resolve, reject) {
      const r = new FileReader();
      r.onload = function () {
        resolve(r.result);
      };
      r.onerror = function () {
        reject(new Error('Não foi possível ler o arquivo.'));
      };
      r.readAsDataURL(file);
    });
  }

  function loadImage(dataUrl) {
    return new Promise(function (resolve, reject) {
      const img = new Image();
      img.onload = function () {
        resolve(img);
      };
      img.onerror = function () {
        reject(new Error('Imagem inválida.'));
      };
      img.src = dataUrl;
    });
  }

  function canvasToBlob(canvas, mime, quality) {
    return new Promise(function (resolve) {
      canvas.toBlob(
        function (blob) {
          resolve(blob);
        },
        mime,
        quality
      );
    });
  }

  function blobToDataUrl(blob) {
    return new Promise(function (resolve, reject) {
      const r = new FileReader();
      r.onload = function () {
        resolve(r.result);
      };
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  }

  function estimateKb(dataUrl) {
    const base64 = String(dataUrl).split(',')[1] || '';
    return (base64.length * 3) / 4 / 1024;
  }

  async function compressDataUrl(dataUrl, maxKb) {
    const img = await loadImage(dataUrl);
    let w = img.naturalWidth || img.width;
    let h = img.naturalHeight || img.height;
    const scale = Math.min(1, MAX_DIM / Math.max(w, h));
    w = Math.max(1, Math.round(w * scale));
    h = Math.max(1, Math.round(h * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);

    const mime = 'image/jpeg';
    let quality = 0.88;
    let out = await canvasToBlob(canvas, mime, quality);
    if (!out) throw new Error('Falha ao comprimir a imagem.');

    while (out.size / 1024 > maxKb && quality > 0.35) {
      quality -= 0.08;
      out = await canvasToBlob(canvas, mime, quality);
      if (!out) break;
    }

    if (out.size / 1024 > maxKb) {
      throw new Error(
        'Imagem ainda grande após compressão (máx. ~' + maxKb + ' KB). Use uma foto menor.'
      );
    }

    return blobToDataUrl(out);
  }

  async function compressFile(file) {
    if (!file || !ACCEPT.includes(file.type)) {
      throw new Error('Use JPG, PNG ou WebP.');
    }
    if (file.size > MAX_INPUT_MB * 1024 * 1024) {
      throw new Error('Arquivo muito grande (máx. ' + MAX_INPUT_MB + ' MB antes da compressão).');
    }
    const raw = await readFile(file);
    return compressDataUrl(raw, getMaxKb());
  }

  return {
    getMaxKb,
    compressFile,
    estimateKb,
  };
})();
