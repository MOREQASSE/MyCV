/* ============================================================
   Chess_Admin portfolio demo runtime (static, isolated).
   - Login gate (admin@demo.com / admin123 via sessionStorage)
   - Demo ribbon is baked into each page server-side at build time
   - Toasts for disabled mutations + external-link interception
   ============================================================ */
(function () {
    'use strict';

    var isLogin = /(^|\/)login\.html$/.test(location.pathname);

    // ---- Login gate ----
    try {
        if (!isLogin && sessionStorage.getItem('chessAdminAuth') !== '1') {
            location.replace('login.html');
            return;
        }
        if (isLogin && sessionStorage.getItem('chessAdminAuth') === '1') {
            location.replace('dashboard.html');
            return;
        }
    } catch (e) { /* storage unavailable: stay put */ }

    // ---- Toast ----
    function toast(msg, tone) {
        var wrap = document.getElementById('demoToastWrap');
        if (!wrap) {
            wrap = document.createElement('div');
            wrap.id = 'demoToastWrap';
            wrap.style.cssText = 'position:fixed;bottom:1rem;left:50%;transform:translateX(-50%);z-index:3000;display:flex;flex-direction:column;gap:0.5rem;align-items:center;pointer-events:none;width:min(480px,calc(100vw - 2rem));';
            document.body.appendChild(wrap);
        }
        var el = document.createElement('div');
        el.style.cssText = 'background:#111;color:#fff;border:3px solid ' +
            (tone === 'ok' ? '#00ff88' : '#7c3aed') +
            ';box-shadow:4px 4px 0 #111;padding:0.7rem 1rem;font-size:0.85rem;font-weight:600;pointer-events:auto;max-width:100%;';
        el.textContent = msg;
        wrap.appendChild(el);
        setTimeout(function () { el.remove(); }, 3200);
    }
    window.demoToast = toast;

    // ---- Static hosting has no backend: answer API-ish fetches locally ----
    // (wall votes/messages, bulk chunks, live counts). Real logic untouched;
    // this only keeps buttons responsive in the portfolio demo.
    try {
        var realFetch = window.fetch.bind(window);
        window.fetch = function (url, opts) {
            var u = String((url && url.url) || url || '');
            if (/messages_api\.php|bulk_update_members|check_messages|update_attendance|upload\.php/i.test(u)) {
                toast('Demo mode — simulated response.', 'ok');
                return Promise.resolve({
                    ok: true,
                    json: async function () {
                        return { ok: true, success: true, done: 1, total: 1, sent: 0, failed: 0, finished: true, messages: [], total_messages: 0, likes: 0, dislikes: 0, user_vote: null };
                    },
                    text: async function () { return '{}'; }
                });
            }
            return realFetch(url, opts);
        };
    } catch (e) {}

    // ---- Ribbon placement: inside .nb-main (below the fixed topbar)
    // so it never covers the sidebar brand or topbar. Login has no
    // shell, so the ribbon stays at body start there.
    try {
        var ribbon = document.getElementById('demoRibbon');
        var main = document.querySelector('.nb-main');
        if (ribbon && main && ribbon.parentElement !== main) {
            main.prepend(ribbon);
        }
        if (ribbon && main) {
            ribbon.style.position = 'sticky';
            ribbon.style.top = 'var(--nb-header-height, 64px)';
            ribbon.style.zIndex = '900';
        }
    } catch (e) {}

    document.addEventListener('DOMContentLoaded', function () {
        // ---- Sidebar active link follows the real page (child views
        // highlight their parent section) ----
        try {
            var page = (location.pathname.split('/').pop() || 'index.html').split('?')[0];
            var parent = {
                'member-add.html': 'members.html',
                'member-edit.html': 'members.html',
                'announcement-add.html': 'announcements.html',
                'announcement-edit.html': 'announcements.html',
                'form-add.html': 'announcements-forms.html',
                'form-candidates.html': 'announcements-forms.html',
                'form-versions.html': 'announcements-forms.html',
                'formation-add.html': 'formations.html',
                'formation-edit.html': 'formations.html',
                'sponsor-edit.html': 'sponsors.html',
                'newsletter-edit.html': 'newsletter.html',
                'newsletter-subs.html': 'newsletter.html',
                'admin-create.html': 'admins.html',
                'admin-edit.html': 'admins.html'
            }[page] || page;
            document.querySelectorAll('.nb-nav-link').forEach(function (a) {
                var href = (a.getAttribute('href') || '').split('?')[0];
                a.classList.toggle('active', href === parent);
            });
        } catch (e) {}

        // ---- Login form: the only "real" action in the demo ----
        var loginForm = document.getElementById('adminLoginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', function (e) {
                e.preventDefault();
                var email = (document.getElementById('admin-email') || {}).value || '';
                var pass = document.getElementById('admin-password') || {};
                var btn = loginForm.querySelector('button[type="submit"]');
                if (email.trim().toLowerCase() === 'admin@demo.com' && pass.value === 'admin123') {
                    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-check"></i> Welcome!'; }
                    try { sessionStorage.setItem('chessAdminAuth', '1'); } catch (err) {}
                    setTimeout(function () { location.href = 'dashboard.html'; }, 700);
                } else {
                    loginForm.classList.remove('demo-shake');
                    void loginForm.offsetWidth;
                    loginForm.classList.add('demo-shake');
                    toast('Use admin@demo.com / admin123 for this portfolio demo.');
                }
            });
            var st = document.createElement('style');
            st.textContent = '@keyframes demoShake{0%,100%{transform:none}25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}.demo-shake{animation:demoShake .3s ease 2;}';
            document.head.appendChild(st);
        }

        // ---- Logout links clear the demo session ----
        document.querySelectorAll('a[href="login.html"]').forEach(function (a) {
            a.addEventListener('click', function () {
                try { sessionStorage.removeItem('chessAdminAuth'); } catch (e) {}
            });
        });

        // ---- Disabled mutations: confirm-style toast, no navigation ----
        document.querySelectorAll('form[data-demo-form]').forEach(function (f) {
            f.addEventListener('submit', function (e) {
                if (f.id === 'adminLoginForm') return; // handled above
                e.preventDefault();
                toast('Saved in demo (not persisted) — portfolio showcase only.', 'ok');
            });
        });

        // ---- Destructive / external links ----
        document.addEventListener('click', function (e) {
            var t = e.target.closest ? e.target.closest('a[href]') : null;
            if (!t) return;
            var href = t.getAttribute('href') || '';
            if (href === 'https://moreqasse.github.io/MyCV/') {
                e.preventDefault();
                toast('External site — not part of this portfolio demo.');
            } else if (href === '#demo-missing') {
                e.preventDefault();
                toast('File not included in this demo package.');
            } else if (/action=(delete|duplicate|export|toggle|reset|send|publish)|view=preview/.test(href)) {
                e.preventDefault();
                toast('Disabled in demo — portfolio showcase only.');
            }
        });
    });
})();
