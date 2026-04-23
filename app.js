/* ============================================================
   SHOUTUP — app.js  (all client interactivity)
   ============================================================ */

const API_BASE = (() => {
  // Always call same-origin /api via ingress (works in preview + local)
  return '/api';
})();

/* ---------- LOADING SCREEN ---------- */
(function bootLoader() {
  const bar = document.getElementById('loader-bar');
  const loader = document.getElementById('loader');
  let p = 0;
  const tick = setInterval(() => {
    p = Math.min(100, p + (Math.random() * 18 + 6));
    bar.style.width = p + '%';
    if (p >= 100) {
      clearInterval(tick);
      setTimeout(() => {
        loader.classList.add('hidden');
        // start reveal observer after loader out
        startReveals();
        startCounters();
      }, 350);
    }
  }, 140);
})();

/* ---------- TICKER ---------- */
(function ticker() {
  const items = [
    { tag: '● LIVE', text: 'Real Estate Lead Captured @ Mumbai', cls: '' },
    { tag: '● GUARD', text: 'Budget Guard Active · Protected ₹4,200', cls: 'red' },
    { tag: '● ISO', text: 'Lead Verification Active', cls: '' },
    { tag: '● LIVE', text: 'Real Estate Lead Captured @ Bengaluru', cls: '' },
    { tag: '● OPS', text: 'AI Copy Engine optimised 14 ads', cls: '' },
    { tag: '● LIVE', text: 'D2C Signup Captured @ Pune', cls: '' },
    { tag: '● GUARD', text: 'Bot Click Blocked · Saved ₹860', cls: 'red' },
    { tag: '● ROAS', text: 'Active Campaign hit 6.2x ROAS', cls: '' },
    { tag: '● LIVE', text: 'Real Estate Lead Captured @ Delhi NCR', cls: '' },
    { tag: '● GEO', text: 'Hyper Geofence deployed · 500m radius', cls: '' },
  ];
  const track = document.getElementById('ticker-track');
  const build = () =>
    items
      .map(
        (it) => `<div class=\"ticker-item\">
          <span class=\"dot-live\"></span>
          <span class=\"${it.cls ? 'tag-red' : 'tag'}\">${it.tag}</span>
          <span>${it.text}</span>
        </div>`
      )
      .join('');
  track.innerHTML = build() + build(); // duplicate for seamless loop
})();

/* ---------- MODULES GRID ---------- */
(function modules() {
  const mods = [
    { n: '01', t: 'AI Copy Engine', d: 'Headlines that adapt to user behavior in real-time using live CTR telemetry.', i: 'AI' },
    { n: '02', t: 'Regional Ad Flow', d: 'Multilingual ad deployment across 12 Indian languages and sub-regional dialects.', i: 'IN' },
    { n: '03', t: 'Hyper Geofencing', d: 'Targeting precision within 500m of business points of interest.', i: 'GO' },
    { n: '04', t: 'Budget Guard', d: 'Auto-pauses under-performing ad sets before they burn INR. Saves ~18% per campaign.', i: '₹' },
    { n: '05', t: 'ISO Lead Verify', d: 'Every lead scrubbed against bot & duplicate signatures before it hits your CRM.', i: '✓' },
    { n: '06', t: 'Creative War-Room', d: 'UGC production + weekly creative testing on 3-5 concurrent ad variations.', i: 'UX' },
    { n: '07', t: 'CRM Sync', d: 'Native integration with LeadSquared, HubSpot, Zoho, Sheets + WhatsApp auto-reply.', i: '⇄' },
    { n: '08', t: 'ROI Engine', d: 'Full-funnel attribution dashboard — from impression to signed contract.', i: '📊' },
    { n: '09', t: 'Bot Click Shield', d: 'AI-powered click fraud detection blocks invalid traffic in real-time.', i: '⛨' },
    { n: '10', t: 'Scale Architect', d: 'Dedicated performance lead engineers your spend from ₹500/day to ₹50k/day.', i: '↗' },
  ];
  const host = document.getElementById('modules');
  host.innerHTML = mods
    .map(
      (m) => `<div class=\"module reveal\">
        <div style=\"display:flex;justify-content:space-between;align-items:flex-start;\">
          <div class=\"icon\">${m.i}</div>
          <div class=\"num\">${m.n} / 10</div>
        </div>
        <div><h3>${m.t}</h3><p>${m.d}</p></div>
      </div>`
    )
    .join('');
  // hover spotlight
  host.querySelectorAll('.module').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', e.clientX - r.left + 'px');
      el.style.setProperty('--my', e.clientY - r.top + 'px');
    });
  });
})();

/* ---------- REVEAL ON SCROLL ---------- */
function startReveals() {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e, idx) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), idx * 60);
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
}

/* ---------- COUNTER ANIMATIONS ---------- */
function startCounters() {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseFloat(el.dataset.counter);
        const dec = parseInt(el.dataset.decimals || '0', 10);
        const dur = 1600;
        const start = performance.now();
        const step = (now) => {
          const p = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          const v = target * eased;
          el.textContent = dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-IN');
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        io.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );
  document.querySelectorAll('[data-counter]').forEach((el) => io.observe(el));
}

/* ---------- NAV ELEVATION ---------- */
window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (window.scrollY > 20) nav.classList.add('elevated');
  else nav.classList.remove('elevated');
});

/* ---------- ROI CALCULATOR ---------- */
(function roi() {
  const spend = document.getElementById('roi-spend');
  const days = document.getElementById('roi-days');
  const spendVal = document.getElementById('roi-spend-val');
  const daysVal = document.getElementById('roi-days-val');
  const nicheVal = document.getElementById('roi-niche-val');
  let cpl = 22;
  let nicheName = 'Real Estate';

  const niches = {
    'real-estate': { name: 'Real Estate', cpl: 22 },
    d2c: { name: 'D2C', cpl: 45 },
    services: { name: 'Services', cpl: 60 },
  };

  document.querySelectorAll('[data-niche]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const key = btn.dataset.niche;
      cpl = parseFloat(btn.dataset.cpl);
      nicheName = niches[key].name;
      nicheVal.textContent = nicheName;
      document.querySelectorAll('[data-niche]').forEach((b) => b.classList.remove('btn-accent'));
      document.querySelectorAll('[data-niche]').forEach((b) => b.classList.add('btn-outline'));
      btn.classList.remove('btn-outline');
      btn.classList.add('btn-accent');
      update();
    });
  });

  const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  function update() {
    const s = parseInt(spend.value, 10);
    const d = parseInt(days.value, 10);
    spendVal.textContent = '₹' + s.toLocaleString('en-IN');
    daysVal.textContent = d;
    const adspend = s * d;
    const leads = Math.round(adspend / cpl);
    // agency fee tiered
    let fee = 0;
    if (s >= 2000 && s < 5000) fee = 10000;
    else if (s >= 5000) fee = 25000;
    const subtotal = adspend + fee;
    const gst = subtotal * 0.18;
    const total = subtotal + gst;

    document.getElementById('roi-leads').textContent = leads.toLocaleString('en-IN');
    document.getElementById('roi-adspend').textContent = fmt(adspend);
    document.getElementById('roi-fee').textContent = fmt(fee);
    document.getElementById('roi-gst').textContent = fmt(gst);
    document.getElementById('roi-total').textContent = fmt(total);
  }

  spend.addEventListener('input', update);
  days.addEventListener('input', update);
  update();
})();

/* ---------- AUTH MODAL ---------- */
const authModal = document.getElementById('auth-modal');
const authTitle = document.getElementById('auth-title');
const authSub = document.getElementById('auth-sub');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

function openAuth(tab = 'login') {
  authModal.classList.add('open');
  switchTab(tab);
}
function closeAuth() {
  authModal.classList.remove('open');
}
function switchTab(tab) {
  document.querySelectorAll('.modal .tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === tab));
  if (tab === 'login') {
    loginForm.style.display = '';
    registerForm.style.display = 'none';
    authTitle.textContent = 'Welcome back';
    authSub.textContent = 'Sign in to access your SHOUTUP dashboard.';
  } else {
    loginForm.style.display = 'none';
    registerForm.style.display = '';
    authTitle.textContent = 'Create your account';
    authSub.textContent = 'Track your leads, campaigns & ROI in one place.';
  }
}

document.getElementById('open-login').addEventListener('click', () => openAuth('login'));
document.getElementById('auth-close').addEventListener('click', closeAuth);
authModal.addEventListener('click', (e) => {
  if (e.target === authModal) closeAuth();
});
document.querySelectorAll('.modal .tab').forEach((t) => t.addEventListener('click', () => switchTab(t.dataset.tab)));

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('login-msg');
  msg.className = 'form-msg';
  msg.textContent = 'Signing in…';
  const data = Object.fromEntries(new FormData(loginForm).entries());
  try {
    const res = await fetch(API_BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || 'Login failed');
    localStorage.setItem('shoutup_token', json.token);
    localStorage.setItem('shoutup_user', JSON.stringify(json.user));
    msg.className = 'form-msg ok';
    msg.textContent = '✓ Signed in. Redirecting…';
    setTimeout(() => (window.location.href = '/dashboard.html'), 700);
  } catch (err) {
    msg.className = 'form-msg err';
    msg.textContent = '✕ ' + err.message;
  }
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('register-msg');
  msg.className = 'form-msg';
  msg.textContent = 'Creating account…';
  const data = Object.fromEntries(new FormData(registerForm).entries());
  try {
    const res = await fetch(API_BASE + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || 'Registration failed');
    localStorage.setItem('shoutup_token', json.token);
    localStorage.setItem('shoutup_user', JSON.stringify(json.user));
    msg.className = 'form-msg ok';
    msg.textContent = '✓ Account created. Redirecting…';
    setTimeout(() => (window.location.href = '/dashboard.html'), 700);
  } catch (err) {
    msg.className = 'form-msg err';
    msg.textContent = '✕ ' + err.message;
  }
});

/* ---------- CONTACT FORM ---------- */
document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const msg = document.getElementById('contact-msg');
  msg.className = 'form-msg';
  msg.textContent = 'Sending…';
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    const res = await fetch(API_BASE + '/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || 'Failed to send');
    msg.className = 'form-msg ok';
    msg.textContent = '✓ ' + (json.message || 'Thanks — our team will reach out soon.');
    form.reset();
    pushToast('LEAD CAPTURED', `Thanks ${data.name || 'friend'} — we'll be in touch.`);
  } catch (err) {
    msg.className = 'form-msg err';
    msg.textContent = '✕ ' + err.message;
  }
});

/* ---------- AMBIENT TOASTS (real estate / budget guard style) ---------- */
function pushToast(title, body, red = false) {
  const stack = document.getElementById('toasts');
  const el = document.createElement('div');
  el.className = 'toast' + (red ? ' red' : '');
  el.innerHTML = `<span class=\"dot-live\"></span><div><div class=\"title\">${title}</div><div class=\"body\">${body}</div></div>`;
  stack.appendChild(el);
  setTimeout(() => {
    el.classList.add('leave');
    setTimeout(() => el.remove(), 300);
  }, 4200);
}

(function ambientToasts() {
  const samples = [
    { t: 'LEAD CAPTURED', b: 'Real Estate inquiry @ Mumbai' },
    { t: 'BUDGET GUARD', b: 'Protected ₹4,200 from invalid clicks', red: true },
    { t: 'ISO VERIFIED', b: 'Lead passed authenticity scan' },
    { t: 'LEAD CAPTURED', b: 'D2C signup @ Pune' },
    { t: 'ROAS UPDATE', b: 'Active campaign · 6.2x ROAS' },
    { t: 'LEAD CAPTURED', b: 'Real Estate inquiry @ Bengaluru' },
    { t: 'GEO SHIELD', b: 'Bot cluster blocked · saved ₹860', red: true },
  ];
  let i = 0;
  // first toast 3s after load
  setTimeout(function loop() {
    const s = samples[i % samples.length];
    pushToast(s.t, s.b, !!s.red);
    i++;
    setTimeout(loop, 7000 + Math.random() * 3000);
  }, 3500);
})();

/* ---------- CURSOR-FOLLOW GLOW (subtle) ---------- */
(function cursor() {
  const dot = document.createElement('div');
  dot.style.cssText = `position:fixed;width:420px;height:420px;border-radius:50%;
    pointer-events:none;z-index:1;background:radial-gradient(circle, rgba(198,255,61,0.08), transparent 60%);
    transform:translate(-50%,-50%);transition:transform 0.2s ease-out;mix-blend-mode:screen;`;
  document.body.appendChild(dot);
  window.addEventListener('mousemove', (e) => {
    dot.style.left = e.clientX + 'px';
    dot.style.top = e.clientY + 'px';
  });
})();
