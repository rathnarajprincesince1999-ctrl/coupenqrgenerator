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
      // Support old format (no expiry) — treat as valid indefinitely
      if (!parsed || typeof parsed !== 'object') return null;
      if (parsed._expiry && Date.now() > parsed._expiry) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      // Return user data without internal fields
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

  // ── Guest → User data migration ───────────────────────────
  // Each site uses a prefix: 'hm_' (Home Made) or 'rs_' (Sarees).
  // Guest keys: hm_guest_addresses, hm_orders, hm_cart, hm_selected_addr
  //             rs_guest_addresses, rs_orders, rs_cart, rs_selected_addr
  // User keys:  hm_user_{uid}_addresses, hm_user_{uid}_orders, etc.
  // This function merges guest data into the logged-in user's scoped keys,
  // then clears the guest keys — scoped per site so data stays isolated.
  function migrateGuestDataToUser(user) {
    const uid = user.id || user.email;
    if (!uid) return;

    const sitePrefixes = ['hm', 'rs'];
    sitePrefixes.forEach(prefix => {
      const guestAddrKey   = prefix + '_guest_addresses';
      const guestOrdersKey = prefix + '_orders';
      const guestCartKey   = prefix + '_cart';
      const guestSelAddrKey= prefix + '_selected_addr';

      const userAddrKey    = prefix + '_user_' + uid + '_addresses';
      const userOrdersKey  = prefix + '_user_' + uid + '_orders';
      const userCartKey    = prefix + '_user_' + uid + '_cart';

      // ── Addresses ──
      const guestAddrs = _safeParseArr(localStorage.getItem(guestAddrKey));
      if (guestAddrs.length) {
        const userAddrs = _safeParseArr(localStorage.getItem(userAddrKey));
        // Merge: add guest addresses not already in user list (match by label+phone)
        const merged = [...userAddrs];
        guestAddrs.forEach(ga => {
          const dup = merged.find(ua =>
            ua.label === ga.label && ua.phone === ga.phone && ua.address === ga.address
          );
          if (!dup) merged.push(ga);
        });
        localStorage.setItem(userAddrKey, JSON.stringify(merged));
        localStorage.removeItem(guestAddrKey);
        localStorage.removeItem(guestSelAddrKey);
      }

      // ── Orders ──
      const guestOrdersRaw = localStorage.getItem(guestOrdersKey);
      if (guestOrdersRaw) {
        const guestOrders = _safeParseOrders(guestOrdersRaw);
        if (guestOrders.length) {
          const userOrdersRaw = localStorage.getItem(userOrdersKey);
          const userOrders = _safeParseOrders(userOrdersRaw);
          // Merge: add guest orders not already present (match by orderId or timestamp)
          const merged = [...userOrders];
          guestOrders.forEach(go => {
            const dup = merged.find(uo =>
              (go.orderId && uo.orderId === go.orderId) ||
              (go.timestamp && uo.timestamp === go.timestamp)
            );
            if (!dup) merged.push({ ...go, _migratedFromGuest: true });
          });
          const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
          localStorage.setItem(userOrdersKey, JSON.stringify({ data: merged, expiry: Date.now() + ONE_YEAR_MS }));
          localStorage.removeItem(guestOrdersKey);
        }
      }

      // ── Cart ──
      const guestCart = _safeParseArr(localStorage.getItem(guestCartKey));
      if (guestCart.length) {
        const userCart = _safeParseArr(localStorage.getItem(userCartKey));
        // Merge cart: combine quantities for same product id
        const merged = [...userCart];
        guestCart.forEach(gi => {
          const existing = merged.find(ui => (ui._vid || ui.id) === (gi._vid || gi.id));
          if (existing) { existing.qty += gi.qty; }
          else { merged.push(gi); }
        });
        localStorage.setItem(userCartKey, JSON.stringify(merged));
        localStorage.removeItem(guestCartKey);
      }
    });
  }

  function _safeParseArr(raw) {
    try {
      const p = JSON.parse(raw || '[]');
      return Array.isArray(p) ? p : [];
    } catch { return []; }
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
  // Sites call rpGetSiteKey('hm', 'orders') → 'hm_user_{uid}_orders' when logged in,
  // or 'hm_orders' (guest key) when not logged in.
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
  isolation:isolate;
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
.rpp-phone { color:rgba(255,215,0,.9); font-size:.75rem; margin-top:1px; display:flex; align-items:center; gap:4px; }
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
.rpp-join-seller-btn {
  position:absolute; bottom:-14px; right:16px;
  width:40px; height:40px; border-radius:50%;
  background:linear-gradient(135deg,#1565c0,#1976d2);
  border:3px solid #fff; box-shadow:0 3px 12px rgba(0,0,0,.3);
  display:flex; align-items:center; justify-content:center;
  text-decoration:none; transition:transform .2s,box-shadow .2s; z-index:10;
}
.rpp-join-seller-btn:hover { transform:scale(1.12); box-shadow:0 5px 18px rgba(0,0,0,.35); }
.rpp-join-seller-btn svg { width:18px; height:18px; }
.rpp-join-seller-btn .rpp-join-tip {
  position:absolute; bottom:calc(100% + 7px); right:0;
  background:#1565c0; color:#fff; font-size:.63rem; font-weight:800;
  padding:3px 8px; border-radius:7px; white-space:nowrap;
  pointer-events:none; opacity:0; transition:opacity .2s;
}
.rpp-join-seller-btn:hover .rpp-join-tip { opacity:1; }
.rpp-brand-logos {
  display:grid; grid-template-columns:repeat(4,1fr); gap:10px; padding:4px 2px;
}
.rpp-brand-logo-btn {
  display:flex; align-items:center; justify-content:center;
  width:100%; aspect-ratio:1; border-radius:14px;
  background:#f9fafb; border:1.5px solid #f0e0e0;
  overflow:hidden; transition:transform .18s,box-shadow .18s;
  text-decoration:none;
}
.rpp-brand-logo-btn:hover { transform:scale(1.08); box-shadow:0 4px 14px rgba(0,0,0,.12); border-color:#ffd700; }
.rpp-brand-logo-btn img { width:72%; height:72%; object-fit:contain; }
.rpp-seller-status {
  background:linear-gradient(135deg,#f0fdf4,#dcfce7);
  border:1.5px solid #bbf7d0; border-radius:14px; padding:14px 16px;
}
.rpp-seller-status h4 { font-size:.88rem; font-weight:900; color:#15803d; margin:0 0 4px; }
.rpp-seller-status p  { font-size:.78rem; color:#166534; margin:0; }

/* ── Edit Profile Modal ── */
#rpEditProfileOverlay {
  position:fixed; inset:0; background:rgba(0,0,0,.65);
  z-index:100000; display:none; align-items:center; justify-content:center; padding:12px;
}
#rpEditProfileOverlay.open { display:flex; }
#rpEditProfileModal {
  background:#fff; border-radius:22px; width:100%; max-width:460px;
  box-shadow:0 28px 80px rgba(0,0,0,.35); overflow:hidden;
  animation:rpSlideUp .28s cubic-bezier(.34,1.56,.64,1);
  max-height:92vh; display:flex; flex-direction:column;
}
.rpep-head {
  background:linear-gradient(135deg,#8B0000,#c0392b);
  padding:18px 22px 15px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0;
}
.rpep-head h2 {
  color:#fff; font-size:1rem; font-weight:900; margin:0;
  display:flex; align-items:center; gap:9px;
}
.rpep-close {
  background:none; border:none; color:rgba(255,255,255,.8);
  font-size:1.3rem; cursor:pointer; padding:2px 7px; border-radius:6px; line-height:1;
}
.rpep-close:hover { background:rgba(255,255,255,.15); }
.rpep-body { padding:20px 22px 22px; overflow-y:auto; flex:1; }
.rpep-avatar-row {
  display:flex; align-items:center; gap:14px; margin-bottom:20px;
  padding:14px 16px; background:#fff5f5; border-radius:14px; border:1.5px solid #fecaca;
}
.rpep-avatar-big {
  width:56px; height:56px; border-radius:50%; flex-shrink:0;
  background:linear-gradient(135deg,#ffd700,#ffb300);
  display:flex; align-items:center; justify-content:center;
  font-size:1.2rem; font-weight:900; color:#7b0000;
  border:3px solid rgba(139,0,0,.2);
}
.rpep-avatar-info { flex:1; min-width:0; }
.rpep-avatar-info strong { display:block; font-size:.9rem; font-weight:900; color:#1a1a2e; }
.rpep-avatar-info span { font-size:.75rem; color:#888; }
.rpep-section { font-size:.68rem; font-weight:800; color:#9ca3af; text-transform:uppercase; letter-spacing:1px; margin:16px 0 8px; }
.rpep-row { display:grid; grid-template-columns:1fr 1fr; gap:11px; }
.rpep-field { margin-bottom:12px; }
.rpep-field label { display:block; font-size:.73rem; font-weight:700; color:#555; margin-bottom:5px; text-transform:uppercase; letter-spacing:.4px; }
.rpep-field input, .rpep-field select {
  width:100%; padding:10px 13px; border:1.5px solid #e0e0e0;
  border-radius:10px; font-size:.9rem; outline:none;
  transition:border-color .2s; box-sizing:border-box; background:#fff;
}
.rpep-field input:focus, .rpep-field select:focus { border-color:#8B0000; }
.rpep-field input[readonly] { background:#f9fafb; color:#888; cursor:not-allowed; }
.rpep-msg { margin-top:10px; padding:9px 13px; border-radius:10px; font-size:.81rem; font-weight:600; display:none; }
.rpep-msg.error   { background:#fff5f5; color:#c0392b; border:1px solid #fecaca; display:block; }
.rpep-msg.success { background:#f0fdf4; color:#166534; border:1px solid #bbf7d0; display:block; }
.rpep-actions { display:flex; gap:10px; margin-top:16px; }
.rpep-btn-save {
  flex:2; padding:12px; background:linear-gradient(135deg,#8B0000,#c0392b);
  color:#fff; border:none; border-radius:12px; font-size:.92rem;
  font-weight:800; cursor:pointer; transition:opacity .2s;
}
.rpep-btn-save:hover { opacity:.88; }
.rpep-btn-save:disabled { opacity:.5; cursor:not-allowed; }
.rpep-btn-cancel {
  flex:1; padding:12px; border:1.5px solid #e5e7eb; border-radius:12px;
  background:#fff; font-weight:700; font-size:.88rem; cursor:pointer; color:#555;
}
.rpep-btn-cancel:hover { background:#f9fafb; }
@media(max-width:480px) {
  .rpep-row { grid-template-columns:1fr; }
  .rpep-body { padding:14px 14px 18px; }
}
@media(max-width:480px) {
  .rpa-row { grid-template-columns:1fr; }
  .rpa-body { padding:14px 14px 18px; }
  #rpProfilePanel { max-width:100%; }
}
    `;
    document.head.appendChild(style);
  }

  // ── Auth Modal HTML ───────────────────────────────────────
  const RP_GOOGLE_CLIENT_ID = '1064753915121-sl01uojh0q5ufcokck11ntstcn8a2dhp.apps.googleusercontent.com';

  // Load GIS script eagerly (like Linksy does) so it's ready before any click
  function _loadGIS(cb) {
    if (window.google && window.google.accounts) { cb(); return; }
    let s = document.getElementById('_rp_gis_script');
    if (s) { s.addEventListener('load', cb); return; }
    s = document.createElement('script');
    s.id  = '_rp_gis_script';
    s.src = 'https://accounts.google.com/gsi/client';
    s.addEventListener('load', cb);
    document.head.appendChild(s);
  }

  // Pre-initialize GIS once on page load — NOT inside the button click
  function _initGIS() {
    _loadGIS(() => {
      google.accounts.id.initialize({
        client_id:             RP_GOOGLE_CLIENT_ID,
        callback:              _onGoogleCredential,
        intermediate_iframe_close_callback: function() {
          const ov = document.getElementById('rpAuthOverlay');
          if (ov) ov.style.zIndex = '99999';
        },
        auto_select:           false,
        cancel_on_tap_outside: false,
        ux_mode:               'popup'
      });
    });
  }

  function _googleBtnHTML(label) {
    return `<svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg> ${label}`;
  }

  async function _onGoogleCredential(response) {
    // Restore overlay z-index (was lowered to let Google popup render on top)
    const overlay = document.getElementById('rpAuthOverlay');
    if (overlay) overlay.style.zIndex = '99999';

    const parts   = response.credential.split('.');
    const padded  = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(padded));
    const source  = window.location.hostname || 'rathnaproducts.store';

    ['rpGoogleLoginBtn','rpGoogleSignupBtn'].forEach(id => {
      const b = document.getElementById(id);
      if (b) { b.disabled = true; b.textContent = 'Verifying…'; }
    });
    clearMsgs();

    try {
      const res = await apiPost({
        action:   'rpGoogleAuth',
        email:    payload.email,
        name:     payload.name || '',
        googleId: payload.sub,
        avatar:   payload.picture || '',
        source
      });
      if (res.success) {
        migrateGuestDataToUser(res.user);
        setUser(res.user, DEFAULT_REMEMBER_MS);
        rpAuthClose();
        updateAuthUI();
        if (typeof rpOnLogin === 'function') rpOnLogin(res.user);
        _showToast(res.isNewUser ? '🎉 Welcome to RATHNA Products!' : '👋 Welcome back, ' + (res.user.name || res.user.email.split('@')[0]) + '!');
      } else {
        showMsg('rpLoginMsg',  res.error || 'Google sign-in failed.', 'error');
        showMsg('rpSignupMsg', res.error || 'Google sign-in failed.', 'error');
      }
    } catch {
      showMsg('rpLoginMsg',  'Network error. Please try again.', 'error');
      showMsg('rpSignupMsg', 'Network error. Please try again.', 'error');
    }
    ['rpGoogleLoginBtn','rpGoogleSignupBtn'].forEach(id => {
      const b = document.getElementById(id);
      if (b) { b.disabled = false; b.innerHTML = _googleBtnHTML(b.dataset.label); }
    });
  }

  window.rpTriggerGoogle = function() {
    if (!window.google || !window.google.accounts) {
      showMsg('rpLoginMsg',  'Google sign-in loading… please try again.', 'error');
      showMsg('rpSignupMsg', 'Google sign-in loading… please try again.', 'error');
      _initGIS();
      return;
    }
    // Lower overlay so Google popup iframe renders on top
    const overlay = document.getElementById('rpAuthOverlay');
    if (overlay) overlay.style.zIndex = '999';

    let gd = document.getElementById('_rp_gis_div');
    if (!gd) {
      gd = document.createElement('div');
      gd.id = '_rp_gis_div';
      gd.style.cssText = 'position:fixed;bottom:-9999px;left:-9999px;z-index:9999999;pointer-events:none';
      document.body.appendChild(gd);
    }
    gd.innerHTML = '';
    google.accounts.id.renderButton(gd, { type: 'standard', theme: 'outline', size: 'large' });
    setTimeout(() => {
      const rb = gd.querySelector('[role="button"],button,div[tabindex="0"]');
      if (rb) {
        rb.click();
      } else {
        if (overlay) overlay.style.zIndex = '99999';
        showMsg('rpLoginMsg',  'Google sign-in unavailable. Try again.', 'error');
        showMsg('rpSignupMsg', 'Google sign-in unavailable. Try again.', 'error');
      }
    }, 150);
  };

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
      <button class="rpa-close" onclick="rpAuthClose()" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
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
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:10px">
          <div style="display:flex;align-items:center;gap:8px;flex:1">
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:.8rem;font-weight:700;color:#555;white-space:nowrap">
              <input type="checkbox" id="rpRememberMe" checked style="width:15px;height:15px;accent-color:#8B0000;cursor:pointer;flex-shrink:0"/>
              Remember me
            </label>
            <select id="rpRememberDuration" style="border:1.5px solid #e0e0e0;border-radius:8px;padding:5px 8px;font-size:.78rem;color:#444;outline:none;cursor:pointer;background:#fff;flex:1;min-width:0">
              <option value="86400000">1 Day</option>
              <option value="259200000">3 Days</option>
              <option value="604800000">1 Week</option>
              <option value="1209600000">2 Weeks</option>
              <option value="2592000000" selected>1 Month</option>
              <option value="7776000000">3 Months</option>
              <option value="15552000000">6 Months</option>
              <option value="31536000000">1 Year</option>
            </select>
          </div>
          <div class="rpa-forgot" style="margin:0"><a onclick="rpForgotPwd()">Forgot password?</a></div>
        </div>
        <button class="rpa-btn" id="rpLoginBtn" onclick="rpDoLogin()">Login to My Account</button>
        <div class="rpa-msg" id="rpLoginMsg"></div>
        <div class="rpa-divider">or</div>
        <button type="button" id="rpGoogleLoginBtn" data-label="Continue with Google" onclick="rpTriggerGoogle()" style="width:100%;display:flex;align-items:center;justify-content:center;gap:9px;padding:11px;border-radius:12px;background:#fff;border:1.5px solid #dadce0;font-size:.9rem;font-weight:700;color:#3c4043;cursor:pointer;transition:box-shadow .2s;box-shadow:0 1px 4px rgba(0,0,0,.08)">
          <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Continue with Google
        </button>
        <div class="rpa-divider" style="margin-top:10px">or</div>
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
        <button type="button" id="rpGoogleSignupBtn" data-label="Sign up with Google" onclick="rpTriggerGoogle()" style="width:100%;display:flex;align-items:center;justify-content:center;gap:9px;padding:11px;border-radius:12px;background:#fff;border:1.5px solid #dadce0;font-size:.9rem;font-weight:700;color:#3c4043;cursor:pointer;transition:box-shadow .2s;box-shadow:0 1px 4px rgba(0,0,0,.08)">
          <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Sign up with Google
        </button>
        <div class="rpa-divider" style="margin-top:10px">or</div>
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
    // Sync remember-me dropdown visibility
    _syncRememberDuration();
  };

  function _syncRememberDuration() {
    const cb  = document.getElementById('rpRememberMe');
    const sel = document.getElementById('rpRememberDuration');
    if (cb && sel) sel.style.opacity = cb.checked ? '1' : '0.35';
  }

  // Wire up checkbox after modal is injected
  function _wireRememberMe() {
    const cb = document.getElementById('rpRememberMe');
    if (cb) cb.addEventListener('change', _syncRememberDuration);
  }

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
    _wireRememberMe();
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

    // Read remember-me setting
    const rememberChecked = document.getElementById('rpRememberMe')?.checked !== false;
    const rememberMs = rememberChecked
      ? parseInt(document.getElementById('rpRememberDuration')?.value || '2592000000', 10)
      : 1 * 24 * 60 * 60 * 1000; // 1 day if unchecked

    const btn = document.getElementById('rpLoginBtn');
    btn.disabled = true; btn.textContent = 'Logging in…';

    try {
      const res = await apiPost({ action: 'rpLogin', email: emailOrPhone, password: pass });
      if (res.success) {
        migrateGuestDataToUser(res.user);   // move guest cart/orders/addresses → user keys
        setUser(res.user, rememberMs);
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
        migrateGuestDataToUser(res.user);   // move guest cart/orders/addresses → user keys
        setUser(res.user, DEFAULT_REMEMBER_MS);
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
  // ── Forgot Password Modal (3-step: email → OTP → new password) ──
  let _fpEmail = '';

  function injectForgotModal() {
    if (document.getElementById('rpFpOverlay')) return;
    document.body.insertAdjacentHTML('beforeend', `
<div id="rpFpOverlay" onclick="if(event.target===this)rpFpClose()" style="position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:100001;display:none;align-items:center;justify-content:center;padding:12px">
  <div style="background:#fff;border-radius:22px;width:100%;max-width:400px;box-shadow:0 28px 80px rgba(0,0,0,.35);overflow:hidden;animation:rpSlideUp .28s cubic-bezier(.34,1.56,.64,1)">
    <div style="background:linear-gradient(135deg,#8B0000,#c0392b);padding:18px 22px 15px;display:flex;align-items:center;justify-content:space-between">
      <h2 style="color:#fff;font-size:1rem;font-weight:900;margin:0">&#128273; Reset Password</h2>
      <button onclick="rpFpClose()" style="background:none;border:none;color:rgba(255,255,255,.8);font-size:1.3rem;cursor:pointer;padding:2px 7px;border-radius:6px">&#x2715;</button>
    </div>
    <div style="padding:20px 22px 24px">
      <div id="rpFpStep1">
        <p style="font-size:.85rem;color:#555;margin:0 0 14px">Enter your registered email to receive a reset code.</p>
        <div class="rpa-field"><label>Email Address</label>
          <input type="email" id="rpFpEmail" placeholder="you@example.com" autocomplete="email" onkeydown="if(event.key==='Enter')rpFpSendCode()"/>
        </div>
        <button class="rpa-btn" id="rpFpSendBtn" onclick="rpFpSendCode()">Send Reset Code</button>
        <div class="rpa-msg" id="rpFpMsg1"></div>
      </div>
      <div id="rpFpStep2" style="display:none">
        <p style="font-size:.85rem;color:#555;margin:0 0 14px">Enter the 6-digit code sent to <strong id="rpFpEmailShow"></strong></p>
        <div class="rpa-field"><label>Reset Code</label>
          <input type="number" id="rpFpCode" placeholder="6-digit code" onkeydown="if(event.key==='Enter')rpFpVerifyCode()" style="font-size:1.4rem;font-weight:900;letter-spacing:6px;text-align:center"/>
        </div>
        <button class="rpa-btn" id="rpFpVerifyBtn" onclick="rpFpVerifyCode()">Verify Code</button>
        <div class="rpa-msg" id="rpFpMsg2"></div>
        <div style="text-align:center;margin-top:10px"><a onclick="rpFpBack()" style="font-size:.78rem;color:#8B0000;font-weight:700;cursor:pointer;text-decoration:underline">&#8592; Use different email</a></div>
      </div>
      <div id="rpFpStep3" style="display:none">
        <p style="font-size:.85rem;color:#555;margin:0 0 14px">Create a new password for your account.</p>
        <div class="rpa-field"><label>New Password</label>
          <input type="password" id="rpFpNewPass" placeholder="Min 6 characters" autocomplete="new-password"/>
        </div>
        <div class="rpa-field"><label>Confirm New Password</label>
          <input type="password" id="rpFpNewPass2" placeholder="Repeat new password" autocomplete="new-password" onkeydown="if(event.key==='Enter')rpFpDoReset()"/>
        </div>
        <button class="rpa-btn" id="rpFpResetBtn" onclick="rpFpDoReset()">Reset Password</button>
        <div class="rpa-msg" id="rpFpMsg3"></div>
      </div>
    </div>
  </div>
</div>`);
  }

  window.rpForgotPwd = function () {
    injectForgotModal();
    _fpEmail = document.getElementById('rpLEmail')?.value.trim() || '';
    if (_fpEmail) document.getElementById('rpFpEmail').value = _fpEmail;
    document.getElementById('rpFpOverlay').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    setTimeout(() => { const e = document.getElementById('rpFpEmail'); if (e) e.focus(); }, 100);
  };

  window.rpFpClose = function () {
    const ov = document.getElementById('rpFpOverlay');
    if (ov) ov.style.display = 'none';
    document.body.style.overflow = '';
  };

  window.rpFpBack = function () {
    document.getElementById('rpFpStep1').style.display = '';
    document.getElementById('rpFpStep2').style.display = 'none';
    document.getElementById('rpFpStep3').style.display = 'none';
    ['rpFpMsg1','rpFpMsg2','rpFpMsg3'].forEach(id => {
      const el = document.getElementById(id); if (el) { el.className = 'rpa-msg'; el.textContent = ''; }
    });
  };

  function _fpMsg(id, text, type) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className = 'rpa-msg ' + type;
  }

  window.rpFpSendCode = async function () {
    const email = document.getElementById('rpFpEmail').value.trim();
    if (!email) return _fpMsg('rpFpMsg1', 'Please enter your email address.', 'error');
    const btn = document.getElementById('rpFpSendBtn');
    btn.disabled = true; btn.textContent = 'Sending…';
    try {
      const res = await apiPost({ action: 'rpForgotPassword', email });
      if (res.success) {
        _fpEmail = email;
        document.getElementById('rpFpEmailShow').textContent = email;
        document.getElementById('rpFpStep1').style.display = 'none';
        document.getElementById('rpFpStep2').style.display = '';
        document.getElementById('rpFpCode').value = '';
        setTimeout(() => { const c = document.getElementById('rpFpCode'); if (c) c.focus(); }, 100);
      } else {
        _fpMsg('rpFpMsg1', res.error || 'Failed to send code.', 'error');
      }
    } catch { _fpMsg('rpFpMsg1', 'Network error. Please try again.', 'error'); }
    btn.disabled = false; btn.textContent = 'Send Reset Code';
  };

  window.rpFpVerifyCode = function () {
    const code = document.getElementById('rpFpCode').value.trim();
    if (code.length !== 6) return _fpMsg('rpFpMsg2', 'Enter the 6-digit code from your email.', 'error');
    document.getElementById('rpFpStep2').style.display = 'none';
    document.getElementById('rpFpStep3').style.display = '';
    setTimeout(() => { const p = document.getElementById('rpFpNewPass'); if (p) p.focus(); }, 100);
  };

  window.rpFpDoReset = async function () {
    const code  = document.getElementById('rpFpCode').value.trim();
    const pass  = document.getElementById('rpFpNewPass').value;
    const pass2 = document.getElementById('rpFpNewPass2').value;
    if (pass.length < 6) return _fpMsg('rpFpMsg3', 'Password must be at least 6 characters.', 'error');
    if (pass !== pass2)  return _fpMsg('rpFpMsg3', 'Passwords do not match.', 'error');
    const btn = document.getElementById('rpFpResetBtn');
    btn.disabled = true; btn.textContent = 'Resetting…';
    try {
      const res = await apiPost({ action: 'rpResetPassword', email: _fpEmail, code, newPassword: pass });
      if (res.success) {
        _fpMsg('rpFpMsg3', '&#10003; Password reset! You can now log in.', 'success');
        setTimeout(() => { rpFpClose(); rpAuthOpen('login'); }, 1800);
      } else {
        _fpMsg('rpFpMsg3', res.error || 'Reset failed. Please try again.', 'error');
        if (res.error && (res.error.includes('Invalid') || res.error.includes('expired'))) {
          setTimeout(() => {
            document.getElementById('rpFpStep3').style.display = 'none';
            document.getElementById('rpFpStep2').style.display = '';
          }, 1500);
        }
      }
    } catch { _fpMsg('rpFpMsg3', 'Network error. Please try again.', 'error'); }
    btn.disabled = false; btn.textContent = 'Reset Password';
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
    <div class="rpp-head" id="rppHead" style="position:relative">
      <div class="rpp-avatar" id="rppAvatar"></div>
      <div class="rpp-info">
        <div class="rpp-name"  id="rppName">My Account</div>
        <div class="rpp-email" id="rppEmail"></div>
        <div class="rpp-phone" id="rppPhone"></div>
      </div>
      <button class="rpp-close" onclick="rpProfileClose()" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
      <span id="rppJoinSellerBtn"></span>
    </div>

    <!-- Body -->
    <div class="rpp-body" id="rppBody">
      <!-- filled dynamically -->
    </div>

  </div>
</div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  }

  // ── Edit Profile Modal HTML ───────────────────────────────
  function injectEditProfileModal() {
    if (document.getElementById('rpEditProfileOverlay')) return;
    const html = `
<div id="rpEditProfileOverlay" onclick="if(event.target===this)rpEditProfileClose()">
  <div id="rpEditProfileModal">
    <div class="rpep-head">
      <h2>
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Edit Profile
      </h2>
      <button class="rpep-close" onclick="rpEditProfileClose()" aria-label="Close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="rpep-body">

      <!-- Avatar row -->
      <div class="rpep-avatar-row">
        <div class="rpep-avatar-big" id="rpepAvatarBig"></div>
        <div class="rpep-avatar-info">
          <strong id="rpepAvatarName">My Account</strong>
          <span id="rpepAvatarEmail"></span>
        </div>
      </div>

      <!-- Basic Info -->
      <div class="rpep-section">Basic Information</div>
      <div class="rpep-row">
        <div class="rpep-field">
          <label>Full Name</label>
          <input type="text" id="rpepName" placeholder="Your full name" maxlength="60"/>
        </div>
        <div class="rpep-field">
          <label>Phone Number</label>
          <input type="tel" id="rpepPhone" placeholder="10-digit number" maxlength="10"/>
        </div>
      </div>
      <div class="rpep-field">
        <label>Email Address <span style="color:#aaa;font-weight:500;text-transform:none">(cannot be changed)</span></label>
        <input type="email" id="rpepEmail" readonly/>
      </div>
      <div class="rpep-row">
        <div class="rpep-field">
          <label>Date of Birth</label>
          <input type="date" id="rpepDob"/>
        </div>
        <div class="rpep-field">
          <label>Gender</label>
          <select id="rpepGender">
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>
      </div>

      <!-- Address -->
      <div class="rpep-section">Default Address</div>
      <div class="rpep-field">
        <label>Street / Area</label>
        <input type="text" id="rpepAddress" placeholder="House no., street, area" maxlength="120"/>
      </div>
      <div class="rpep-row">
        <div class="rpep-field">
          <label>City / Town</label>
          <input type="text" id="rpepCity" placeholder="City or town" maxlength="60"/>
        </div>
        <div class="rpep-field">
          <label>Pincode</label>
          <input type="tel" id="rpepPincode" placeholder="6-digit pincode" maxlength="6"/>
        </div>
      </div>

      <div class="rpep-msg" id="rpepMsg"></div>
      <div class="rpep-actions">
        <button class="rpep-btn-save" id="rpepSaveBtn" onclick="rpDoUpdateProfile()">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="15" height="15" style="vertical-align:middle;margin-right:5px"><polyline points="20 6 9 17 4 12"/></svg>
          Save Changes
        </button>
        <button class="rpep-btn-cancel" onclick="rpEditProfileClose()">Cancel</button>
      </div>

    </div>
  </div>
</div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  }

  // ── Open Edit Profile Modal ───────────────────────────────
  window.rpOpenEditProfile = function () {
    const user = getUser();
    if (!user) { rpAuthOpen('login'); return; }
    injectEditProfileModal();

    // Populate fields
    const initials = _initials(user.name || user.email);
    document.getElementById('rpepAvatarBig').textContent  = initials;
    document.getElementById('rpepAvatarName').textContent = user.name || user.email.split('@')[0];
    document.getElementById('rpepAvatarEmail').textContent = user.email;
    document.getElementById('rpepName').value    = user.name    || '';
    document.getElementById('rpepPhone').value   = user.phone   || '';
    document.getElementById('rpepEmail').value   = user.email   || '';
    document.getElementById('rpepDob').value     = user.dob     || '';
    document.getElementById('rpepGender').value  = user.gender  || '';
    document.getElementById('rpepAddress').value = user.address || '';
    document.getElementById('rpepCity').value    = user.city    || '';
    document.getElementById('rpepPincode').value = user.pincode || '';

    // Clear any previous message
    const msg = document.getElementById('rpepMsg');
    if (msg) { msg.className = 'rpep-msg'; msg.textContent = ''; }

    document.getElementById('rpEditProfileOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => { const n = document.getElementById('rpepName'); if (n) n.focus(); }, 280);
  };

  window.rpEditProfileClose = function () {
    const ov = document.getElementById('rpEditProfileOverlay');
    if (ov) ov.classList.remove('open');
    document.body.style.overflow = '';
  };

  // ── Save Profile Changes ──────────────────────────────────
  window.rpDoUpdateProfile = async function () {
    const user = getUser();
    if (!user) return;

    const name    = document.getElementById('rpepName').value.trim();
    const phone   = document.getElementById('rpepPhone').value.replace(/\D/g,'').slice(-10);
    const dob     = document.getElementById('rpepDob').value.trim();
    const gender  = document.getElementById('rpepGender').value;
    const address = document.getElementById('rpepAddress').value.trim();
    const city    = document.getElementById('rpepCity').value.trim();
    const pincode = document.getElementById('rpepPincode').value.replace(/\D/g,'').slice(0,6);

    if (!name)  return _rpepMsg('Full name is required.', 'error');
    if (phone && phone.length !== 10) return _rpepMsg('Enter a valid 10-digit phone number.', 'error');
    if (pincode && pincode.length !== 6) return _rpepMsg('Pincode must be 6 digits.', 'error');

    const btn = document.getElementById('rpepSaveBtn');
    btn.disabled = true; btn.textContent = 'Saving…';

    try {
      const res = await apiPost({
        action: 'rpUpdateProfile',
        userId: user.id,
        email:  user.email,
        name, phone, dob, gender, address, city, pincode
      });

      if (res.success) {
        // Merge updated fields back into localStorage — preserve original _expiry, do NOT reset it
        const raw = localStorage.getItem(STORAGE_KEY);
        const stored = raw ? JSON.parse(raw) : {};
        const updated = {
          ...stored,
          name:    res.user.name    || stored.name,
          phone:   res.user.phone   || stored.phone,
          dob:     res.user.dob     || stored.dob     || '',
          gender:  res.user.gender  || stored.gender  || '',
          address: res.user.address || stored.address || '',
          city:    res.user.city    || stored.city    || '',
          pincode: res.user.pincode || stored.pincode || '',
          _expiry: stored._expiry
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        // Refresh profile panel header
        const freshUser = getUser();
        if (freshUser) {
          const ini = _initials(freshUser.name || freshUser.email);
          const av = document.getElementById('rppAvatar');
          const nm = document.getElementById('rppName');
          const ph = document.getElementById('rppPhone');
          if (av) av.textContent = ini;
          if (nm) nm.textContent = freshUser.name || freshUser.email.split('@')[0];
          if (ph) {
            ph.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,215,0,.9)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="12" height="12"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>';
            ph.appendChild(document.createTextNode(' ' + (freshUser.phone || '\u2014')));
          }
          // Rebuild profile body to reflect new data
          buildProfileBody(freshUser);
          if (typeof rpBuildSiteMenu === 'function') rpBuildSiteMenu();
        }
        updateAuthUI();
        _rpepMsg('Profile updated successfully!', 'success');
        setTimeout(() => rpEditProfileClose(), 1400);
        _showToast('✅ Profile updated!');
      } else {
        _rpepMsg(res.error || 'Update failed. Please try again.', 'error');
      }
    } catch {
      _rpepMsg('Network error. Please try again.', 'error');
    }
    btn.disabled = false;
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="15" height="15" style="vertical-align:middle;margin-right:5px"><polyline points="20 6 9 17 4 12"/></svg> Save Changes';
  };

  function _rpepMsg(text, type) {
    const el = document.getElementById('rpepMsg');
    if (!el) return;
    el.textContent = text;
    el.className = 'rpep-msg ' + type;
  }

  // ── Build profile body ────────────────────────────────────
  function buildProfileBody(user) {
    const isSeller = user.type === 'seller';
    const sellerStatus = user.sellerStatus || '';
    const initials = _initials(user.name || user.email);

    // Join as Seller small circle button in header (non-sellers only)
    const joinBtn = document.getElementById('rppJoinSellerBtn');
    if (joinBtn) {
      joinBtn.innerHTML = !isSeller
        ? `<a href="https://rathnaseller.rathnaproducts.store" target="_blank" rel="noopener" class="rpp-join-seller-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            <span class="rpp-join-tip">Join as Seller</span>
          </a>`
        : '';
    }

    // Header — use textContent to prevent XSS
    document.getElementById('rppAvatar').textContent = initials;
    document.getElementById('rppName').textContent   = user.name || user.email.split('@')[0];
    document.getElementById('rppEmail').textContent  = user.email;
    const phoneEl = document.getElementById('rppPhone');
    phoneEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,215,0,.9)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="12" height="12"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>';
    const phoneText = document.createTextNode(' ' + (user.phone || '\u2014'));
    phoneEl.appendChild(phoneText);

    const body = document.getElementById('rppBody');

    // Seller status banner OR become-seller banner
    let sellerHtml = '';
    if (isSeller) {
      const statusIcon = sellerStatus === 'Approved'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" style="vertical-align:middle;margin-right:4px"><polyline points="20 6 9 17 4 12"/></svg>'
        : sellerStatus === 'Rejected'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="#c0392b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" style="vertical-align:middle;margin-right:4px"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" style="vertical-align:middle;margin-right:4px"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
      const _esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
      sellerHtml = `
        <div class="rpp-seller-status">
          <h4>${statusIcon} Seller Account — ${_esc(sellerStatus)}</h4>
          <p>Seller ID: <strong>${_esc(user.sellerId || user.id)}</strong></p>
          ${sellerStatus === 'Approved'
            ? '<p style="margin-top:6px">Your seller account is active. Visit the portal to manage orders.</p>'
            : sellerStatus === 'Rejected'
            ? '<p style="margin-top:6px;color:#991b1b">Your seller account was rejected. Contact admin for details.</p>'
            : '<p style="margin-top:6px">Your seller registration is under review by admin.</p>'
          }
          <a href="https://rathnaseller.rathnaproducts.store" target="_blank" rel="noopener noreferrer"
             style="display:inline-flex;align-items:center;gap:6px;margin-top:10px;background:#1565c0;color:#fff;padding:7px 18px;border-radius:20px;font-size:.8rem;font-weight:800;text-decoration:none">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M5 12h14M12 5l7 7-7 7"/></svg> Open Seller Portal
          </a>
        </div>`;
    } else {
      sellerHtml = `
        <div class="rpp-seller-banner">
          <h4 style="display:flex;align-items:center;justify-content:center;gap:7px"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> Become a RATHNA Seller</h4>
          <p>Sell RATHNA Products in your area. Earn the full product price per order — plus delivery charge if you ship yourself.</p>
          <a href="https://rathnaseller.rathnaproducts.store" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:5px">Join as Seller <svg viewBox="0 0 24 24" fill="none" stroke="#1565c0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
        </div>`;
    }

    body.innerHTML = `
      <div class="rpp-section-title">My Account</div>
      <div class="rpp-card">
        <button class="rpp-menu-item" onclick="rpOpenEditProfile()">
          <span class="rpp-icon" style="background:#fff5f5"><svg viewBox="0 0 24 24" fill="none" stroke="#c0392b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></span>
          <span>Edit Profile</span>
          <span class="rpp-arrow">›</span>
        </button>
        <button class="rpp-menu-item" onclick="rpOpenChangePassword()">
          <span class="rpp-icon" style="background:#f0f9ff"><svg viewBox="0 0 24 24" fill="none" stroke="#1565c0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/><circle cx="12" cy="16" r="1" fill="#1565c0"/></svg></span>
          <span>Change Password</span>
          <span class="rpp-arrow">›</span>
        </button>
      </div>

      <div id="rpSiteMenu"></div>

      <div class="rpp-section-title">Our Brands</div>
      <div class="rpp-brand-logos">
        <a href="https://rathnaproducts.store" target="_blank" rel="noopener" class="rpp-brand-logo-btn" title="RATHNA Products">
          <img src="https://rathnaproducts.store/rathna%20logo2.0.png" alt="RATHNA Products"/>
        </a>
        <a href="https://homemade1.rathnaproducts.store" target="_blank" rel="noopener" class="rpp-brand-logo-btn" title="Home Made">
          <img src="https://rathnaproducts.store/home%20made.png" alt="Home Made"/>
        </a>
        <a href="https://rathnasarees.rathnaproducts.store" target="_blank" rel="noopener" class="rpp-brand-logo-btn" title="RATHNA Sarees">
          <img src="https://rathnaproducts.store/rathna%20sarees.png" alt="RATHNA Sarees"/>
        </a>
        <a href="https://generator.rathnaproducts.store" target="_blank" rel="noopener" class="rpp-brand-logo-btn" title="RATHNA Generator">
          <img src="https://rathnaproducts.store/generator.png" alt="Generator"/>
        </a>
        <a href="https://researchservices.rathnaproducts.store" target="_blank" rel="noopener" class="rpp-brand-logo-btn" title="Research Services">
          <img src="https://rathnaproducts.store/research%20services.png" alt="Research Services"/>
        </a>
        <a href="https://researchpositions.rathnaproducts.store" target="_blank" rel="noopener" class="rpp-brand-logo-btn" title="Research Positions">
          <img src="https://rathnaproducts.store/research%20positon.png" alt="Research Positions"/>
        </a>
        <a href="https://rathnaseller.rathnaproducts.store" target="_blank" rel="noopener" class="rpp-brand-logo-btn" title="RATHNA Seller">
          <img src="https://rathnaproducts.store/rathna%20seller.png" alt="RATHNA Seller"/>
        </a>
        <a href="https://rathnawebs.rathnaproducts.store" target="_blank" rel="noopener" class="rpp-brand-logo-btn" title="RATHNA Webs">
          <img src="https://rathnaproducts.store/rathnawebs.png" alt="RATHNA Webs"/>
        </a>
        <a href="https://rptools.rathnaproducts.store" target="_blank" rel="noopener" class="rpp-brand-logo-btn" title="RP Tools">
          <img src="https://rathnaproducts.store/rptools.png" alt="RP Tools"/>
        </a>
        <a href="https://picky.rathnaproducts.store" target="_blank" rel="noopener" class="rpp-brand-logo-btn" title="Picky">
          <img src="https://rathnaproducts.store/picky.png" alt="Picky"/>
        </a>
        <a href="https://rpdelivers.rathnaproducts.store" target="_blank" rel="noopener" class="rpp-brand-logo-btn" title="RP Delivers">
          <img src="https://rathnaproducts.store/RPdeliver.png" alt="RP Delivers"/>
        </a>
      </div>

      <div class="rpp-section-title">Support</div>
      <div class="rpp-card">
        <a class="rpp-menu-item" href="https://wa.me/918248599487" target="_blank" rel="noopener" style="text-decoration:none">
          <span class="rpp-icon" style="background:#f0fdf4"><svg viewBox="0 0 24 24" fill="#25d366" width="18" height="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></span>
          <span>WhatsApp Support</span>
          <span class="rpp-arrow">›</span>
        </a>
        <a class="rpp-menu-item" href="https://rathnaproducts.store/terms.html" target="_blank" rel="noopener" style="text-decoration:none">
          <span class="rpp-icon" style="background:#f8fafc"><svg viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></span>
          <span>Terms &amp; Conditions</span>
          <span class="rpp-arrow">›</span>
        </a>
        <a class="rpp-menu-item" href="https://rathnaproducts.store/privacy.html" target="_blank" rel="noopener" style="text-decoration:none">
          <span class="rpp-icon" style="background:#f8fafc"><svg viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></span>
          <span>Privacy Policy</span>
          <span class="rpp-arrow">›</span>
        </a>
      </div>

      <div style="padding:4px 2px 8px">
        ${isSeller ? sellerHtml : ''}
        <button class="rpp-menu-item danger" onclick="rpLogout()" style="border-radius:14px;border:1.5px solid #fecaca;background:#fff5f5">
          <span class="rpp-icon" style="background:#fee2e2"><svg viewBox="0 0 24 24" fill="none" stroke="#c0392b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></span>
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
      <div style="font-size:.8rem;font-weight:800;color:#8B0000;margin-bottom:12px;display:flex;align-items:center;gap:6px"><svg viewBox="0 0 24 24" fill="none" stroke="#8B0000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/><circle cx="12" cy="16" r="1" fill="#8B0000"/></svg> Change Password</div>
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
    if (cur === nw)           { msg.style.color='#c0392b'; msg.textContent='New password must be different from current password.'; return; }
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
    window.open('https://rathnaseller.rathnaproducts.store', '_blank');
  };

  // ── Init ──────────────────────────────────────────────────
  function init() {
    injectCSS();
    injectAuthModal();
    injectProfilePanel();
    injectEditProfileModal();
    _wireRememberMe();
    updateAuthUI();
    _initGIS(); // pre-load GIS eagerly so popup works on first click
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
