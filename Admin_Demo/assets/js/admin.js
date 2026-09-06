// Admin JS — collapsible sidebar, tabs, sortable, wysiwyg light
document.addEventListener('DOMContentLoaded',()=>{
  const sb=document.getElementById('sidebar'), btn=document.getElementById('sidebarToggle');
  if(btn&&sb){
    const saved=localStorage.getItem('admin_sidebar_collapsed')==='1';
    if(saved) sb.classList.add('collapsed');
    btn.addEventListener('click',()=>{
      sb.classList.toggle('collapsed');
      sb.classList.toggle('open');
      localStorage.setItem('admin_sidebar_collapsed', sb.classList.contains('collapsed')?'1':'0');
    });
  }

  // language tabs
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-lang-tab]');
    if(!btn) return;
    const wrap = btn.closest('[data-lang-tabs]');
    if(!wrap) return;
    const lang = btn.getAttribute('data-lang-tab');
    if(!lang) return;

    wrap.querySelectorAll('[data-lang-tab]').forEach(b=>{
      b.classList.toggle('active', b===btn || b.getAttribute('data-lang-tab')===lang);
    });
    wrap.querySelectorAll('.tab-pane').forEach(p=>{
      p.classList.toggle('active', p.getAttribute('data-lang')===lang);
    });
  });

  // light wysiwyg
  document.querySelectorAll('[data-wys]').forEach(id=>{
    const area=document.getElementById(id);
    const toolbar=document.querySelector(`[data-toolbar="${id}"]`);
    if(!area||!toolbar) return;
    toolbar.querySelectorAll('button').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const cmd=btn.dataset.cmd;
        if(cmd==='createLink'){
          const restore=(window.ta && ta.keepSelection) ? ta.keepSelection() : function(){};
          ta.prompt('Adresse du lien :','https://',{title:'Insérer un lien'}).then(url=>{
            restore(); area.focus();
            if(url) document.execCommand(cmd,false,url);
            const hidden=document.getElementById(id+'_hidden');
            if(hidden) hidden.value=area.innerHTML;
          });
          return;
        } else document.execCommand(cmd,false,null);
        area.focus();
        const hidden=document.getElementById(id+'_hidden');
        if(hidden) hidden.value=area.innerHTML;
      });
    });
    area.addEventListener('input',()=>{
      const hidden=document.getElementById(id+'_hidden');
      if(hidden) hidden.value=area.innerHTML;
    });
    const hidden=document.getElementById(id+'_hidden');
    if(hidden && area.innerHTML.trim()==='' && hidden.value) area.innerHTML=hidden.value;
  });

  // gallery cover selector
  document.querySelectorAll('[data-cover-btn]').forEach(b=>{
    b.addEventListener('click',()=>{
      const id=b.dataset.coverBtn;
      document.querySelectorAll('[data-cover-radio]').forEach(r=>r.value='0');
      const r=document.querySelector(`[data-cover-radio="${id}"]`);
      if(r) r.value='1';

      document.querySelectorAll('.gal-card').forEach(c=>c.classList.remove('is-cover'));
      document.querySelectorAll('[data-cover-btn]').forEach(btn=>{
        btn.classList.remove('btn-primary', 'active');
        btn.classList.add('btn-light');
        btn.textContent = '☆ Définir cover';
      });

      b.classList.remove('btn-light');
      b.classList.add('btn-primary', 'active');
      b.textContent = '★ Cover';

      const card = b.closest('.gal-card');
      if(card) card.classList.add('is-cover');
    });
  });

  // shared password show/hide — eye toggle (reusable .pwd-wrap)
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-pwd-toggle]');
    if(!btn) return;
    const wrap = btn.closest('.pwd-wrap');
    const input = wrap ? wrap.querySelector('input[type="password"], input[type="text"]') : document.getElementById(btn.getAttribute('data-pwd-toggle'));
    if(!input) return;
    const isPwd = input.type === 'password';
    input.type = isPwd ? 'text' : 'password';
    btn.setAttribute('aria-label', isPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe');
    btn.setAttribute('aria-pressed', isPwd ? 'true' : 'false');
    // swap icons
    const eye = btn.querySelector('.icon-eye');
    const eyeOff = btn.querySelector('.icon-eye-off');
    if(eye && eyeOff){ eye.style.display = isPwd ? 'none' : 'block'; eyeOff.style.display = isPwd ? 'block' : 'none'; }
    // keep focus
    input.focus();
  });
  // dropzone previews
  const logoInput=document.getElementById('logoInput');
  const logoPreview=document.getElementById('logoPreview');
  if(logoInput && logoPreview){
    logoInput.addEventListener('change',()=>{
      const f=logoInput.files[0]; if(!f) return;
      const url=URL.createObjectURL(f);
      logoPreview.innerHTML=`<img src="${url}" style="height:40px;border:1px solid #E2EEF8;border-radius:8px;padding:4px;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.06)"><small style="display:block;margin-top:6px;font-size:11px;color:#64748B">${f.name} · ${(f.size/1024).toFixed(1)} KB</small>`;
    });
  }

  const galInput=document.getElementById('galInput');
  const galPreview=document.getElementById('galPreview');
  if(galInput){
    const dz=galInput.closest('.dropzone');
    if(dz){
      ['dragenter','dragover'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.add('dragover');}));
      ['dragleave','drop'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove('dragover');}));
    }
    galInput.addEventListener('change',()=>{
      if(!galPreview) return;
      galPreview.style.display='grid';
      galPreview.innerHTML='';
      [...galInput.files].forEach((f, idx)=>{
        const url=URL.createObjectURL(f);
        const d=document.createElement('div');
        d.style.cssText = 'position:relative;background:#fff;border:1px solid #E2EEF8;border-radius:12px;padding:8px;box-shadow:0 2px 8px rgba(0,0,0,.04)';
        d.innerHTML=`
          <img src="${url}" style="width:100%;height:80px;object-fit:cover;border-radius:8px;border:1px solid #E2EEF8">
          <small style="font-size:10.5px;font-weight:700;color:#0B2240;display:block;margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${f.name}</small>
          <small style="font-size:10px;color:#64748B">${(f.size/1024).toFixed(1)} KB · <span style="color:#059669">Nouveau</span></small>
        `;
        galPreview.appendChild(d);
      });
    });
  }

  // sortable (HTML5 drag & re-number order inputs)
  const grid=document.getElementById('galleryGrid');
  if(grid){
    let dragEl=null;

    function updateGridSequence(){
      grid.querySelectorAll('.gal-card').forEach((card, idx)=>{
        const seqBadge = card.querySelector('.gal-index-badge');
        if(seqBadge) seqBadge.textContent = '#' + (idx + 1);
        const orderInput = card.querySelector('input[name^="gal_order"]');
        if(orderInput) orderInput.value = idx + 1;
      });
    }

    grid.querySelectorAll('.gal-card').forEach(card=>{
      card.draggable=true;
      card.addEventListener('dragstart',()=>{dragEl=card; card.style.opacity='.4'});
      card.addEventListener('dragend',()=>{card.style.opacity=''; updateGridSequence();});
      card.addEventListener('dragover',e=>e.preventDefault());
      card.addEventListener('drop',e=>{
        e.preventDefault();
        if(dragEl && dragEl!==card){
          const nodes=[...grid.children];
          const dI=nodes.indexOf(dragEl), cI=nodes.indexOf(card);
          if(dI<cI) card.after(dragEl); else card.before(dragEl);
          updateGridSequence();
        }
      });
    });
  }
});

// ── ta-modal: shared confirm/alert/prompt popups (replaces window.confirm/alert/prompt) ──
// Global on purpose: inline onsubmit/onclick handlers call taConfirmSubmit directly.
// Variations via `type`: info | success | warning | danger. Danger also styles the OK button.
(function(){
  'use strict';
  var ICONS = {
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.5h.01"/>',
    success: '<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5.5"/>',
    warning: '<path d="M12 3.5l9.5 16.5H2.5z"/><path d="M12 10v4.5"/><path d="M12 17.5h.01"/>',
    danger: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V13"/><path d="M12 16.5h.01"/>'
  };
  var VALID = {info:1, success:1, warning:1, danger:1};
  var current = null; // {settle, ov, prompt}

  function cleanup(){
    if(!current) return;
    var ov = current.ov, prev = current.prevFocus, onKey = current.onKey;
    current = null;
    if(onKey){ try{ document.removeEventListener('keydown', onKey); }catch(_){} }
    if(ov && ov.parentNode) ov.parentNode.removeChild(ov);
    if(document.body) document.body.style.overflow = '';
    if(prev && prev.focus){ try{ prev.focus(); }catch(_){} }
  }
  function settle(val){
    if(!current) return;
    var r = current.settle;
    cleanup();
    try{ r(val); }catch(_){}
  }

  function open(o){
    o = o || {};
    var type = VALID[o.type] ? o.type : 'info';
    var isPrompt = !!o.input;
    // A new popup dismisses any pending one (settled as cancelled) — no hung promises.
    if(current) settle(isPrompt ? null : false);
    return new Promise(function(resolve){
      var prevFocus = document.activeElement;
      var ov = document.createElement('div');
      ov.className = 'ta-ov ta-' + type;
      var card = document.createElement('div');
      card.className = 'ta-card';
      card.setAttribute('role', 'alertdialog');
      card.setAttribute('aria-modal', 'true');
      card.setAttribute('aria-label', o.title || (isPrompt ? 'Saisie requise' : (o.showCancel === false ? 'Information' : 'Confirmation')));

      var top = document.createElement('div'); top.className = 'ta-top'; card.appendChild(top);
      var body = document.createElement('div'); body.className = 'ta-body';
      var ico = document.createElement('div'); ico.className = 'ta-ico'; ico.setAttribute('aria-hidden', 'true');
      ico.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + ICONS[type] + '</svg>';
      var txt = document.createElement('div'); txt.className = 'ta-text';
      var title = document.createElement('div'); title.className = 'ta-title';
      title.textContent = o.title || (isPrompt ? 'Saisie requise' : (o.showCancel === false ? 'Information' : 'Confirmation'));
      var msg = document.createElement('div'); msg.className = 'ta-msg';
      msg.textContent = (o.message === undefined || o.message === null) ? '' : String(o.message);
      txt.appendChild(title); txt.appendChild(msg);

      var inputEl = null;
      if(isPrompt){
        inputEl = document.createElement('input');
        inputEl.className = 'ta-input';
        inputEl.type = 'text';
        inputEl.value = o.inputValue || '';
        if(o.inputPlaceholder) inputEl.setAttribute('placeholder', o.inputPlaceholder);
        inputEl.setAttribute('aria-label', o.title || 'Saisie');
        txt.appendChild(inputEl);
      }
      body.appendChild(ico); body.appendChild(txt); card.appendChild(body);

      var foot = document.createElement('div'); foot.className = 'ta-foot';
      if(Array.isArray(o.buttons) && o.buttons.length){
        // N-button mode (e.g. save / discard / stay): each button resolves its value.
        o.buttons.forEach(function(b){
          b = b || {};
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'ta-btn ' + (b.kind === 'primary' ? 'ta-ok' : (b.kind === 'danger' ? 'ta-quit' : 'ta-cancel'));
          btn.textContent = b.label || 'OK';
          (function(val){ btn.addEventListener('click', function(){ settle(val); }); })(('value' in b) ? b.value : true);
          foot.appendChild(btn);
        });
      } else {
      var okBtn = document.createElement('button');
      okBtn.type = 'button'; okBtn.className = 'ta-btn ta-ok';
      okBtn.textContent = o.okText || (isPrompt ? 'Valider' : 'OK');
      foot.appendChild(okBtn);
      if(o.showCancel !== false){
        var cancelBtn = document.createElement('button');
        cancelBtn.type = 'button'; cancelBtn.className = 'ta-btn ta-cancel';
        cancelBtn.textContent = o.cancelText || 'Annuler';
        cancelBtn.addEventListener('click', function(){ settle(isPrompt ? null : false); });
        foot.insertBefore(cancelBtn, okBtn);
      }
      } /* end single-OK mode */
      card.appendChild(foot);
      ov.appendChild(card);

      current = {settle: resolve, ov: ov, prompt: isPrompt, prevFocus: prevFocus, onKey: null};

      ov.addEventListener('mousedown', function(ev){ if(ev.target === ov) settle(isPrompt ? null : false); });
      if(typeof okBtn !== 'undefined' && okBtn){
      okBtn.addEventListener('click', function(){ settle(isPrompt ? (inputEl ? inputEl.value : '') : true); });
      }
      function onKey(ev){
        if(!current || current.ov !== ov) return;
        if(ev.key === 'Escape'){ ev.preventDefault(); settle(isPrompt ? null : false); }
        else if(ev.key === 'Enter'){
          if(isPrompt){ ev.preventDefault(); okBtn.click(); }
          else if(o.showCancel === false){ ev.preventDefault(); okBtn.click(); }
        }
      }
      current.onKey = onKey;
      document.addEventListener('keydown', onKey);

      document.body.appendChild(ov);
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ ov.classList.add('open'); }); });
      setTimeout(function(){ try{
        var target = isPrompt && inputEl ? inputEl
          : (type === 'danger' ? (foot.querySelector('.ta-cancel') || foot.querySelector('.ta-btn')) : (foot.querySelector('.ta-ok') || foot.querySelector('.ta-btn')));
        if(target) target.focus();
      }catch(_){} }, 60);
      if(isPrompt && inputEl){ try{ inputEl.select(); }catch(_){} }
    });
  }

  window.ta = {
    modal: open,
    confirm: function(message, o){
      o = o || {};
      return open({type: o.danger ? 'danger' : (o.type || 'info'), title: o.title || 'Confirmer ?', message: message, okText: o.okText || 'Confirmer', cancelText: o.cancelText, showCancel: true});
    },
    alert: function(message, o){
      o = o || {};
      return open({type: o.type || 'info', title: o.title || 'Information', message: message, okText: o.okText || 'OK', showCancel: false}).then(function(){});
    },
    prompt: function(message, def, o){
      o = o || {};
      return open({type: 'info', title: o.title || 'Saisie requise', message: message, okText: o.okText || 'Valider', cancelText: o.cancelText, showCancel: true, input: true, inputValue: (def === undefined || def === null) ? '' : String(def), inputPlaceholder: o.placeholder || ''});
    },
    // Saves the current text selection; call the returned fn to restore it
    // (needed because async popups blur contentEditable areas).
    keepSelection: function(){
      try{
        var s = window.getSelection();
        if(!s || !s.rangeCount) return function(){};
        var r = s.getRangeAt(0).cloneRange();
        return function(){ try{ var s2 = window.getSelection(); s2.removeAllRanges(); s2.addRange(r); }catch(_){} };
      }catch(_){ return function(){}; }
    }
  };

  // Drop-in for inline form guards: onsubmit="return taConfirmSubmit(event, this, 'Supprimer ?')"
  // Shows the popup; on confirm, re-submits (works for plain forms AND fetch-intercepted ones).
  window.taConfirmSubmit = function(e, form, message, opts){
    if(!form) return false;
    if(form._taOk){ form._taOk = false; return true; }
    if(e && e.preventDefault) e.preventDefault();
    var p = (window.ta && ta.confirm)
      ? ta.confirm(message, opts || {danger: true, okText: 'Supprimer'})
      : Promise.resolve(window.confirm(message));
    p.then(function(ok){
      if(!ok) return;
      form._taOk = true;
      if(form.requestSubmit){ try{ form.requestSubmit(); return; }catch(_){} }
      form.submit();
    });
    return false;
  };
})();
