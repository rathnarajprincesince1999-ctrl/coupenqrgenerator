// ===== RATHNA PRODUCTS — SHARED AUTH MODULE =====
(function () {
  const RP_AUTH_API = 'https://script.google.com/macros/s/AKfycbz33s7aw2q0i5vOCzWm-q9ITbqVXfKzin5c_BSyIB-y9sSCg5t1zBnUAxO1h3gliw9v/exec';
  const STORAGE_KEY = 'rp_user';

  // ── Remember-Me durations ─────────────────────────────────
  const REMEMBER_DURATIONS = [
    { label: '1 Day',    ms: 1   * 24 * 60 * 60 * 1000 },
    { label: '3 Days',   ms: 3   * 24 * 60 * 60 * 1000 },
    { label: '1 Week',   ms: 7   * 24 * 60 * 60 * 1000 },
    { label: '2 Weeks',  ms: 14  * 24 * 60 * 60 * 1000 },
    { label: '1 Month',  ms: 30  * 24 * 60 * 60 * 1000 },
    { label: '3 Months', ms: 90  * 24 * 60 * 60 * 1000 },
    { label: '6 Months', ms: 180 * 24 * 60 * 60 * 1000 },
    { label: '1 Year',   ms: 365 * 24 * 60 * 60 * 1000 }
  ];
  const DEFAULT_REMEMBER_MS = 30 * 24 * 60 * 60 * 1000; // 30 days default

  // ── Session helpers (with expiry) ─────────────────────────
  function getUser() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      if (parsed._expiry && Date.now() > parsed._expiry) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      const { _expiry, ...user } = parsed;
      return Object.keys(user).length ? user : null;
    } catch { return null; }
  }
  function setUser(u, rememberMs) {
    const expiry = rememberMs != null ? rememberMs : DEFAULT_REMEMBER_MS;
    const stored = { ...u, _expiry: Date.now() + expiry };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }
  function clearUser() { localStorage.removeItem(STORAGE_KEY); }

  // ── Guest → User data migration (no-op for non-store sites) ──
  function migrateGuestDataToUser(user) {
    const uid = user.id || user.email;
    if (!uid) return;
    const sitePrefixes = ['hm', 'rs'];
    sitePrefixes.forEach(prefix => {
      const guestAddrKey    = prefix + '_guest_addresses';
      const guestOrdersKey  = prefix + '_orders';
      const guestCartKey    = prefix + '_cart';
      const guestSelAddrKey = prefix + '_selected_addr';
      const userAddrKey     = prefix + '_user_' + uid + '_addresses';
      const userOrdersKey   = prefix + '_user_' + uid + '_orders';
      const userCartKey     = prefix + '_user_' + uid + '_cart';
      void guestSelAddrKey; // used in removeItem below

      const guestAddrs = _safeParseArr(localStorage.getItem(guestAddrKey));
      if (guestAddrs.length) {
        const userAddrs = _safeParseArr(localStorage.getItem(userAddrKey));
        const merged = [...userAddrs];
        guestAddrs.forEach(ga => {
          const dup = merged.find(ua => ua.label === ga.label && ua.phone === ga.phone && ua.address === ga.address);
          if (!dup) merged.push(ga);
        });
        localStorage.setItem(userAddrKey, JSON.stringify(merged));
        localStorage.removeItem(guestAddrKey);
        localStorage.removeItem(guestSelAddrKey);
      }

      const guestOrdersRaw = localStorage.getItem(guestOrdersKey);
      if (guestOrdersRaw) {
        const guestOrders = _safeParseOrders(guestOrdersRaw);
        if (guestOrders.length) {
          const userOrders = _safeParseOrders(localStorage.getItem(userOrdersKey));
          const merged = [...userOrders];
          guestOrders.forEach(go => {
            const dup = merged.find(uo => (go.orderId && uo.orderId === go.orderId) || (go.timestamp && uo.timestamp === go.timestamp));
            if (!dup) merged.push({ ...go, _migratedFromGuest: true });
          });
          const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
          localStorage.setItem(userOrdersKey, JSON.stringify({ data: merged, expiry: Date.now() + ONE_YEAR_MS }));
          localStorage.removeItem(guestOrdersKey);
        }
      }

      const guestCart = _safeParseArr(localStorage.getItem(guestCartKey));
      if (guestCart.length) {
        const userCart = _safeParseArr(localStorage.getItem(userCartKey));
        const merged = [...userCart];
        guestCart.forEach(gi => {
          const existing = merged.find(ui => (ui._vid || ui.id) === (gi._vid || gi.id));
          if (existing) { existing.qty += gi.qty; } else { merged.push(gi); }
        });
        localStorage.setItem(userCartKey, JSON.stringify(merged));
        localStorage.removeItem(guestCartKey);
      }
    });
  }

  function _safeParseArr(raw) {
    try { const p = JSON.parse(raw || '[]'); return Array.isArray(p) ? p : []; } catch { return []; }
  }
  function _safeParseOrders(raw) {
    try {
      if (!raw) return [];
      const p = JSON.parse(raw);
      if (Array.isArray(p)) return p;
      if (p && Array.isArray(p.data)) return p.data;
      return [];
    } catch { return []; }
  }

  // ── Public: get user-scoped storage key for current site ──
  window.rpGetSiteKey = function(prefix, type) {
    const user = getUser();
    if (!user) return prefix + (type === 'addresses' ? '_guest_addresses' : '_' + type);
    const uid = user.id || user.email;
    return prefix + '_user_' + uid + '_' + type;
  };

  function apiPost(payload) {
    return fetch(RP_AUTH_API, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'text/plain' }
    }).then(r => r.json());
  }

  // ── CAPTCHA ───────────────────────────────────────────────
  let _captchaAnswer = 0;
  function genCaptcha(inputId, displayId) {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    _captchaAnswer = a + b;
    const el = document.getElementById(displayId);
    if (el) el.textContent = a + ' + ' + b + ' = ?';
    const inp = document.getElementById(inputId);
    if (inp) inp.value = '';
  }
  function verifyCaptcha(inputId) {
    return parseInt(document.getElementById(inputId)?.value || '') === _captchaAnswer;
  }

  // ── CSS ───────────────────────────────────────────────────
  function injectCSS() {
    if (document.getElementById('rp-auth-css')) return;
    const style = document.createElement('style');
    style.id = 'rp-auth-css';
    style.textContent = `
/* ── Profile Icon Button ── */
.rp-auth-trigger { display:inline-flex; align-items:center; }
.rp-profile-btn {
  display:inline-flex; align-items:center; justify-content:center;
  width:40px; height:40px; border-radius:50%;
  background:linear-gradient(135deg,#ffd700,#ffb300); border:none;
  cursor:pointer; transition:all .25s cubic-bezier(.4,.0,.2,1);
  flex-shrink:0; position:relative; box-shadow:0 2px 8px rgba(0,0,0,.15);
  color:#7b0000; font-weight:900; font-size:.85rem;
}
.rp-profile-btn:hover {
  transform:scale(1.1); box-shadow:0 4px 16px rgba(0,0,0,.25);
  background:linear-gradient(135deg,#ffed4e,#ffc107);
}
.rp-profile-btn:active { transform:scale(0.95); }
.rp-profile-btn svg { width:18px; height:18px; }
.rp-profile-btn .rp-avatar-initials {
  width:100%; height:100%; border-radius:50%;
  background:inherit; display:flex; align-items:center; justify-content:center;
  font-size:.75rem; font-weight:900; color:inherit; letter-spacing:.3px;
}
.rp-profile-dot {
  position:absolute; top:-2px; right:-2px;
  width:10px; height:10px; border-radius:50%;
  background:#22c55e; border:2px solid #fff; box-shadow:0 0 4px rgba(0,0,0,.2);
}

/* ── Mobile Responsive ── */
@media (max-width:768px) {
  .rp-profile-btn {
    width:36px; height:36px; font-size:.78rem;
  }
  .rp-profile-btn:hover {
    transform:scale(1.08);
  }
}
@media (max-width:480px) {
  .rp-profile-btn {
    width:32px; height:32px; font-size:.7rem;
    box-shadow:0 1px 4px rgba(0,0,0,.12);
  }
  .rp-profile-btn:hover {
    transform:scale(1.06);
    box-shadow:0 2px 8px rgba(0,0,0,.2);
  }
}

/* ── Auth Modal (Login/Signup) ── */
#rpAuthOverlay {
  position:fixed; inset:0; background:rgba(0,0,0,.6);
  z-index:99999; display:none; align-items:center; justify-content:center; padding:12px;
}
#rpAuthOverlay.open { display:flex; }
#rpAuthModal {
  background:#fff; border-radius:22px; width:100%; max-width:420px;
  box-shadow:0 28px 80px rgba(0,0,0,.35); overflow:hidden;
  animation:rpSlideUp .28s cubic-bezier(.34,1.56,.64,1);
}
@keyframes rpSlideUp { from{transform:translateY(40px);opacity:0} to{transform:translateY(0);opacity:1} }
.rpa-head {
  background:linear-gradient(135deg,#8B0000,#c0392b);
  padding:20px 22px 16px; display:flex; align-items:center; justify-content:space-between;
}
.rpa-head h2 {
  color:#fff; font-size:1.1rem; font-weight:900; margin:0;
  display:flex; align-items:center; gap:9px;
}
.rpa-head h2 img { width:26px; height:26px; border-radius:50%; border:2px solid rgba(255,255,255,.4); }
.rpa-close {
  background:none; border:none; color:rgba(255,255,255,.8);
  font-size:1.3rem; cursor:pointer; padding:2px 7px; border-radius:6px; line-height:1;
}
.rpa-close:hover { background:rgba(255,255,255,.15); }
.rpa-tabs { display:flex; border-bottom:2px solid #f0e0e0; }
.rpa-tab {
  flex:1; padding:11px; text-align:center; font-weight:700;
  font-size:.87rem; cursor:pointer; color:#999; border:none; background:none; transition:color .2s;
}
.rpa-tab.active { color:#8B0000; border-bottom:2.5px solid #8B0000; margin-bottom:-2px; }
.rpa-body { padding:18px 22px 22px; max-height:72vh; overflow-y:auto; }
.rpa-field { margin-bottom:13px; }
.rpa-field label {
  display:block; font-size:.75rem; font-weight:700; color:#555;
  margin-bottom:5px; text-transform:uppercase; letter-spacing:.5px;
}
.rpa-field input {
  width:100%; padding:10px 13px; border:1.5px solid #e0e0e0;
  border-radius:10px; font-size:.91rem; outline:none;
  transition:border-color .2s; box-sizing:border-box;
}
.rpa-field input:focus { border-color:#8B0000; }
.rpa-row { display:grid; grid-template-columns:1fr 1fr; gap:11px; }
.rpa-captcha-row { display:flex; gap:10px; align-items:center; }
.rpa-captcha-q {
  background:#fff5f5; border:1.5px solid #fecaca; border-radius:10px;
  padding:10px 14px; font-weight:800; color:#8B0000; font-size:.93rem;
  white-space:nowrap; flex-shrink:0;
}
.rpa-captcha-row input { flex:1; }
.rpa-tc {
  display:flex; align-items:flex-start; gap:9px;
  margin:12px 0 16px; font-size:.79rem; color:#555; line-height:1.55;
}
.rpa-tc input[type=checkbox] { width:16px; height:16px; flex-shrink:0; margin-top:2px; accent-color:#8B0000; cursor:pointer; }
.rpa-tc a { color:#8B0000; font-weight:700; text-decoration:underline; }
.rpa-btn {
  width:100%; padding:12px; background:linear-gradient(135deg,#8B0000,#c0392b);
  color:#fff; border:none; border-radius:12px; font-size:.93rem;
  font-weight:800; cursor:pointer; transition:opacity .2s;
}
.rpa-btn:hover { opacity:.88; }
.rpa-btn:disabled { opacity:.5; cursor:not-allowed; }
.rpa-msg { margin-top:11px; padding:9px 13px; border-radius:10px; font-size:.81rem; font-weight:600; display:none; }
.rpa-msg.error  { background:#fff5f5; color:#c0392b; border:1px solid #fecaca; display:block; }
.rpa-msg.success{ background:#f0fdf4; color:#166534; border:1px solid #bbf7d0; display:block; }
.rpa-divider { text-align:center; color:#bbb; font-size:.74rem; margin:13px 0; position:relative; }
.rpa-divider::before,.rpa-divider::after { content:''; position:absolute; top:50%; width:42%; height:1px; background:#eee; }
.rpa-divider::before { left:0; } .rpa-divider::after { right:0; }
.rpa-forgot { text-align:right; margin-top:-8px; margin-bottom:13px; }
.rpa-forgot a { font-size:.77rem; color:#8B0000; font-weight:700; cursor:pointer; text-decoration:underline; }

/* ── Profile Panel (slide-in from right) ── */
#rpProfileOverlay {
  position:fixed; inset:0; background:rgba(0,0,0,.5);
  z-index:99998; display:none; justify-content:flex-end;
}
#rpProfileOverlay.open { display:flex; }
#rpProfilePanel {
  background:#fff; width:100%; max-width:360px; height:100%;
  overflow-y:auto; display:flex; flex-direction:column;
  animation:rpSlideRight .28s cubic-bezier(.34,1.56,.64,1);
  box-shadow:-8px 0 40px rgba(0,0,0,.2);
}
@keyframes rpSlideRight { from{transform:translateX(100%)} to{transform:translateX(0)} }
.rpp-head {
  background:linear-gradient(135deg,#8B0000,#c0392b);
  padding:20px 20px 18px; display:flex; align-items:center; gap:14px; flex-shrink:0;
}
.rpp-avatar {
  width:52px; height:52px; border-radius:50%; flex-shrink:0;
  background:linear-gradient(135deg,#ffd700,#ffb300);
  display:flex; align-items:center; justify-content:center;
  font-size:1.1rem; font-weight:900; color:#7b0000;
  border:3px solid rgba(255,255,255,.4);
}
.rpp-info { flex:1; min-width:0; }
.rpp-name { color:#fff; font-size:1rem; font-weight:900; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.rpp-email { color:rgba(255,255,255,.75); font-size:.75rem; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.rpp-phone { color:rgba(255,215,0,.9); font-size:.75rem; margin-top:1px; }
.rpp-close {
  background:none; border:none; color:rgba(255,255,255,.8);
  font-size:1.3rem; cursor:pointer; padding:4px 8px; border-radius:8px; flex-shrink:0;
}
.rpp-close:hover { background:rgba(255,255,255,.15); }
.rpp-body { flex:1; padding:16px; display:flex; flex-direction:column; gap:10px; }
.rpp-section-title {
  font-size:.68rem; font-weight:800; color:#9ca3af;
  text-transform:uppercase; letter-spacing:1px; margin:6px 0 4px; padding:0 2px;
}
.rpp-card {
  background:#f9fafb; border:1.5px solid #f0e0e0; border-radius:14px; overflow:hidden;
}
.rpp-menu-item {
  display:flex; align-items:center; gap:12px; padding:13px 16px;
  cursor:pointer; transition:background .15s; border:none; background:none;
  width:100%; text-align:left; font-size:.88rem; font-weight:600; color:#1a1a2e;
  border-bottom:1px solid #f5f5f5;
}
.rpp-menu-item:last-child { border-bottom:none; }
.rpp-menu-item:hover { background:#fff5f5; }
.rpp-menu-item .rpp-icon {
  width:34px; height:34px; border-radius:10px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center; font-size:1rem;
}
.rpp-menu-item .rpp-arrow { margin-left:auto; color:#ccc; font-size:.8rem; }
.rpp-menu-item.danger { color:#c0392b; }
.rpp-menu-item.danger:hover { background:#fff5f5; }
.rpp-badge {
  margin-left:auto; font-size:.65rem; font-weight:800; padding:2px 8px;
  border-radius:10px; background:#fef9c3; color:#854d0e;
}
.rpp-badge.green { background:#dcfce7; color:#15803d; }
.rpp-badge.blue  { background:#dbeafe; color:#1e40af; }
.rpp-seller-banner {
  background:linear-gradient(135deg,#1565c0,#1976d2);
  border-radius:14px; padding:16px; color:#fff; text-align:center;
}
.rpp-seller-banner h4 { font-size:.95rem; font-weight:900; margin:0 0 6px; }
.rpp-seller-banner p  { font-size:.78rem; opacity:.85; margin:0 0 12px; line-height:1.5; }
.rpp-seller-banner a  {
  display:inline-block; background:#fff; color:#1565c0;
  padding:8px 20px; border-radius:20px; font-weight:800; font-size:.82rem;
  text-decoration:none; transition:opacity .2s;
}
.rpp-seller-banner a:hover { opacity:.88; }
.rpp-seller-status {
  background:linear-gradient(135deg,#f0fdf4,#dcfce7);
  border:1.5px solid #bbf7d0; border-radius:14px; padding:14px 16px;
}
.rpp-seller-status h4 { font-size:.88rem; font-weight:900; color:#15803d; margin:0 0 4px; }
.rpp-seller-status p  { font-size:.78rem; color:#166534; margin:0; }
@media(max-width:480px) {
  .rpa-row { grid-template-columns:1fr; }
  .rpa-body { padding:14px 14px 18px; }
  #rpProfilePanel { max-width:100%; }
}
    `;
    document.head.appendChild(style);
  }

  // ── Auth Modal HTML ───────────────────────────────────────
  function injectAuthModal() {
    if (document.getElementById('rpAuthOverlay')) return;
    const html = `
<div id="rpAuthOverlay" onclick="if(event.target===this)rpAuthClose()">
  <div id="rpAuthModal">
    <div class="rpa-head">
      <h2>
        <img src="https://rathnaproducts.store/rathna%20logo2.0.png" alt="RP" onerror="this.style.display='none'"/>
        RATHNA Products
      </h2>
      <button class="rpa-close" onclick="rpAuthClose()">✕</button>
    </div>
    <div class="rpa-tabs">
      <button class="rpa-tab active" id="rpTabLogin" onclick="rpSwitchTab('login')">Login</button>
      <button class="rpa-tab" id="rpTabSignup" onclick="rpSwitchTab('signup')">Sign Up</button>
    </div>
    <div class="rpa-body">

      <!-- LOGIN FORM -->
      <div id="rpLoginForm">
        <div class="rpa-field">
          <label>Email or Phone</label>
          <input type="text" id="rpLEmail" placeholder="Email or 10-digit phone" autocomplete="username"/>
        </div>
        <div class="rpa-field">
          <label>Password</label>
          <input type="password" id="rpLPass" placeholder="Your password" autocomplete="current-password"
            onkeydown="if(event.key==='Enter')rpDoLogin()"/>
        </div>
        <div class="rpa-forgot"><a onclick="rpForgotPwd()">Forgot password?</a></div>
        <button class="rpa-btn" id="rpLoginBtn" onclick="rpDoLogin()">Login to My Account</button>
        <div class="rpa-msg" id="rpLoginMsg"></div>
        <div class="rpa-divider">or</div>
        <div style="text-align:center;font-size:.82rem;color:#666">
          New here? <a onclick="rpSwitchTab('signup')" style="color:#8B0000;font-weight:700;cursor:pointer">Create an account</a>
        </div>
      </div>

      <!-- SIGNUP FORM -->
      <div id="rpSignupForm" style="display:none">
        <div class="rpa-row">
          <div class="rpa-field">
            <label>Email Address *</label>
            <input type="email" id="rpSEmail" placeholder="you@example.com" autocomplete="email"/>
          </div>
          <div class="rpa-field">
            <label>Phone Number *</label>
            <input type="tel" id="rpSPhone" placeholder="10-digit number" maxlength="10" autocomplete="tel"/>
          </div>
        </div>
        <div class="rpa-row">
          <div class="rpa-field">
            <label>Password *</label>
            <input type="password" id="rpSPass" placeholder="Min 6 characters" autocomplete="new-password"/>
          </div>
          <div class="rpa-field">
            <label>Confirm Password *</label>
            <input type="password" id="rpSPass2" placeholder="Repeat password" autocomplete="new-password"/>
          </div>
        </div>
        <div class="rpa-field">
          <label>CAPTCHA Verification *</label>
          <div class="rpa-captcha-row">
            <div class="rpa-captcha-q" id="rpCaptchaQ">? + ? = ?</div>
            <input type="number" id="rpCaptchaAns" placeholder="Answer"/>
          </div>
        </div>
        <div class="rpa-tc">
          <input type="checkbox" id="rpTcCheck"/>
          <span>I agree to the
            <a href="https://rathnaproducts.store/terms.html" target="_blank">Terms &amp; Conditions</a> and
            <a href="https://rathnaproducts.store/privacy.html" target="_blank">Privacy Policy</a>
            of RATHNA Products.
          </span>
        </div>
        <button class="rpa-btn" id="rpSignupBtn" onclick="rpDoSignup()">Create My Account</button>
        <div class="rpa-msg" id="rpSignupMsg"></div>
        <div class="rpa-divider">or</div>
        <div style="text-align:center;font-size:.82rem;color:#666">
          Already have an account? <a onclick="rpSwitchTab('login')" style="color:#8B0000;font-weight:700;cursor:pointer">Login</a>
        </div>
      </div>

    </div>
  </div>
</div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  }

  // ── Tab switch ────────────────────────────────────────────
  window.rpSwitchTab = function (tab) {
    document.getElementById('rpLoginForm').style.display  = tab === 'login'  ? '' : 'none';
    document.getElementById('rpSignupForm').style.display = tab === 'signup' ? '' : 'none';
    document.getElementById('rpTabLogin').classList.toggle('active',  tab === 'login');
    document.getElementById('rpTabSignup').classList.toggle('active', tab === 'signup');
    if (tab === 'signup') genCaptcha('rpCaptchaAns', 'rpCaptchaQ');
    clearMsgs();
  };

  function clearMsgs() {
    ['rpLoginMsg','rpSignupMsg'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.className = 'rpa-msg'; el.textContent = ''; }
    });
  }

  function showMsg(id, text, type) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className = 'rpa-msg ' + type;
  }

  // ── Open / Close Auth Modal ───────────────────────────────
  window.rpAuthOpen = function (tab) {
    injectAuthModal();
    rpSwitchTab(tab || 'login');
    document.getElementById('rpAuthOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    // Focus first input
    setTimeout(() => {
      const inp = document.getElementById(tab === 'signup' ? 'rpSEmail' : 'rpLEmail');
      if (inp) inp.focus();
    }, 320);
  };

  window.rpAuthClose = function () {
    const ov = document.getElementById('rpAuthOverlay');
    if (ov) ov.classList.remove('open');
    document.body.style.overflow = '';
  };

  // ── Login ─────────────────────────────────────────────────
  window.rpDoLogin = async function () {
    const emailOrPhone = document.getElementById('rpLEmail').value.trim();
    const pass = document.getElementById('rpLPass').value;
    if (!emailOrPhone || !pass) return showMsg('rpLoginMsg', 'Please fill in all fields.', 'error');

    const btn = document.getElementById('rpLoginBtn');
    btn.disabled = true; btn.textContent = 'Logging in…';

    try {
      const res = await apiPost({ action: 'rpLogin', email: emailOrPhone, password: pass });
      if (res.success) {
        setUser(res.user);
        rpAuthClose();
        updateAuthUI();
        if (typeof rpOnLogin === 'function') rpOnLogin(res.user);
        _showToast('👋 Welcome back, ' + (res.user.name || res.user.email.split('@')[0]) + '!');
      } else {
        showMsg('rpLoginMsg', res.error || 'Login failed. Check your credentials.', 'error');
      }
    } catch {
      showMsg('rpLoginMsg', 'Network error. Please try again.', 'error');
    }
    btn.disabled = false; btn.textContent = 'Login to My Account';
  };

  // ── Signup ────────────────────────────────────────────────
  window.rpDoSignup = async function () {
    const email  = document.getElementById('rpSEmail').value.trim();
    const phone  = document.getElementById('rpSPhone').value.replace(/\D/g, '').slice(-10);
    const pass   = document.getElementById('rpSPass').value;
    const pass2  = document.getElementById('rpSPass2').value;
    const tc     = document.getElementById('rpTcCheck').checked;

    if (!email || !phone || !pass || !pass2)
      return showMsg('rpSignupMsg', 'Please fill in all required fields.', 'error');
    if (phone.length !== 10)
      return showMsg('rpSignupMsg', 'Enter a valid 10-digit phone number.', 'error');
    if (pass.length < 6)
      return showMsg('rpSignupMsg', 'Password must be at least 6 characters.', 'error');
    if (pass !== pass2)
      return showMsg('rpSignupMsg', 'Passwords do not match.', 'error');
    if (!verifyCaptcha('rpCaptchaAns'))
      return showMsg('rpSignupMsg', 'Incorrect CAPTCHA answer. Please try again.', 'error');
    if (!tc)
      return showMsg('rpSignupMsg', 'Please accept the Terms & Conditions and Privacy Policy.', 'error');

    const btn = document.getElementById('rpSignupBtn');
    btn.disabled = true; btn.textContent = 'Creating account…';

    try {
      const source = window.location.hostname || 'rathnaproducts.store';
      const res = await apiPost({ action: 'rpRegister', email, phone, password: pass, source });
      if (res.success) {
        setUser(res.user);
        rpAuthClose();
        updateAuthUI();
        if (typeof rpOnLogin === 'function') rpOnLogin(res.user);
        _showToast('🎉 Welcome to RATHNA Products!');
      } else {
        showMsg('rpSignupMsg', res.error || 'Registration failed.', 'error');
        genCaptcha('rpCaptchaAns', 'rpCaptchaQ');
      }
    } catch {
      showMsg('rpSignupMsg', 'Network error. Please try again.', 'error');
    }
    btn.disabled = false; btn.textContent = 'Create My Account';
  };

  // ── Forgot password ───────────────────────────────────────
  window.rpForgotPwd = function () {
    const email = document.getElementById('rpLEmail').value.trim();
    const msg = email
      ? 'Contact admin@rathnaproducts.store or WhatsApp +91 82485 99487 with your registered email/phone: ' + email
      : 'Contact admin@rathnaproducts.store or WhatsApp +91 82485 99487 to reset your password.';
    showMsg('rpLoginMsg', msg, 'error');
  };

  // ── Logout ────────────────────────────────────────────────
  window.rpLogout = function () {
    clearUser();
    rpProfileClose();
    updateAuthUI();
    if (typeof rpOnLogout === 'function') rpOnLogout();
    _showToast('👋 Logged out successfully.');
  };

  // ── Internal toast (works on all sites) ──────────────────
  function _showToast(msg) {
    if (typeof showToast === 'function') { showToast(msg); return; }
    let t = document.getElementById('_rpToast');
    if (!t) {
      t = document.createElement('div');
      t.id = '_rpToast';
      t.style.cssText = [
        'position:fixed','bottom:24px','left:50%','transform:translateX(-50%) translateY(20px)',
        'background:linear-gradient(135deg,#8B0000,#c0392b)','color:#fff',
        'padding:10px 22px','border-radius:20px','font-size:.85rem','font-weight:700',
        'box-shadow:0 4px 20px rgba(139,0,0,.4)','z-index:999999',
        'opacity:0','transition:all .3s','pointer-events:none','white-space:nowrap'
      ].join(';');
      document.body.appendChild(t);
    }
    t.textContent = msg;
    requestAnimationFrame(() => {
      t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)';
    });
    clearTimeout(t._timer);
    t._timer = setTimeout(() => {
      t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(20px)';
    }, 2800);
  }

  // ── Profile Panel HTML ────────────────────────────────────
  function injectProfilePanel() {
    if (document.getElementById('rpProfileOverlay')) return;
    const html = `
<div id="rpProfileOverlay" onclick="if(event.target===this)rpProfileClose()">
  <div id="rpProfilePanel">

    <!-- Header -->
    <div class="rpp-head" id="rppHead">
      <div class="rpp-avatar" id="rppAvatar"></div>
      <div class="rpp-info">
        <div class="rpp-name"  id="rppName">My Account</div>
        <div class="rpp-email" id="rppEmail"></div>
        <div class="rpp-phone" id="rppPhone"></div>
      </div>
      <button class="rpp-close" onclick="rpProfileClose()">✕</button>
    </div>

    <!-- Body -->
    <div class="rpp-body" id="rppBody">
      <!-- filled dynamically -->
    </div>

  </div>
</div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  }

  // ── Build profile body ────────────────────────────────────
  function buildProfileBody(user) {
    const isSeller = user.type === 'seller';
    const sellerStatus = user.sellerStatus || '';
    const initials = _initials(user.name || user.email);

    // Header
    document.getElementById('rppAvatar').textContent = initials;
    document.getElementById('rppName').textContent   = user.name || user.email.split('@')[0];
    document.getElementById('rppEmail').textContent  = user.email;
    document.getElementById('rppPhone').textContent  = '📞 ' + (user.phone || '—');

    const body = document.getElementById('rppBody');

    // Seller status banner OR become-seller banner
    let sellerHtml = '';
    if (isSeller) {
      const statusEmoji = sellerStatus === 'Approved' ? '✅' : sellerStatus === 'Rejected' ? '❌' : '⏳';
      const _esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
      sellerHtml = `
        <div class="rpp-seller-status">
          <h4>${statusEmoji} Seller Account — ${_esc(sellerStatus)}</h4>
          <p>Seller ID: <strong>${_esc(user.sellerId || user.id)}</strong></p>
          ${sellerStatus === 'Approved'
            ? '<p style="margin-top:6px">Your seller account is active. Visit the portal to manage orders.</p>'
            : sellerStatus === 'Rejected'
            ? '<p style="margin-top:6px;color:#991b1b">Your seller account was rejected. Contact admin for details.</p>'
            : '<p style="margin-top:6px">Your seller registration is under review by admin.</p>'
          }
          <a href="https://rathnaseller.rathnaproducts.store" target="_blank" rel="noopener noreferrer"
             style="display:inline-block;margin-top:10px;background:#1565c0;color:#fff;padding:7px 18px;border-radius:20px;font-size:.8rem;font-weight:800;text-decoration:none">
            🚀 Open Seller Portal
          </a>
        </div>`;
    } else {
      sellerHtml = `
        <div class="rpp-seller-banner">
          <h4>🤝 Become a RATHNA Seller</h4>
          <p>Sell RATHNA Products in your area. Earn the full product price per order — plus delivery charge if you ship yourself.</p>
          <a href="https://rathnaseller.rathnaproducts.store" target="_blank" rel="noopener">Join as Seller →</a>
        </div>`;
    }

    body.innerHTML = `
      ${sellerHtml}

      <div class="rpp-section-title">My Account</div>
      <div class="rpp-card">
        <button class="rpp-menu-item" onclick="rpProfileClose();rpAuthOpen('login')">
          <span class="rpp-icon" style="background:#fff5f5">✏️</span>
          <span>Edit Profile</span>
          <span class="rpp-arrow">›</span>
        </button>
        <button class="rpp-menu-item" onclick="rpOpenChangePassword()">
          <span class="rpp-icon" style="background:#f0f9ff">🔑</span>
          <span>Change Password</span>
          <span class="rpp-arrow">›</span>
        </button>
      </div>

      <div id="rpSiteMenu"></div>

      <div class="rpp-section-title">Quick Links</div>
      <div class="rpp-card">
        <a class="rpp-menu-item" href="https://rathnaproducts.store" target="_blank" rel="noopener" style="text-decoration:none">
          <span class="rpp-icon" style="background:#fff5f5">🏠</span>
          <span>RATHNA Products Home</span>
          <span class="rpp-arrow">›</span>
        </a>
        <a class="rpp-menu-item" href="https://homemade1.rathnaproducts.store" target="_blank" rel="noopener" style="text-decoration:none">
          <span class="rpp-icon" style="background:#f0fdf4">🌿</span>
          <span>Home Made Store</span>
          <span class="rpp-arrow">›</span>
        </a>
        <a class="rpp-menu-item" href="https://rathnasarees1.rathnaproducts.store" target="_blank" rel="noopener" style="text-decoration:none">
          <span class="rpp-icon" style="background:#fdf4ff">🥻</span>
          <span>RATHNA Sarees</span>
          <span class="rpp-arrow">›</span>
        </a>
      </div>

      <div class="rpp-section-title">Support</div>
      <div class="rpp-card">
        <a class="rpp-menu-item" href="https://wa.me/918248599487" target="_blank" rel="noopener" style="text-decoration:none">
          <span class="rpp-icon" style="background:#f0fdf4">💬</span>
          <span>WhatsApp Support</span>
          <span class="rpp-arrow">›</span>
        </a>
        <a class="rpp-menu-item" href="https://rathnaproducts.store/terms.html" target="_blank" rel="noopener" style="text-decoration:none">
          <span class="rpp-icon" style="background:#f8fafc">📄</span>
          <span>Terms &amp; Conditions</span>
          <span class="rpp-arrow">›</span>
        </a>
        <a class="rpp-menu-item" href="https://rathnaproducts.store/privacy.html" target="_blank" rel="noopener" style="text-decoration:none">
          <span class="rpp-icon" style="background:#f8fafc">🔒</span>
          <span>Privacy Policy</span>
          <span class="rpp-arrow">›</span>
        </a>
      </div>

      <div style="padding:4px 2px 8px">
        <button class="rpp-menu-item danger" onclick="rpLogout()" style="border-radius:14px;border:1.5px solid #fecaca;background:#fff5f5">
          <span class="rpp-icon" style="background:#fee2e2">🚪</span>
          <span>Logout</span>
        </button>
      </div>

      <div style="text-align:center;font-size:.7rem;color:#ccc;padding:8px 0 4px">
        RATHNA Products · Tradition · Quality · Trust
      </div>`;
  }

  // ── Open / Close Profile Panel ────────────────────────────
  window.rpProfileOpen = function () {
    const user = getUser();
    if (!user) { rpAuthOpen('login'); return; }
    injectProfilePanel();
    buildProfileBody(user);
    if (typeof rpBuildSiteMenu === 'function') rpBuildSiteMenu();
    document.getElementById('rpProfileOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window.rpProfileClose = function () {
    const ov = document.getElementById('rpProfileOverlay');
    if (ov) ov.classList.remove('open');
    document.body.style.overflow = '';
  };

  // ── Change Password (inline in profile) ──────────────────
  window.rpOpenChangePassword = function () {
    const body = document.getElementById('rppBody');
    if (!body) return;
    const existing = document.getElementById('rppChangePwdBox');
    if (existing) { existing.remove(); return; }
    const box = document.createElement('div');
    box.id = 'rppChangePwdBox';
    box.style.cssText = 'background:#f9fafb;border:1.5px solid #f0e0e0;border-radius:14px;padding:16px;margin-bottom:10px';
    box.innerHTML = `
      <div style="font-size:.8rem;font-weight:800;color:#8B0000;margin-bottom:12px">🔑 Change Password</div>
      <div class="rpa-field"><label>Current Password</label>
        <input type="password" id="rppCurPass" placeholder="Current password" style="width:100%;padding:9px 12px;border:1.5px solid #e0e0e0;border-radius:10px;font-size:.88rem;outline:none;box-sizing:border-box"/>
      </div>
      <div class="rpa-field"><label>New Password</label>
        <input type="password" id="rppNewPass" placeholder="Min 6 characters" style="width:100%;padding:9px 12px;border:1.5px solid #e0e0e0;border-radius:10px;font-size:.88rem;outline:none;box-sizing:border-box"/>
      </div>
      <div class="rpa-field"><label>Confirm New Password</label>
        <input type="password" id="rppNewPass2" placeholder="Repeat new password" style="width:100%;padding:9px 12px;border:1.5px solid #e0e0e0;border-radius:10px;font-size:.88rem;outline:none;box-sizing:border-box"/>
      </div>
      <div id="rppPwdMsg" style="font-size:.8rem;font-weight:600;min-height:18px;margin-bottom:8px"></div>
      <div style="display:flex;gap:8px">
        <button onclick="rpDoChangePassword()" style="flex:2;padding:9px;background:linear-gradient(135deg,#8B0000,#c0392b);color:#fff;border:none;border-radius:10px;font-weight:800;font-size:.85rem;cursor:pointer">Update Password</button>
        <button onclick="document.getElementById('rppChangePwdBox').remove()" style="flex:1;padding:9px;border:1.5px solid #e5e7eb;border-radius:10px;background:#fff;font-weight:700;font-size:.85rem;cursor:pointer;color:#555">Cancel</button>
      </div>`;
    body.insertBefore(box, body.firstChild);
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  window.rpDoChangePassword = async function () {
    const user = getUser();
    if (!user) return;
    const cur  = document.getElementById('rppCurPass').value;
    const nw   = document.getElementById('rppNewPass').value;
    const nw2  = document.getElementById('rppNewPass2').value;
    const msg  = document.getElementById('rppPwdMsg');
    if (!cur || !nw || !nw2) { msg.style.color='#c0392b'; msg.textContent='Fill all fields.'; return; }
    if (nw.length < 6)        { msg.style.color='#c0392b'; msg.textContent='New password must be at least 6 characters.'; return; }
    if (nw !== nw2)           { msg.style.color='#c0392b'; msg.textContent='New passwords do not match.'; return; }
    msg.style.color='#888'; msg.textContent='Updating…';
    try {
      const res = await apiPost({ action: 'rpChangePassword', email: user.email, currentPassword: cur, newPassword: nw });
      if (res.success) {
        msg.style.color='#15803d'; msg.textContent='✅ Password updated!';
        setTimeout(() => { const b = document.getElementById('rppChangePwdBox'); if (b) b.remove(); }, 1500);
      } else {
        msg.style.color='#c0392b'; msg.textContent = res.error || 'Failed. Check current password.';
      }
    } catch { msg.style.color='#c0392b'; msg.textContent='Network error.'; }
  };

  // ── Navbar UI ─────────────────────────────────────────────
  function updateAuthUI() {
    const user = getUser();
    document.querySelectorAll('.rp-auth-trigger').forEach(el => {
      if (user) {
        const ini = _initials(user.name || user.email);
        const btn = document.createElement('button');
        btn.className = 'rp-profile-btn';
        btn.title = 'My Profile';
        btn.setAttribute('aria-label', 'My Profile');
        btn.setAttribute('onclick', 'rpProfileOpen()');
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'rp-avatar-initials';
        avatarDiv.textContent = ini;
        const dot = document.createElement('span');
        dot.className = 'rp-profile-dot';
        btn.appendChild(avatarDiv);
        btn.appendChild(dot);
        el.innerHTML = '';
        el.appendChild(btn);
      } else {
        el.innerHTML = `
          <button class="rp-profile-btn" onclick="rpAuthOpen('login')" title="Login / Sign Up" aria-label="Login">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </button>`;
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────────
  function _initials(str) {
    if (!str) return '?';
    const parts = str.trim().split(/[\s@]+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return str.slice(0, 2).toUpperCase();
  }

  // ── Expose public API ─────────────────────────────────────
  window.rpGetUser      = getUser;
  window.rpIsLoggedIn   = () => !!getUser();
  window.rpBecomeSellerClick = function () {
    const user = getUser();
    if (!user) { rpAuthOpen('login'); return; }
    if (window.location.hostname.includes('rathnaseller')) {
      if (typeof showSection === 'function') showSection('register');
      return;
    }
    rpProfileOpen();
  };

  // ── Init ──────────────────────────────────────────────────
  function init() {
    injectCSS();
    injectAuthModal();
    injectProfilePanel();
    updateAuthUI();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
