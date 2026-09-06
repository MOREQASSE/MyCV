// Admin AI Translate — enterprise grade UI/UX, SVG icons, per-field + overall translation
(function(){
  const CSRF = document.querySelector('input[name="csrf"]')?.value || '';
  const LANGS = ['fr','en','es','ar'];
  const FIELD_MAP = {
    title: { selector: (l)=>`input[name="title_${l}"]`, type:'title' },
    summary: { selector: (l)=>`textarea[name="summary_${l}"]`, type:'summary' },
    excerpt: { selector: (l)=>`textarea[name="excerpt_${l}"]`, type:'excerpt' },
    body: { selector: (l)=>`#body_${l}`, type:'body', hidden: (l)=>`#body_${l}_hidden` },
    location: { selector: (l)=>`input[name="location_${l}"]`, type:'location' },
    role: { selector: (l)=>`input[name="role_${l}"]`, type:'role' },
    bio: { selector: (l)=>`textarea[name="bio_${l}"]`, type:'bio' },
  };

  const ICONS = {
    spark: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c0 4.5-3.5 8-8 8 4.5 0 8 3.5 8 8 0-4.5 3.5-8 8-8-4.5 0-8-3.5-8-8z"/><path d="M19 3c0 2.25-1.75 4-4 4 2.25 0 4 1.75 4 4 0-2.25 1.75-4 4-4-2.25 0-4-1.75-4-4z"/></svg>`,
    success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    undo: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>`,
    close: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
  };

  function detectFields(){
    const present=[];
    for(const [field, cfg] of Object.entries(FIELD_MAP)){
      for(const l of LANGS){
        const sel=cfg.selector(l);
        if(document.querySelector(sel)){ if(!present.includes(field)) present.push(field); break; }
      }
    }
    return present;
  }
  const FIELDS = detectFields();
  if(!FIELDS.length) return;

  // Enterprise Toast Container & Helper
  let toastContainer = null;
  function getToastContainer(){
    if(!toastContainer){
      toastContainer = document.createElement('div');
      toastContainer.className = 'ai-toast-container';
      document.body.appendChild(toastContainer);
    }
    return toastContainer;
  }

  function notify(type, title, desc, opts={}){
    const container = getToastContainer();
    const card = document.createElement('div');
    card.className = `ai-toast-card ai-toast-${type}`;

    const iconSvg = type==='success' ? ICONS.success : (type==='error' ? ICONS.error : ICONS.warning);

    let undoHtml = '';
    if(opts.undo){
      undoHtml = `<button type="button" class="ai-toast-undo-btn">${ICONS.undo} Annuler</button>`;
    }

    card.innerHTML = `
      <div class="ai-toast-icon-wrap">${iconSvg}</div>
      <div class="ai-toast-body">
        <div class="ai-toast-title">${title}</div>
        ${desc ? `<div class="ai-toast-desc">${desc}</div>` : ''}
      </div>
      ${undoHtml}
      <button type="button" class="ai-toast-close" title="Fermer">${ICONS.close}</button>
    `;

    container.appendChild(card);

    if(opts.undo){
      const undoBtn = card.querySelector('.ai-toast-undo-btn');
      if(undoBtn){
        undoBtn.addEventListener('click', ()=>{
          opts.undo();
          dismiss();
        });
      }
    }

    const closeBtn = card.querySelector('.ai-toast-close');
    if(closeBtn) closeBtn.addEventListener('click', dismiss);

    function dismiss(){
      card.style.opacity = '0';
      card.style.transform = 'translateY(8px) scale(0.95)';
      setTimeout(()=> card.remove(), 200);
    }

    const duration = opts.duration || 6000;
    setTimeout(dismiss, duration);
  }

  function getVal(field, lang){
    const cfg=FIELD_MAP[field];
    if(!cfg) return '';
    const el=document.querySelector(cfg.selector(lang));
    if(!el) return '';
    if(field==='body'){
      return el.innerHTML.trim();
    } else {
      return (el.value||'').trim();
    }
  }

  function setVal(field, lang, value){
    const cfg=FIELD_MAP[field];
    if(!cfg) return null;
    const el=document.querySelector(cfg.selector(lang));
    if(!el) return null;
    const prev = field==='body' ? el.innerHTML : el.value;
    if(!el.dataset.aiPrev) el.dataset.aiPrev = prev;
    if(field==='body'){
      el.innerHTML = value;
      const hidden=document.querySelector(cfg.hidden(lang));
      if(hidden) hidden.value=value;
      el.dispatchEvent(new Event('input',{bubbles:true}));
      el.style.outline='2px solid #5AA9E6';
      setTimeout(()=> el.style.outline='', 1200);
    } else {
      el.value = value;
      el.dispatchEvent(new Event('input',{bubbles:true}));
      el.dispatchEvent(new Event('change',{bubbles:true}));
      el.style.boxShadow='0 0 0 3px rgba(90,169,230,.18)';
      setTimeout(()=> el.style.boxShadow='', 1200);
    }
    return prev;
  }

  function hasContent(field, lang){
    const v=getVal(field, lang);
    return v && v.replace(/<[^>]*>/g,'').trim().length>0;
  }

  async function showConfirmOverwrite(field, targetLangs){
    const nonEmpty = targetLangs.filter(l=> hasContent(field,l));
    if(!nonEmpty.length) return true;
    return ta.confirm(`Le champ "${field}" contient déjà du contenu en ${nonEmpty.join(', ').toUpperCase()}.\n\nVoulez-vous remplacer ce contenu par la nouvelle traduction IA ?`, {type:'warning', title:'Remplacer le contenu ?', okText:'Remplacer'});
  }

  function setBtnLoading(btn, on, label){
    if(!btn) return;
    btn.disabled = !!on;
    if(on){
      btn.dataset.aiPrevText = btn.dataset.aiPrevText || btn.innerHTML;
      btn.innerHTML = `<span class="ai-spin"></span>${label || 'Traduction en cours…'}`;
    } else {
      btn.innerHTML = btn.dataset.aiPrevText || btn.innerHTML;
    }
  }

  async function translateField(field, sourceLang){
    const sourceText = getVal(field, sourceLang);
    if(!sourceText){
      notify('warning', 'Texte source vide', 'Veuillez saisir du texte en français avant de traduire.');
      return;
    }
    const targetLangs = LANGS.filter(l=> l!==sourceLang);
    if(!(await showConfirmOverwrite(field, targetLangs))) return;

    const btn = document.querySelector(`[data-ai-btn="${field}-${sourceLang}"]`);
    const tgs = targetLangs.join('/').toUpperCase();
    setBtnLoading(btn, true, `Traduction → ${tgs}…`);

    const prevs = {};
    targetLangs.forEach(l=>{
      const cfg=FIELD_MAP[field];
      const el=document.querySelector(cfg.selector(l));
      if(el) prevs[l]= field==='body' ? el.innerHTML : el.value;
    });

    try{
      const res = await fetch('api/translate.php', {
        method:'POST',
        headers:{'Content-Type':'application/json','X-CSRF-TOKEN': CSRF},
        body: JSON.stringify({csrf:CSRF, sourceLang, field, sourceText, targetLangs})
      });
      const j = await res.json();
      if(!j.ok){
        const detail = j.detail ? ` (${j.detail})` : '';
        notify('error', 'Échec de la traduction', `${j.error || 'Erreur du serveur IA'}${detail}`);
        setBtnLoading(btn, false);
        return;
      }
      const trans=j.translations||{};
      let applied=0;
      for(const tl of targetLangs){
        if(trans[tl] && trans[tl].trim()){
          setVal(field, tl, trans[tl]);
          applied++;
        }
      }
      const undo = ()=>{
        for(const tl of targetLangs){
          if(prevs[tl]!==undefined) setVal(field, tl, prevs[tl]);
        }
        notify('info', 'Traduction annulée', 'Le contenu initial a été restauré.');
      };
      setBtnLoading(btn, false);
      if(applied > 0){
        notify('success', 'Traduction terminée', `${applied} langue(s) mise(s) à jour via ${j.model || 'l’IA'}.`, {undo, duration: 8000});
      } else {
        notify('warning', 'Aucune réponse', 'Aucun résultat de traduction n’a été reçu.');
      }
    } catch(e){
      notify('error', 'Erreur réseau', `Impossible de contacter le service IA : ${e.message}`);
      setBtnLoading(btn, false);
    }
  }

  function injectFieldButtons(){
    FIELDS.forEach(field=>{
      LANGS.forEach(lang=>{
        const cfg=FIELD_MAP[field];
        const inputSel=cfg.selector(lang);
        const el=document.querySelector(inputSel);
        if(!el) return;
        let label = el.closest('.field')?.querySelector('label');
        if(!label) label = el.parentElement?.querySelector('label');
        if(!label) return;
        if(label.querySelector(`[data-ai-btn="${field}-${lang}"]`)) return;
        const btn=document.createElement('button');
        btn.type='button';
        btn.className = 'ai-btn';
        btn.dataset.aiBtn = `${field}-${lang}`;
        btn.dataset.aiPrevText = `${ICONS.spark} Traduire IA → ${LANGS.filter(x=>x!==lang).join('/').toUpperCase()}`;
        btn.innerHTML = btn.dataset.aiPrevText;
        btn.title = `Traduire automatiquement ce ${field} depuis ${lang.toUpperCase()}`;
        label.appendChild(btn);
        btn.addEventListener('click', ()=> translateField(field, lang));

        const show = ()=>{
          const v = getVal(field, lang);
          const has = v && v.replace(/<[^>]*>/g,'').trim().length>2;
          btn.style.display = has ? 'inline-flex' : 'none';
        };
        el.addEventListener('input', show);
        el.addEventListener('change', show);
        if(field==='body'){
          const hidden=document.querySelector(cfg.hidden(lang));
          if(hidden) hidden.addEventListener('input', show);
        }
        setTimeout(show, 200);
      });
    });
  }

  function injectOverallButtons(){
    const tabsWrap=document.querySelector('[data-lang-tabs]');
    if(!tabsWrap) return;
    LANGS.forEach(lang=>{
      const pane=document.querySelector(`.tab-pane[data-lang="${lang}"]`);
      if(!pane) return;
      if(pane.querySelector(`[data-ai-overall="${lang}"]`)) return;
      const bar=document.createElement('div');
      bar.className = 'ai-overall-bar';
      bar.dataset.aiOverall=lang;
      bar.innerHTML=`
        <span class="ai-overall-msg">
          <span style="color:#0A66C2;display:inline-flex;align-items:center">${ICONS.spark}</span>
          <span>Traduire l’ensemble des champs <b>${lang.toUpperCase()}</b> → <b>${LANGS.filter(x=>x!==lang).join('/').toUpperCase()}</b> en 1 clic</span>
        </span>
        <button type="button" class="ai-overall-btn" data-ai-overall-btn="${lang}">
          ${ICONS.spark} Tout traduire via IA
        </button>
      `;
      pane.insertBefore(bar, pane.firstChild);
      const btn=bar.querySelector('.ai-overall-btn');
      btn.addEventListener('click', async ()=>{
        const targets = LANGS.filter(l=>l!==lang);
        btn.disabled=true;
        btn.innerHTML = `<span class="ai-spin"></span>Traduction globale…`;
        let total=0;
        let failed=0;
        for(const field of FIELDS){
          const src=getVal(field, lang);
          if(!src || src.replace(/<[^>]*>/g,'').trim().length<2) continue;
          if(!(await showConfirmOverwrite(field, targets))){ continue; }
          try{
            const res= await fetch('api/translate.php',{
              method:'POST',
              headers:{'Content-Type':'application/json','X-CSRF-TOKEN': CSRF},
              body: JSON.stringify({csrf:CSRF, sourceLang:lang, field, sourceText:src, targetLangs:targets})
            });
            const j=await res.json();
            if(j.ok){
              for(const tl of targets){
                if(j.translations[tl]){ setVal(field, tl, j.translations[tl]); total++; }
              }
            } else {
              failed++;
              notify('error', 'Erreur de traduction', `${field}: ${j.error}`);
            }
          }catch(e){ failed++; notify('error', 'Erreur de connexion', `${field}: ${e.message}`); }
        }
        btn.disabled=false;
        btn.innerHTML = `${ICONS.spark} Tout traduire via IA`;
        if(total>0 && failed===0){
          notify('success', 'Traduction globale réussie', `${total} champs traduits depuis ${lang.toUpperCase()}.`);
        } else if(total>0){
          notify('warning', 'Traduction partielle', `${total} champs traduits, ${failed} erreur(s).`);
        } else if(failed>0){
          notify('error', 'Échec de la traduction', 'Vérifiez la configuration des clés API dans les Réglages.');
        } else {
          notify('warning', 'Aucun contenu', 'Veuillez saisir du texte avant de lancer la traduction.');
        }
      });

      const check=()=>{
        const all = FIELDS.every(f=> hasContent(f, lang));
        bar.style.display = all ? 'flex' : 'none';
      };
      FIELDS.forEach(f=>{
        const el=document.querySelector(FIELD_MAP[f].selector(lang));
        if(el){
          el.addEventListener('input', check);
          el.addEventListener('change', check);
        }
      });
      setTimeout(check, 400);
    });
  }

  function init(){
    injectFieldButtons();
    injectOverallButtons();
    document.querySelectorAll('[data-lang-tab]').forEach(b=> b.addEventListener('click', ()=>{
      setTimeout(()=>{ injectFieldButtons(); injectOverallButtons(); }, 80);
    }));
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
