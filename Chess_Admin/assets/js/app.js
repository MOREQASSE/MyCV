(function () {
'use strict';
function initBottomNav() {
const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
const currentPath = window.location.pathname;
navLinks.forEach(function (link) {
link.classList.remove('active');
var href = link.getAttribute('href');
if (!href) return;
if (href === currentPath || (href !== '/' && currentPath.indexOf(href) !== -1)) {
link.classList.add('active');
}
if (currentPath === '/' || currentPath === '/Chess' || currentPath === '/Chess/') {
var homeLinks = document.querySelectorAll('.navbar-nav .nav-link[href="' + href + '"]');
homeLinks.forEach(function (hl) {
if (hl.getAttribute('href').indexOf('index') > -1 || hl.getAttribute('href') === currentPath || hl.getAttribute('href') === '/Chess' || hl.getAttribute('href') === '/Chess/') {
hl.classList.add('active');
}
});
}
});
var hasActive = false;
navLinks.forEach(function (link) {
if (link.classList.contains('active')) hasActive = true;
});
if (!hasActive && navLinks.length > 0) {
if (currentPath === '/' || currentPath === '/Chess' || currentPath === '/Chess/') {
navLinks[0].classList.add('active');
}
}
}
function initNavbarScroll() {
var navbar = document.querySelector('.navbar');
if (!navbar) return;
var ticking = false;
function update() {
ticking = false;
if (window.scrollY > 50) {
navbar.classList.add('scrolled');
} else {
navbar.classList.remove('scrolled');
}
}
function handleScroll() {
if (!ticking) {
ticking = true;
requestAnimationFrame(update);
}
}
window.addEventListener('scroll', handleScroll, { passive: true });
update();
}
function initMobileMenu() {
var hamburger = document.querySelector('.hamburger');
var navbarCollapse = document.querySelector('.navbar-collapse');
var navbarToggler = document.querySelector('.navbar-toggler');
var navbar = document.querySelector('.navbar');
if (!hamburger || !navbarCollapse || !navbarToggler) return;
function closeMenu() {
hamburger.classList.remove('active');
navbarCollapse.classList.remove('show');
document.body.style.overflow = '';
}
function toggleMenu() {
hamburger.classList.toggle('active');
navbarCollapse.classList.toggle('show');
if (navbarCollapse.classList.contains('show')) {
document.body.style.overflow = 'hidden';
var firstNavItem = document.querySelector('.nav-link');
if (firstNavItem) firstNavItem.focus();
} else {
document.body.style.overflow = '';
navbarToggler.focus();
}
}
navbarToggler.addEventListener('click', function (e) {
e.stopPropagation();
toggleMenu();
});
var navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(function (link) {
link.addEventListener('click', function () {
if (window.innerWidth <= 991) {
closeMenu();
}
});
});
document.addEventListener('keydown', function (e) {
if (e.key === 'Escape' && navbarCollapse.classList.contains('show')) {
closeMenu();
}
});
document.addEventListener('click', function (e) {
if (!navbar.contains(e.target) &&
!e.target.closest('.navbar-collapse') &&
!e.target.classList.contains('hamburger') &&
!e.target.classList.contains('bar') &&
!e.target.classList.contains('navbar-toggler')) {
closeMenu();
}
});
}
function initFormValidation() {
var forms = document.querySelectorAll('.needs-validation');
Array.prototype.slice.call(forms).forEach(function (form) {
form.addEventListener('submit', function (event) {
if (!form.checkValidity()) {
event.preventDefault();
event.stopPropagation();
}
form.classList.add('was-validated');
}, false);
});
document.querySelectorAll('.form-control').forEach(function (input) {
input.addEventListener('blur', function () {
if (this.checkValidity()) {
this.classList.remove('is-invalid');
this.classList.add('is-valid');
} else {
this.classList.remove('is-valid');
this.classList.add('is-invalid');
}
});
input.addEventListener('input', function () {
if (this.classList.contains('is-invalid')) {
if (this.checkValidity()) {
this.classList.remove('is-invalid');
this.classList.add('is-valid');
}
}
});
});
}
function initTooltips() {
if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
tooltipTriggerList.map(function (el) {
return new bootstrap.Tooltip(el);
});
}
}
window.chessModal = {
open: function (modalId) {
var el = document.getElementById(modalId);
if (!el) return;
if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
var modal = new bootstrap.Modal(el);
modal.show();
} else {
el.classList.add('show');
el.style.display = 'block';
document.body.classList.add('modal-open');
}
},
close: function (modalId) {
var el = document.getElementById(modalId);
if (!el) return;
if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
var modal = bootstrap.Modal.getInstance(el);
if (modal) modal.hide();
} else {
el.classList.remove('show');
el.style.display = 'none';
document.body.classList.remove('modal-open');
}
}
};
function initChessAnimations() {
document.querySelectorAll('.chess-piece, .chess-icon, .chess-bounce').forEach(function (el) {
el.addEventListener('mouseenter', function () {
this.style.transition = 'transform 0.2s ease';
this.style.transform = 'translateY(-4px) scale(1.1)';
});
el.addEventListener('mouseleave', function () {
this.style.transform = 'translateY(0) scale(1)';
});
});
}
function initScrollToTop() {
var btn = document.getElementById('scrollToTop');
if (!btn) return;
window.addEventListener('scroll', function () {
if (window.scrollY > 400) {
btn.classList.add('visible');
} else {
btn.classList.remove('visible');
}
}, { passive: true });
btn.addEventListener('click', function () {
window.scrollTo({ top: 0, behavior: 'smooth' });
});
}
function initStatCounters() {
var counters = document.querySelectorAll('.home-stat__number[data-target], .home-social-proof__number[data-target]');
if (!counters.length) return;
var observed = false;
function animateCount(el) {
var target = parseInt(el.getAttribute('data-target'), 10);
if (isNaN(target) || target < 0) target = 0;
var duration = 1200;
var start = performance.now();
function step(now) {
var elapsed = now - start;
var progress = Math.min(elapsed / duration, 1);
var eased = 1 - Math.pow(1 - progress, 3);
el.textContent = Math.round(eased * target);
if (progress < 1) {
requestAnimationFrame(step);
} else {
el.textContent = target;
}
}
requestAnimationFrame(step);
}
if ('IntersectionObserver' in window) {
var observer = new IntersectionObserver(function (entries) {
entries.forEach(function (entry) {
if (entry.isIntersecting && !observed) {
observed = true;
counters.forEach(function (c) { animateCount(c); });
}
});
}, { threshold: 0.15 });
counters.forEach(function (c) {
var parent = c.closest('.home-stat') || c.closest('.home-social-proof__item') || c;
if (parent) observer.observe(parent);
});
setTimeout(function () {
if (!observed) {
observed = true;
counters.forEach(function (c) { animateCount(c); });
}
}, 800);
} else {
counters.forEach(function (c) { animateCount(c); });
}
}
function initWallMessageModal() {
var btn = document.getElementById('wallMessageBtn');
var modal = document.getElementById('wallMessageModal');
var closeBtn = document.getElementById('wallMessageCloseBtn');
var cancelBtn = document.getElementById('wallMessageCancelBtn');
var backdrop = document.getElementById('wallMessageClose');
var form = document.getElementById('wallMessageForm');
if (!btn || !modal) return;
function openModal() { modal.style.display = 'flex'; }
function closeModal() { modal.style.display = 'none'; }
btn.addEventListener('click', openModal);
if (closeBtn) closeBtn.addEventListener('click', closeModal);
if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
if (backdrop) backdrop.addEventListener('click', closeModal);
document.addEventListener('keydown', function (e) {
if (e.key === 'Escape' && modal.style.display === 'flex') closeModal();
});
if (form) {
form.addEventListener('submit', function (e) {
e.preventDefault();
var name = document.getElementById('wallSenderName');
var content = document.getElementById('wallContent');
var submitBtn = form.querySelector('button[type="submit"]');
if (!name || !content) return;
var msg = content.value.trim();
if (!msg) { content.focus(); return; }
var apiBase = window.CHESS_BASE_URL || '/';
var anon = document.getElementById('wallAnon');
var isAnon = anon && anon.checked;
var fd = new FormData();
fd.append('action', 'send_message');
fd.append('name', isAnon ? '' : name.value.trim());
fd.append('message', msg);
fd.append('anonymous', isAnon ? '1' : '0');
if (submitBtn) submitBtn.disabled = true;
function sendWall(fdToSend){
fetch(apiBase + 'messages_api.php', { method: 'POST', body: fdToSend })
.then(function (r) { return r.json(); })
.then(function (data) {
if (data.success) {
if (submitBtn) {
if (!submitBtn.getAttribute('data-orig')) submitBtn.setAttribute('data-orig', submitBtn.innerHTML);
submitBtn.classList.remove('is-error');
submitBtn.classList.add('is-success');
submitBtn.innerHTML = '<i class="fas fa-check"></i> Posted!';
submitBtn.disabled = true;
setTimeout(function(){
submitBtn.classList.remove('is-success');
submitBtn.innerHTML = submitBtn.getAttribute('data-orig');
submitBtn.disabled = false;
if (anon && anon.checked) {
} else if (name.getAttribute('data-is-logged') === '1') {
var memName = name.getAttribute('data-member-name') || '';
name.value = memName;
} else {
name.value = '';
}
content.value = '';
var counterEl = document.getElementById('wallCounter');
if(counterEl){
counterEl.textContent = '0';
var wrap = counterEl.parentElement;
if(wrap){ wrap.classList.remove('is-warn','is-danger'); }
}
closeModal();
var empty = document.querySelector('.home-empty');
if (empty) empty.textContent = 'Message submitted! It will appear after admin approval.';
}, 900);
} else {
closeModal();
}
} else {
if (submitBtn) {
submitBtn.disabled = false;
submitBtn.classList.remove('is-success');
submitBtn.classList.add('is-error');
var orig = submitBtn.getAttribute('data-orig') || '<i class="fas fa-paper-plane"></i> Post Message';
if (!submitBtn.getAttribute('data-orig')) submitBtn.setAttribute('data-orig', orig);
submitBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ' + (data.message || 'Failed');
setTimeout(function(){
submitBtn.classList.remove('is-error');
submitBtn.innerHTML = submitBtn.getAttribute('data-orig');
}, 1800);
}
content.style.borderColor = '#ff1744';
content.style.boxShadow = '3px 3px 0 #ff1744';
setTimeout(function(){ content.style.borderColor=''; content.style.boxShadow=''; }, 1500);
}
})
.catch(function () {
if (submitBtn) {
submitBtn.disabled = false;
submitBtn.classList.remove('is-success');
submitBtn.classList.add('is-error');
var orig2 = submitBtn.getAttribute('data-orig') || '<i class="fas fa-paper-plane"></i> Post Message';
if (!submitBtn.getAttribute('data-orig')) submitBtn.setAttribute('data-orig', orig2);
submitBtn.innerHTML = '<i class="fas fa-wifi"></i> Network error';
setTimeout(function(){
submitBtn.classList.remove('is-error');
submitBtn.innerHTML = submitBtn.getAttribute('data-orig');
}, 1800);
}
content.style.borderColor = '#ff1744';
content.style.boxShadow = '3px 3px 0 #ff1744';
setTimeout(function(){ content.style.borderColor=''; content.style.boxShadow=''; }, 1500);
});
} /* end sendWall */
// reCAPTCHA v3 token first (server fails closed without it)
if (window.chessCaptcha) {
window.chessCaptcha('wall_message').then(function(token){
fd.append('g-recaptcha-response', token);
sendWall(fd);
}, function(){
if (submitBtn) submitBtn.disabled = false;
alert('Spam check could not load — please refresh the page and try again.');
});
} else { sendWall(fd); }
});
}
}
function initScrollAnimations() {
if (!('IntersectionObserver' in window)) return;
var items = document.querySelectorAll(
'.home-feature-card, .home-announce-card, .home-wall-card, .home-report-card'
);
if (!items.length) return;
var observer = new IntersectionObserver(function (entries) {
entries.forEach(function (entry) {
if (entry.isIntersecting) {
entry.target.style.opacity = '1';
entry.target.style.transform = 'translateY(0)';
observer.unobserve(entry.target);
}
});
}, { threshold: 0.15 });
items.forEach(function (item) {
item.style.opacity = '0';
item.style.transform = 'translateY(20px)';
item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
observer.observe(item);
});
}
function initGravityLens() {
if (window.__lensBooted) return; window.__lensBooted = true;
try {
var fine = window.matchMedia && window.matchMedia('(pointer:fine)').matches;
var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
if (!fine || calm || !window.requestAnimationFrame) return;
var STEP = 12, RAD = 150, PULL = 34, DPR = Math.min(window.devicePixelRatio || 1, 1.5), TAU = 6.2832;
var heroes = [], running = false;
function pull(x, y, cx, cy) {
var dx = cx - x, dy = cy - y, d2 = dx * dx + dy * dy, R = RAD * 2.6;
if (d2 > R * R || d2 < 0.01) return null;
var f = PULL * Math.exp(-d2 / (RAD * RAD)) / Math.sqrt(d2);
return [x + dx * f, y + dy * f];
}
function fit(h) {
var r = h.sec.getBoundingClientRect();
h.w = r.width; h.h = r.height;
h.cv.width = Math.max(1, Math.round(r.width * DPR));
h.cv.height = Math.max(1, Math.round(r.height * DPR));
h.ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
function frame(t) {
var any = false;
for (var i = 0; i < heroes.length; i++) {
var h = heroes[i];
if (!h.vis) continue;
any = true;
h.sx += (h.mx - h.sx) * 0.2; h.sy += (h.my - h.sy) * 0.2;
h.a += (((h.mx > -9000) ? 1 : 0) - h.a) * 0.15;
var ctx = h.ctx, W = h.w, H = h.h, cx = h.sx, cy = h.sy, GAP = h.gap;
ctx.clearRect(0, 0, W, H);
ctx.lineWidth = 1; ctx.strokeStyle = h.grid; ctx.beginPath();
var gx, gy, x, y, p;
for (gx = 0.5; gx <= W + 1; gx += GAP) { for (y = -STEP; y <= H + STEP; y += STEP) { p = pull(gx, y, cx, cy); if (y === -STEP) { ctx.moveTo(p ? p[0] : gx, p ? p[1] : y); } else { ctx.lineTo(p ? p[0] : gx, p ? p[1] : y); } } }
for (gy = 0.5; gy <= H + 1; gy += GAP) { for (x = -STEP; x <= W + STEP; x += STEP) { p = pull(x, gy, cx, cy); if (x === -STEP) { ctx.moveTo(p ? p[0] : x, p ? p[1] : gy); } else { ctx.lineTo(p ? p[0] : x, p ? p[1] : gy); } } }
ctx.stroke();
if (h.a > 0.02) {
ctx.save(); ctx.globalAlpha = Math.min(1, h.a);
var g = ctx.createRadialGradient(cx, cy, 4, cx, cy, RAD * 1.5);
g.addColorStop(0, 'rgba(255,45,149,0.20)'); g.addColorStop(0.45, 'rgba(124,58,237,0.10)'); g.addColorStop(1, 'rgba(124,58,237,0)');
ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, RAD * 1.5, 0, TAU); ctx.fill();
ctx.fillStyle = '#060213'; ctx.beginPath(); ctx.arc(cx, cy, 10, 0, TAU); ctx.fill();
var lg = ctx.createLinearGradient(cx - 14, cy - 14, cx + 14, cy + 14);
lg.addColorStop(0, '#ff2d95'); lg.addColorStop(0.5, '#7c3aed'); lg.addColorStop(1, '#00f0ff');
ctx.strokeStyle = lg; ctx.lineWidth = 2.5; ctx.beginPath();
var a0 = (t || 0) / 600; ctx.arc(cx, cy, 14, a0, a0 + 4.6); ctx.stroke();
ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1;
ctx.beginPath(); ctx.arc(cx, cy, 11.5, 0, TAU); ctx.stroke();
ctx.restore();
}
}
if (any) { running = true; requestAnimationFrame(frame); } else { running = false; }
}
function kick() { if (!running && heroes.length) { running = true; requestAnimationFrame(frame); } }
function bootLens() {
var cvs = document.querySelectorAll('.ph-hero canvas.ph-lens, .home-hero canvas.ph-lens');
if (!cvs.length) return;
Array.prototype.forEach.call(cvs, function (cv) {
var sec = cv.closest('.ph-hero, .home-hero') || cv.parentElement;
if (!sec || sec.dataset.lensOn) return; sec.dataset.lensOn = '1';
if (!cv.getContext) return;
var gap = parseFloat(cv.dataset.gap || '48', 10) || 48;
var alpha = parseFloat(cv.dataset.alpha || '0.055', 10) || 0.055;
var h = { sec: sec, cv: cv, ctx: cv.getContext('2d'), gap: gap, grid: 'rgba(255,255,255,' + alpha + ')', mx: -99999, my: -99999, sx: -99999, sy: -99999, a: 0, vis: true, w: 0, h: 0 };
fit(h); h.sx = h.mx; h.sy = h.my; heroes.push(h);
sec.classList.add('lens-on');
if ('IntersectionObserver' in window) {
new IntersectionObserver(function (es) { es.forEach(function (e) { h.vis = e.isIntersecting; if (e.isIntersecting) kick(); }); }, { threshold: 0 }).observe(sec);
}
if ('ResizeObserver' in window) { new ResizeObserver(function () { fit(h); kick(); }).observe(sec); }
sec.addEventListener('pointerenter', function (e) {
var r = sec.getBoundingClientRect();
h.mx = e.clientX - r.left; h.my = e.clientY - r.top;
h.sx = h.mx; h.sy = h.my; kick();
});
sec.addEventListener('pointermove', function (e) {
if (e.pointerType && e.pointerType !== 'mouse') return;
var r = sec.getBoundingClientRect(); h.mx = e.clientX - r.left; h.my = e.clientY - r.top;
if (h.a < 0.05) { h.sx = h.mx; h.sy = h.my; }
kick();
});
sec.addEventListener('pointerleave', function () { h.mx = -99999; h.my = -99999; kick(); });
});
window.addEventListener('resize', function () { heroes.forEach(fit); kick(); });
window.addEventListener('load', function () { heroes.forEach(fit); kick(); });
kick();
}
bootLens();
} catch (err) {}
}
function ready(fn) {
if (document.readyState !== 'loading') {
fn();
} else {
document.addEventListener('DOMContentLoaded', fn);
}
}
ready(function () {
initBottomNav();
initNavbarScroll();
initMobileMenu();
initFormValidation();
initTooltips();
initChessAnimations();
initScrollToTop();
initStatCounters();
initWallMessageModal();
initScrollAnimations();
initGravityLens();
});
})();