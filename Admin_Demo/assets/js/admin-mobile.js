// Admin MOBILE enhancements — strict no-op on desktop.
// The file only activates below 900px (same breakpoint as the desktop
// stylesheet's own stacking rules). Nothing here runs on desktop.
(function(){
  'use strict';
  if(!window.matchMedia) return;
  var mq = window.matchMedia('(max-width:900px)');
  if(!mq.matches) return;
  // Crossing the breakpoint later (window resize/rotation) reloads so the
  // correct experience boots from scratch on either side.
  if(mq.addEventListener){ mq.addEventListener('change', function(){ location.reload(); }); }
  // Back/forward cache restores the previous DOM+JS heap as-is (stale UI
  // after new assets ship). Reboot on bfcache restore instead.
  window.addEventListener('pageshow', function(e){ if(e.persisted) location.reload(); });

  function $(s, r){ return (r || document).querySelector(s); }
  function $all(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  var sidebar = document.getElementById('sidebar');
  var topbar = document.querySelector('.topbar');
  var content = document.querySelector('.content');
  if(!sidebar || !topbar || !content) return; // e.g. login page: nothing to adapt

  /* ---------- 1. collapsible drawer sidebar ---------- */
  var navBtn = document.createElement('button');
  navBtn.className = 'm-navbtn';
  navBtn.type = 'button';
  navBtn.setAttribute('aria-label', 'Ouvrir le menu');
  navBtn.setAttribute('aria-expanded', 'false');
  navBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  topbar.insertBefore(navBtn, topbar.firstChild);

  var backdrop = document.createElement('div');
  backdrop.className = 'm-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.appendChild(backdrop);

  function setNav(open){
    sidebar.classList.toggle('open', open);
    document.documentElement.classList.toggle('m-nav-open', open);
    navBtn.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    navBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  navBtn.addEventListener('click', function(){ setNav(!sidebar.classList.contains('open')); });
  backdrop.addEventListener('click', function(){ setNav(false); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') setNav(false); });
  $all('.nav a', sidebar).forEach(function(a){ a.addEventListener('click', function(){ setNav(false); }); });

  /* ---------- 2. thumb-zone bottom bar (hrefs reused from existing DOM) ---------- */
  function navHref(part){
    var links = $all('#sidebar .nav a[href]');
    for(var i = 0; i < links.length; i++){
      if((links[i].getAttribute('href') || '').indexOf(part) >= 0) return links[i].getAttribute('href');
    }
    return null;
  }
  var siteLink = topbar.querySelector('a[target="_blank"]');
  var ICONS = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    gift: '<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13"/><path d="M3 12h18"/>',
    mail: '<path d="M4 6h16v12H4z"/><path d="M4 7l8 7 8-7"/>',
    kanban: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>',
    ext: '<path d="M15 3h6v6"/><path d="M10 14L21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>'
  };
  var tabs = [
    {label: 'Accueil', icon: ICONS.grid, href: navHref('dashboard.php')},
    {label: 'Dons', icon: ICONS.gift, href: navHref('donations.php')},
    {label: 'Messages', icon: ICONS.mail, href: navHref('messages.php')},
    {label: 'Projets', icon: ICONS.kanban, href: navHref('projects.php')},
    {label: 'Site', icon: ICONS.ext, href: siteLink ? siteLink.getAttribute('href') : null, blank: true}
  ].filter(function(t){ return !!t.href; });
  var cur = (location.pathname.split('/').pop() || '').split('?')[0];
  var bar = document.createElement('nav');
  bar.className = 'm-tabbar';
  bar.setAttribute('aria-label', 'Navigation principale');
  tabs.forEach(function(t){
    var a = document.createElement('a');
    a.href = t.href;
    if(t.blank) a.target = '_blank';
    a.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + t.icon + '</svg><span></span>';
    a.lastChild.textContent = t.label;
    if(t.href.split('/').pop().split('?')[0] === cur) a.classList.add('on');
    bar.appendChild(a);
  });
  document.body.appendChild(bar);

  /* ---------- 2b. lang tabs: full names become FRA/ENG/ESP/ARA codes ---------- */
  var LANG_CODES = {fr: 'FRA', en: 'ENG', es: 'ESP', ar: 'ARA'};
  $all('.lang-tabs-nav [data-lang-tab]').forEach(function(btn){
    if(btn.dataset.mShort) return;
    var code = LANG_CODES[btn.getAttribute('data-lang-tab')];
    if(!code) return;
    btn.dataset.mShort = '1';
    btn.setAttribute('aria-label', (btn.textContent || '').trim().replace(/\s+/g, ' '));
    Array.prototype.slice.call(btn.childNodes).forEach(function(n){ if(n.nodeType === 3) n.nodeValue = ''; });
    var c = document.createElement('span');
    c.className = 'm-langcode';
    c.textContent = code;
    btn.appendChild(c);
  });

  /* ---------- 2c. messages feed hooks (CSS scopes the feed layout) ---------- */
  if(location.pathname.split('/').pop() === 'messages.php'){
    document.body.classList.add('m-page-messages');
    var mtab = (location.search.match(/[?&]tab=(contact|aide)/) || [])[1] || 'contact';
    document.body.classList.add('m-tab-' + mtab);
  }

  /* ---------- 3. dense tables become labeled card stacks ---------- */
  function thTexts(tr){ return $all('th', tr).map(function(th){ return (th.textContent || '').trim().replace(/\s+/g, ' '); }); }
  $all('table.table').forEach(function(tbl){
    var ths = $all('thead th', tbl).map(function(th){ return (th.textContent || '').trim().replace(/\s+/g, ' '); });
    var bodyRows = $all('tbody tr', tbl);
    if(!ths.length){
      // thead-less tables (dashboard, messages): first row doubles as header
      var first = tbl.querySelector('tr');
      var fths = first ? thTexts(first) : [];
      if(fths.length && fths.some(function(t){ return !!t; })){
        ths = fths;
        bodyRows = $all('tr', tbl).slice(1);
      }
    }
    var card = tbl.closest('.card');
    if(card) card.style.overflow = 'visible';
    bodyRows.forEach(function(tr){
      var tds = $all('td', tr);
      if(!ths.length || tds.length !== ths.length){ tr.classList.add('m-nolabel'); return; }
      tds.forEach(function(td, i){
        if(!td.hasAttribute('data-m-label')){
          if(ths[i]) td.setAttribute('data-m-label', ths[i]);
          else td.classList.add('m-nolabel-cell');
        }
      });
    });
  });

  /* ---------- 4. ruthless hierarchy: action queue right under the KPIs ---------- */
  if(document.getElementById('barsZone')){
    var kpis = document.querySelector('.grid4');
    var heads = $all('.card-head h3');
    for(var i = 0; i < heads.length; i++){
      if((heads[i].textContent || '').indexOf("File d'action") >= 0){
        var qcard = heads[i].closest('.card');
        if(qcard && kpis && kpis.parentNode) kpis.parentNode.insertBefore(qcard, kpis.nextSibling);
        break;
      }
    }
  }

  /* ---------- 5. dense visuals collapse to their textual summaries ---------- */
  ['barsZone', 'cumulZone'].forEach(function(id){
    var z = document.getElementById(id);
    if(z && !z.querySelector('.empty')) z.classList.add('m-noviz');
  });

  /* ---------- 6. progressive disclosure: collapsible cards ---------- */
  var cards = $all('.content .card').filter(function(c){
    return Array.prototype.filter.call(c.children, function(n){ return n.classList && n.classList.contains('card-head'); }).length > 0;
  });
  cards.forEach(function(card, idx){
    var head = null, body = document.createElement('div'), seen = false;
    body.className = 'm-body';
    Array.prototype.slice.call(card.childNodes).forEach(function(n){
      if(!seen && n.classList && n.classList.contains('card-head')){ seen = true; return; }
      if(seen) body.appendChild(n);
    });
    if(!seen) return;
    card.appendChild(body);
    var key = 'mcol:' + location.pathname + ':' + idx, open = idx < 2;
    try{ var v = sessionStorage.getItem(key); if(v !== null) open = (v === '1'); }catch(_){ open = idx < 2; }
    var tgl = document.createElement('button');
    tgl.type = 'button'; tgl.className = 'm-toggle';
    tgl.setAttribute('aria-label', 'Replier / déplier la section');
    tgl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
    function paint(){
      card.classList.toggle('m-closed', !open);
      tgl.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    tgl.addEventListener('click', function(){
      open = !open;
      try{ sessionStorage.setItem(key, open ? '1' : '0'); }catch(_){}
      paint();
    });
    head = Array.prototype.filter.call(card.children, function(n){ return n.classList && n.classList.contains('card-head'); })[0];
    if(head) head.appendChild(tgl);
    paint();
  });

  /* ---------- 7. pages.php: native inline editing (mobile only) ----------
     Tap a preview section to edit it in place; floating bar saves/cancels.
     The desktop drawer flow is untouched (drawer is hidden on mobile). */
  (function(){
    var frame = document.getElementById('previewFrame');
    var ctx = document.getElementById('mEditCtx');
    if(!frame || !ctx) return;
    var CSRF = ctx.getAttribute('data-csrf') || '';
    var editing = null; // {key, el, snapshot, isStat}

    if(frame.classList) frame.classList.add('mobile');

    /* Mobile/desktop preview switch (mobile-native replacement for #deviceToggle) */
    var DEVKEY = 'm-pages-preview';
    var devMode = 'mobile';
    try{ if(sessionStorage.getItem(DEVKEY) === 'desktop') devMode = 'desktop'; }catch(_){}
    var pToolbar = document.querySelector('.pages-toolbar');
    if(pToolbar){
      var seg = document.createElement('div');
      seg.className = 'm-deviceseg';
      seg.setAttribute('role', 'group');
      seg.setAttribute('aria-label', 'Aperçu mobile ou bureau');
      seg.innerHTML =
        '<button type="button" data-m-dev="mobile">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg><span>Mobile</span></button>' +
        '<button type="button" data-m-dev="desktop">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg><span>Bureau</span></button>';
      pToolbar.insertBefore(seg, pToolbar.firstChild);
      var devBtns = Array.prototype.slice.call(seg.querySelectorAll('[data-m-dev]'));
      function paintDev(){
        devBtns.forEach(function(b){
          var on = b.getAttribute('data-m-dev') === devMode;
          if(on) b.classList.add('on'); else b.classList.remove('on');
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        if(devMode === 'mobile') frame.classList.add('mobile');
        else frame.classList.remove('mobile');
      }
      devBtns.forEach(function(b){
        b.addEventListener('click', function(){
          if(b.getAttribute('data-m-dev') === devMode) return;
          devMode = b.getAttribute('data-m-dev');
          try{ sessionStorage.setItem(DEVKEY, devMode); }catch(_){}
          paintDev();
          try{ window.dispatchEvent(new window.Event('resize')); }catch(_){}
        });
      });
      paintDev();
    }

    var bar = document.createElement('div');
    bar.className = 'm-savebar';
    bar.setAttribute('hidden', '');
    bar.innerHTML = '<span class="m-savebar-label"></span>' +
      '<button type="button" class="btn btn-light" data-m-cancel>Annuler</button>' +
      '<button type="button" class="btn btn-primary" data-m-save>Enregistrer</button>';
    document.body.appendChild(bar);
    var barLabel = bar.querySelector('.m-savebar-label');

    function frameLang(){
      try{ var m = (frame.src || '').match(/[?&]lang=([a-z]+)/); if(m) return m[1]; }catch(_){}
      return 'fr';
    }
    function saveUrl(){ return frame.src ? frame.src.split('?')[0] : location.href; }
    function reloadFrame(){
      try{ frame.src = saveUrl() + '?preview=1&lang=' + frameLang() + '&t=' + Date.now(); }catch(_){}
    }
    function isDirty(){
      return !!(editing && editing.el && editing.el.innerHTML !== editing.snapshot);
    }
    function exitEdit(restore){
      if(!editing) return;
      try{
        editing.el.contentEditable = 'false';
        editing.el.classList.remove('m-editing');
        if(restore) editing.el.innerHTML = editing.snapshot;
      }catch(_){}
      editing = null;
      bar.setAttribute('hidden', '');
    }
    function postSave(payload){
      payload.action = 'save';
      payload.csrf = CSRF;
      payload.lang = frameLang();
      return fetch(saveUrl(), {method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: new URLSearchParams(payload)})
        .then(function(r){ return r.json(); });
    }
    function saveEdit(){
      if(!editing || editing.isStat) return Promise.resolve(false);
      var key = editing.key, val = editing.el.innerHTML;
      return postSave({block_key: key, value: val}).then(function(j){
        if(j && j.ok){
          exitEdit(false);
          reloadFrame();
          if(window.ta && ta.alert) ta.alert('Enregistré ✓', {type: 'success', title: key});
          return true;
        }
        if(window.ta && ta.alert) ta.alert('Erreur : ' + ((j && j.err) || ''), {type: 'danger', title: 'Erreur'});
        return false;
      }).catch(function(){
        if(window.ta && ta.alert) ta.alert('Erreur réseau', {type: 'danger', title: 'Erreur réseau'});
        return false;
      });
    }
    function statParts(el){
      var strong = el.querySelector('strong,b'), span = el.querySelector('span');
      return {number: strong ? strong.textContent : '', label: span ? span.textContent : ''};
    }
    function editStat(key){
      var p = statParts(editing.el);
      window.ta.prompt('Nombre affiché (12 max) :', p.number, {title: key}).then(function(num){
        if(num === null){ exitEdit(true); return; }
        window.ta.prompt('Label :', p.label, {title: key}).then(function(lab){
          if(lab === null){ exitEdit(true); return; }
          if(num.length > 12 || lab.length > 60){
            window.ta.alert('Nombre (12 max) ou label (60 max) trop long.', {type: 'warning', title: 'Trop long'});
            editStat(key);
            return;
          }
          postSave({block_key: key, number: num, value: lab}).then(function(j){
            if(j && j.ok){ exitEdit(false); reloadFrame(); window.ta.alert('Enregistré ✓', {type: 'success', title: key}); }
            else window.ta.alert('Erreur : ' + ((j && j.err) || ''), {type: 'danger', title: 'Erreur'});
          }).catch(function(){ window.ta.alert('Erreur réseau', {type: 'danger', title: 'Erreur réseau'}); });
        });
      });
    }
    function startEdit(key, el){
      if(editing && editing.el === el) return;
      var proceed = function(){
        editing = {key: key, el: el, snapshot: el.innerHTML, isStat: key.indexOf('stat.') === 0};
        barLabel.textContent = key;
        bar.removeAttribute('hidden');
        if(editing.isStat){ editStat(key); return; }
        try{ el.contentEditable = 'true'; el.classList.add('m-editing'); el.focus(); }catch(_){}
      };
      if(isDirty()){
        window.ta.modal({type: 'warning', title: 'Modifications non enregistrées',
          message: 'Enregistrer les modifications de « ' + editing.key + ' » ?',
          buttons: [
            {label: 'Enregistrer', value: 'save', kind: 'primary'},
            {label: 'Abandonner', value: 'discard', kind: 'danger'},
            {label: 'Continuer l’édition', value: false, kind: 'ghost'}
          ]}).then(function(choice){
          if(choice === 'save'){ saveEdit().then(function(ok){ if(ok) proceed(); }); }
          else if(choice === 'discard'){ exitEdit(true); proceed(); }
        });
        return;
      }
      if(editing) exitEdit(true);
      proceed();
    }
    bar.querySelector('[data-m-save]').addEventListener('click', function(){
      if(!editing) return;
      if(editing.isStat){ exitEdit(true); return; }
      saveEdit();
    });
    bar.querySelector('[data-m-cancel]').addEventListener('click', function(){ exitEdit(true); });
    function frameKey(e){ if(e.key === 'Escape' && editing){ e.preventDefault(); exitEdit(true); } }
    document.addEventListener('keydown', frameKey);
    function attachFrame(){
      // file://: each file is an opaque origin — touching contentDocument
      // logs "Unsafe attempt..." even in try/catch. Mobile inline-edit is http(s)-only.
      try{ if(location.protocol === 'file:') return; }catch(_){}
      var doc;
      try{ doc = frame.contentDocument; }catch(_){ return; }
      if(!doc || !doc.querySelectorAll) return;
      try{
        var old = doc.querySelector('style[data-m-edit]');
        if(old) old.parentNode.removeChild(old);
        var st = doc.createElement('style');
        st.setAttribute('data-m-edit', '1');
        st.textContent = '.m-editing{outline:2px solid #5AA9E6 !important;outline-offset:2px;}[data-block]{cursor:pointer}';
        (doc.head || doc.documentElement).appendChild(st);
      }catch(_){}
      Array.prototype.slice.call(doc.querySelectorAll('[data-block]')).forEach(function(el){
        if(el.dataset.mBound) return;
        el.dataset.mBound = '1';
        el.addEventListener('click', function(e){
          e.preventDefault();
          startEdit(el.dataset.block, el);
        });
      });
      try{ doc.addEventListener('keydown', frameKey); }catch(_){}
    }
    frame.addEventListener('load', function(){
      editing = null;
      try{ bar.setAttribute('hidden', ''); }catch(_){}
      attachFrame();
    });
    attachFrame();
    // lang tabs guard our own dirty state (capture first: page's bubble handler runs only if we let the event through)
    var langTabs = document.getElementById('langTabs');
    if(langTabs){
      langTabs.addEventListener('click', function(e){
        var btn = e.target.closest('[data-lang]');
        if(!btn || !isDirty()) return;
        e.preventDefault();
        e.stopPropagation();
        window.ta.modal({type: 'warning', title: 'Modifications non enregistrées',
          message: 'Enregistrer les modifications de « ' + editing.key + ' » avant de changer de langue ?',
          buttons: [
            {label: 'Enregistrer', value: 'save', kind: 'primary'},
            {label: 'Abandonner', value: 'discard', kind: 'danger'},
            {label: 'Rester', value: false, kind: 'ghost'}
          ]}).then(function(choice){
          if(choice === 'save'){ saveEdit().then(function(ok){ if(ok) btn.click(); }); }
          else if(choice === 'discard'){ exitEdit(true); btn.click(); }
        });
      }, true);
    }
    document.addEventListener('click', function(e){
      var a = e.target.closest('a[href]');
      if(!a || a.target === '_blank' || a.hasAttribute('download')) return;
      var raw = a.getAttribute('href');
      if(!raw || raw.charAt(0) === '#' || raw.indexOf('javascript:') === 0) return;
      var dest;
      try{ dest = new URL(a.href, location.href); }catch(_){ return; }
      if(dest.origin !== location.origin) return;
      if(dest.pathname === location.pathname && dest.search === location.search) return;
      if(!isDirty()) return;
      e.preventDefault();
      e.stopPropagation();
      window.ta.modal({type: 'warning', title: 'Modifications non enregistrées',
        message: 'Enregistrer les modifications de « ' + editing.key + ' » avant de quitter ?',
        buttons: [
          {label: 'Enregistrer puis quitter', value: 'save', kind: 'primary'},
          {label: 'Quitter sans enregistrer', value: 'discard', kind: 'danger'},
          {label: 'Rester', value: false, kind: 'ghost'}
        ]}).then(function(choice){
        if(choice === 'save'){ saveEdit().then(function(ok){ if(ok) window.location.href = dest.href; }); }
        else if(choice === 'discard'){ window.location.href = dest.href; }
      });
    }, true);
    window.addEventListener('beforeunload', function(e){
      if(isDirty()){ e.preventDefault(); e.returnValue = ''; }
    });
  })();

  /* ---------- 8. settings.php: testing column becomes a collapsible ---------- */
  (function(){
    var dash = document.getElementById('activeKeysDashboard');
    if(!dash) return;
    var col = dash.closest('.ia-col-right');
    if(!col || col.dataset.mIa) return;
    col.dataset.mIa = '1';
    col.classList.add('m-iacollapse');
    var head = col.querySelector('.ak-section-title');
    if(!head) return;
    var body = document.createElement('div');
    body.className = 'm-ibbody';
    var seenHead = false;
    Array.prototype.slice.call(col.childNodes).forEach(function(n){
      if(!seenHead && n === head){ seenHead = true; return; }
      if(seenHead) body.appendChild(n);
    });
    col.appendChild(body);
    var tgl = document.createElement('button');
    tgl.type = 'button';
    tgl.className = 'm-toggle';
    tgl.setAttribute('aria-label', 'Afficher / masquer les tests de modèles');
    tgl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
    head.appendChild(tgl);
    var key = 'mia:' + location.pathname, open = false; // tucked away by default
    try{ var v = sessionStorage.getItem(key); if(v !== null) open = (v === '1'); }catch(_){ open = false; }
    function paint(){
      col.classList.toggle('m-closed', !open);
      tgl.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    tgl.addEventListener('click', function(){
      open = !open;
      try{ sessionStorage.setItem(key, open ? '1' : '0'); }catch(_){}
      paint();
    });
    paint();
  })();
})();
