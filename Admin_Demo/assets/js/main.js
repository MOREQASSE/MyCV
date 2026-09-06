// Association Taourirt — Conception interactions (perf: <1.5kB, no deps)
(function(){
  var btn = document.getElementById('menuBtn');
  var drawer = document.getElementById('drawer');
  var closeBtn = document.getElementById('drawerClose');
  function open(){
    if(!drawer) return;
    drawer.classList.add('open');
    drawer.removeAttribute('inert');
    drawer.setAttribute('aria-hidden','false');
    if(btn) btn.setAttribute('aria-expanded','true');
    document.body.style.overflow='hidden';
    // move focus inside for a11y
    if(closeBtn) closeBtn.focus();
  }
  function close(){
    if(!drawer) return;
    // if focus is inside drawer, move it out before hiding to avoid aria-hidden focus warning
    if(drawer.contains(document.activeElement)){
      if(btn) btn.focus();
      else if(document.activeElement) document.activeElement.blur();
    }
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden','true');
    drawer.setAttribute('inert','');
    if(btn) btn.setAttribute('aria-expanded','false');
    document.body.style.overflow='';
  }
  if(btn) btn.addEventListener('click', open);
  if(closeBtn) closeBtn.addEventListener('click', close);
  if(drawer) drawer.addEventListener('click', function(e){ if(e.target.hasAttribute('data-close')) close(); });

  // Smooth close on nav click
  var links = document.querySelectorAll('.drawer-nav a');
  links.forEach(function(a){ a.addEventListener('click', close); });

  // Donation amount toggle (demo)
  document.querySelectorAll('[data-don-amount]').forEach(function(el){
    el.addEventListener('click', function(){
      document.querySelectorAll('[data-don-amount]').forEach(function(x){ x.classList.remove('active'); });
      el.classList.add('active');
    });
  });
  document.querySelectorAll('[data-choice]').forEach(function(el){
    el.addEventListener('click', function(){
      document.querySelectorAll('[data-choice]').forEach(function(x){ x.classList.remove('active'); });
      el.classList.add('active');
    });
  });

  // Gallery filter demo
  var filters = document.querySelectorAll('.filters button');
  var cards = document.querySelectorAll('[data-filter-card]');
  filters.forEach(function(b){
    b.addEventListener('click', function(){
      filters.forEach(function(x){ x.classList.remove('active'); });
      b.classList.add('active');
      var f = b.getAttribute('data-filter');
      cards.forEach(function(c){
        var cat = c.getAttribute('data-cat');
        c.style.display = (f==='all' || cat===f) ? '' : 'none';
      });
    });
  });

  // Mock form submit
  document.querySelectorAll('form[data-mock]').forEach(function(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var msg = document.createElement('div');
      msg.textContent = '✓ Merci — message bien reçu (démo).';
      msg.style.cssText = 'margin-top:12px;padding:12px 14px;border-radius:12px;background:#EAF4FB;border:1px solid #CDE4F5;color:#12365F;font-size:13px;font-weight:600';
      form.appendChild(msg);
      setTimeout(function(){ msg.remove(); }, 4000);
      form.reset();
    });
  });

  // Sticky transparent → white progressive (home only) — identical to --solid at end, like other pages
  (function(){
    var header = document.querySelector('.site-header');
    if(!header || header.classList.contains('site-header--solid')) return;
    var ticking = false;
    function apply(){
      var y = window.scrollY || document.documentElement.scrollTop;
      var t = Math.min(Math.max(y / 64, 0), 1);
      header.style.setProperty('--scroll', t.toFixed(3));
      if(t > 0.02) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');
      ticking = false;
    }
    window.addEventListener('scroll', function(){
      if(!ticking){ requestAnimationFrame(apply); ticking = true; }
    }, {passive:true});
    apply();
    // fallback if DOM not ready yet (defer should handle, but be safe)
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', apply);
    }
  })();

  // Escape to close drawer
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') close(); });
})();
