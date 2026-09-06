/* Admin_Demo — interaction shim (deferred, after admin.js).
   Login gate, logout, simulated saves, demo notices. */
(function () {
  'use strict';
  var DEMO_MAIL = 'admin@demo.com';
  var DEMO_PASS = 'admin123';

  function toast(msg, title) {
    try {
      if (window.ta && ta.alert) { ta.alert(msg, { type: 'info', title: title || 'Maquette de démonstration' }); return; }
    } catch (e) {}
    window.alert((title ? title + '\n\n' : '') + msg);
  }

  /* ---------- login ---------- */
  var loginForm = document.getElementById('demoLogin') || document.querySelector('form.login-form');
  if (loginForm && /login\.html$/.test(location.pathname)) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var mail = (loginForm.querySelector('input[name="email"],input[type="email"]') || {}).value || '';
      var pass = (loginForm.querySelector('input[name="password"],input[type="password"]') || {}).value || '';
      if (mail.trim().toLowerCase() === DEMO_MAIL && pass === DEMO_PASS) {
        try { sessionStorage.setItem('admin_demo', '1'); } catch (err) {}
        location.href = 'dashboard.html';
      } else {
        var box = loginForm.parentElement.querySelector('.login-error');
        if (!box) {
          box = document.createElement('div');
          box.className = 'login-error';
          loginForm.parentElement.insertBefore(box, loginForm);
        }
        box.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg> Email ou mot de passe incorrect.<br><small style="opacity:.8">Démo : admin@demo.com / admin123</small>';
        box.style.display = 'flex';
      }
    });
    // prefill hint for the portfolio visitor
    try {
      var em = loginForm.querySelector('input[name="email"],input[type="email"]');
      var pw = loginForm.querySelector('input[name="password"],input[type="password"]');
      if (em && !em.value) em.value = DEMO_MAIL;
      if (pw && !pw.value) pw.value = DEMO_PASS;
    } catch (e) {}
  }

  /* ---------- logout ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href*="logout"]') : null;
    if (!a) return;
    e.preventDefault();
    try { sessionStorage.removeItem('admin_demo'); } catch (err) {}
    location.href = 'login.html?logout=1';
  });

  /* ---------- "Voir le site" + dead preview links ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href="#voir-site"]') : null;
    if (!a) return;
    e.preventDefault();
    toast('Le site public n’est pas inclus dans cette maquette statique — seules les pages d’administration sont présentées.', 'Site public non inclus');
  });

  /* ---------- simulated saves (plain POST forms) ----------
     Delete/validate/toggle forms are handled by admin.js + stubbed fetch;
     every other POST is a content save → toast, no navigation. */
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f || f.id === 'demoLogin' || (f.classList && f.classList.contains('login-form'))) return;
    if (f.closest && f.closest('form[data-del],form[data-mut]')) return;
    if ((f.getAttribute('method') || 'get').toLowerCase() !== 'post') return;
    e.preventDefault();
    e.stopPropagation();
    toast('Enregistrement simulé — aucune donnée n’est modifiée dans cette maquette.', 'Sauvegarde simulée');
  }, true);
})();
