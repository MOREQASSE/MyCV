/* Admin_Demo — offline shim. Runs synchronously in <head>, before any page script.
   1) Auth guard (client-side demo gate, mirrors the real login flow).
   2) fetch wrapper serving baked data/*.json + canned mutation replies.
   No request ever leaves the browser. */
(function () {
  'use strict';
  var page = location.pathname.substring(location.pathname.lastIndexOf('/') + 1).split('?')[0] || 'login.html';
  var isLogin = (page === 'login.html');

  /* ---------- 1. auth guard ---------- */
  /* Previews (preview-home-*.html / preview-mission-*.html) run inside the
     Pages editor iframe: they are the *public site* mock, never gated.
     Without this, opening pages.html via file:// before login would make
     the iframe itself navigate to login.html, which Chrome logs as
     "Unsafe attempt to load URL file:///.../login.html from frame ...". */
  var inFrame = false;
  try { inFrame = (window.self !== window.top); } catch (e) { inFrame = true; }
  try {
    if (isLogin && /(?:\?|&)logout=1(?:&|$)/.test(location.search)) sessionStorage.removeItem('admin_demo');
    if (!isLogin && !inFrame && sessionStorage.getItem('admin_demo') !== '1') { location.replace('login.html'); return; }
  } catch (e) { /* storage unavailable: let the page show */ }

  /* ---------- 2. fetch stub ---------- */
  function jsonResp(obj, status) {
    var payload = JSON.stringify(obj);
    if (typeof Response !== 'undefined') {
      try { return new Response(payload, { status: status || 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } }); } catch (e) {}
    }
    // minimal Response shape (very old engines): covers r.ok / r.json() / r.text()
    return { ok: (status || 200) < 400, status: status || 200, json: function () { return Promise.resolve(JSON.parse(payload)); }, text: function () { return Promise.resolve(payload); } };
  }
  function baseName(p) {
    var b = (p || '').split('?')[0].split('/').pop() || '';
    return b.replace(/\.(php|html)$/i, '').toLowerCase();
  }
  function parseBody(options) {
    var out = {};
    try {
      var b = options && options.body;
      if (!b) return out;
      if (typeof b === 'string') {
        if (/^\s*\{/.test(b)) { try { return JSON.parse(b); } catch (e) { return out; } }
        b.split('&').forEach(function (pair) {
          var kv = pair.split('=');
          if (kv[0]) out[decodeURIComponent(kv[0])] = decodeURIComponent((kv[1] || '').replace(/\+/g, ' '));
        });
        return out;
      }
      if (typeof FormData !== 'undefined' && (b instanceof FormData)) { b.forEach(function (v, k) { out[k] = v; }); return out; }
      if (typeof URLSearchParams !== 'undefined' && (b instanceof URLSearchParams)) { b.forEach(function (v, k) { out[k] = v; }); return out; }
    } catch (e) {}
    return out;
  }
  function dataUrl(f) {
    try { return new URL('data/' + f, location.href).href; } catch (e) { return 'data/' + f; }
  }
  function whitelist(v, list, fb) { return list.indexOf(v) >= 0 ? v : fb; }

  /* baked data (embedded per page for file:// support; falls back to data/*.json) */
  function baked(map, key) {
    try {
      var D = window.DEMO_DATA || {};
      if (D[map] && D[map][key] !== undefined) return Promise.resolve(jsonResp(D[map][key]));
    } catch (e) {}
    return null;
  }

  /* static preview mapper for the Pages editor (patched call sites) */
  window.demoPreview = function (lang, section) {
    lang = whitelist(lang, ['fr', 'en', 'es', 'ar'], 'fr');
    return (section === 'mission' ? 'preview-mission-' : 'preview-home-') + lang + '.html';
  };

  if (!window.fetch) return;
  var realFetch = window.fetch.bind(window);
  window.fetch = function (input, options) {
    var raw = (typeof input === 'string') ? input : (input && input.url) || '';
    var u;
    try { u = new URL(raw, location.href); } catch (e) { return realFetch(input, options); }
    if (u.host !== location.host) return realFetch(input, options); // never touch external traffic
    var name = baseName(u.pathname);
    var method = ((options && options.method) || (input && input.method) || 'GET').toUpperCase();
    var qp = function (k) { try { return u.searchParams.get(k); } catch (e) { return null; } };

    /* Pages editor: baked block lists */
    if (name === 'pages' && (qp('action') || '') === 'load' && method === 'GET') {
      var pg = whitelist(qp('page'), ['home', 'mission'], 'home');
      var lg = whitelist(qp('lang'), ['fr', 'en', 'es', 'ar'], 'fr');
      return baked('pages', pg + '|' + lg) || realFetch(dataUrl('pages-' + pg + '-' + lg + '.json'));
    }
    /* Dashboard charts: baked snapshots */
    if (name === 'dashboard' && (qp('format') || '') === 'json') {
      var target = qp('target') || '';
      if (target === 'recent') {
        var dst = whitelist(qp('dst'), ['all', 'new', 'pending', 'paid'], 'all');
        return baked('recent', dst) || realFetch(dataUrl('dash-recent-' + dst + '.json'));
      }
      var known = ['kpi', 'bars', 'cumul', 'donors', 'methods'];
      if (known.indexOf(target) >= 0) {
        var range = whitelist(qp('range'), ['7', '30', '90'], '30');
        return baked('dash', target + '|' + range) || realFetch(dataUrl('dash-' + target + '-' + range + '.json'));
      }
      return Promise.resolve(jsonResp({ ok: false, error: 'demo' }));
    }
    if (method === 'POST') {
      var body = parseBody(options);
      /* AI model test: canned reply */
      if (name === 'test_model') {
        return Promise.resolve(jsonResp({ ok: true, reply: 'Bonjour ! Ceci est une réponse simulée du mode démo — aucune clé IA n’est utilisée ici.', model: 'démo-statique', provider: 'démo' }));
      }
      /* AI translate: echo source into each target */
      if (name === 'translate') {
        var src = body.sourceText || body.source || '';
        var targets = body.targetLangs || body.targets || ['en', 'es', 'ar'];
        if (typeof targets === 'string') { try { targets = JSON.parse(targets); } catch (e) { targets = [targets]; } }
        var tr = {};
        (Array.isArray(targets) ? targets : ['en', 'es', 'ar']).forEach(function (t) { tr[t] = src + '\n\n— traduit en mode démo (sans IA)'; });
        return Promise.resolve(jsonResp({ ok: true, translations: tr }));
      }
      /* Pages editor saves: echo back */
      if (name === 'pages') {
        var act = body.action || '';
        if (act === 'save') return Promise.resolve(jsonResp({ ok: true, value: (body.value !== undefined ? body.value : '') }));
        if (act === 'add_stat') return Promise.resolve(jsonResp({ ok: true }));
        return Promise.resolve(jsonResp({ ok: true }));
      }
      /* every other mutation (delete / reorder / validate / toggle / status) */
      return Promise.resolve(jsonResp({ ok: true }));
    }
    /* Public API (preview iframes): empty but valid */
    if (/\/api\//i.test(u.pathname)) {
      return Promise.resolve(jsonResp({ ok: true, lang: 'fr', blocks: {}, stats: [], team: [], projects: [], news: [] }));
    }
    return realFetch(input, options);
  };
})();
