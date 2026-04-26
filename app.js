// ═══════════════════════════════════════════════════════════════
//  Generator — app.js
//  A RATHNA Product
// ═══════════════════════════════════════════════════════════════

// ── TAB SWITCHING ────────────────────────────────────────────────
function switchTab(btn, tab) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  document.getElementById(tab).classList.add('active');
  btn.classList.add('active');
}

// ── STYLE PICKER ─────────────────────────────────────────────────
let currentStyle = 'classic';
function pickStyle(card) {
  const grid = card.closest('.style-grid') || document.querySelector('.style-grid');
  grid.querySelectorAll('.style-card').forEach(c => c.classList.remove('active'));
  card.classList.add('active');
  currentStyle = card.dataset.style;
  generateCoupon();
}

// ── RANDOM CODE ──────────────────────────────────────────────────
function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  document.getElementById('couponCode').value = code;
  generateCoupon();
}

// ── COUPON GENERATOR ─────────────────────────────────────────────
function generateCoupon() {
  const canvas = document.getElementById('couponCanvas');
  const ctx    = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  const d = {
    brand   : document.getElementById('couponBrand').value    || 'RATHNA Products',
    title   : document.getElementById('couponTitle').value    || 'SPECIAL OFFER',
    discount: document.getElementById('couponDiscount').value || '30% OFF',
    code    : document.getElementById('couponCode').value     || 'SAVE30',
    expiry  : document.getElementById('couponExpiry').value,
    desc    : document.getElementById('couponDesc').value     || '',
    minPur  : document.getElementById('couponMin').value      || '',
    terms   : document.getElementById('couponTerms').value    || '',
    link    : document.getElementById('couponLink') ? document.getElementById('couponLink').value || '' : '',
    bg      : document.getElementById('couponBg').value,
    textCol : document.getElementById('couponText').value,
    accent  : document.getElementById('couponAccent').value,
  };

  ctx.clearRect(0, 0, W, H);

  switch (currentStyle) {
    case 'classic':  drawClassic(ctx, W, H, d);  break;
    case 'modern':   drawModern(ctx, W, H, d);   break;
    case 'minimal':  drawMinimal(ctx, W, H, d);  break;
    case 'luxury':   drawLuxury(ctx, W, H, d);   break;
    case 'festival': drawFestival(ctx, W, H, d); break;
    case 'neon':     drawNeon(ctx, W, H, d);     break;
    case 'saree':    drawSaree(ctx, W, H, d);    break;
    case 'grocery':  drawGrocery(ctx, W, H, d);  break;
    case 'vegetable':drawVegetable(ctx, W, H, d);break;
    case 'fruit':    drawFruit(ctx, W, H, d);    break;
    case 'homefood': drawHomefood(ctx, W, H, d); break;
    case 'dairy':    drawDairy(ctx, W, H, d);    break;
    case 'driedveg': drawDriedveg(ctx, W, H, d); break;
    case 'nuts':     drawNuts(ctx, W, H, d);     break;
    case 'herbal':   drawHerbal(ctx, W, H, d);   break;
    case 'seeds':    drawSeeds(ctx, W, H, d);    break;
  }
}

// ── STYLE 1 — CLASSIC ────────────────────────────────────────────
function drawClassic(ctx, W, H, d) {
  // Background
  ctx.fillStyle = d.bg;
  rr(ctx, 0, 0, W, H, 18); ctx.fill();

  // Left panel darker overlay
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  rr(ctx, 0, 0, 170, H, 18, 'left'); ctx.fill();

  // Dashed tear line
  ctx.save();
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(170, 0); ctx.lineTo(170, H); ctx.stroke();
  ctx.restore();

  // Notch circles
  ctx.fillStyle = '#0f0f1a';
  circ(ctx, 170, -1, 14);
  circ(ctx, 170, H + 1, 14);

  // Left — discount + logo
  ctx.save();
  ctx.translate(85, H / 2);
  ctx.fillStyle = d.textCol;
  ctx.font = 'bold 40px Inter, Segoe UI';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(d.discount, 0, -14);
  ctx.restore();
  // Brand logo top-left of left panel
  const _cl = window.rathnaLogo;
  if (_cl) {
    const _ls = 36;
    ctx.save();
    ctx.beginPath();
    ctx.arc(85, 28, _ls / 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(85, 28, _ls / 2, 0, Math.PI * 2);
    ctx.clip();
    try { ctx.drawImage(_cl, 85 - _ls / 2, 28 - _ls / 2, _ls, _ls); } catch(e){}
    ctx.restore();
  }

  // Right — content
  const rx = 192;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // Title
  ctx.font = 'bold 26px Inter, Segoe UI';
  ctx.fillStyle = d.textCol;
  ctx.fillText(d.title, rx, 58);

  // Desc
  ctx.font = '500 13px Inter, Segoe UI';
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillText(d.desc, rx, 82);

  // Min purchase pill
  if (d.minPur) {
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    rr(ctx, rx, 92, 120, 22, 11); ctx.fill();
    ctx.font = '600 11px Inter, Segoe UI';
    ctx.fillStyle = d.textCol;
    ctx.fillText('Min: ' + d.minPur, rx + 10, 107);
  }

  // Code box
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  rr(ctx, rx, 124, 210, 44, 10); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 3]);
  rr(ctx, rx, 124, 210, 44, 10); ctx.stroke();
  ctx.setLineDash([]);

  ctx.font = 'bold 22px "Courier New", monospace';
  ctx.fillStyle = d.accent;
  ctx.fillText(d.code, rx + 14, 152);

  ctx.font = '500 11px Inter, Segoe UI';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText('USE CODE AT CHECKOUT', rx + 14, 178);

  // Expiry
  if (d.expiry) {
    ctx.font = '500 11px Inter, Segoe UI';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('Valid until: ' + fmtDate(d.expiry), rx, 210);
  }

  // Terms
  if (d.terms) {
    ctx.font = '11px Inter, Segoe UI';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText(d.terms, rx, 232);
  }
  if (d.link) {
    ctx.font = '600 11px Inter, Segoe UI';
    ctx.fillStyle = d.accent;
    ctx.textAlign = 'left';
    ctx.fillText('🔗 ' + d.link, rx, 252);
  }

  drawBadgeAndLogo(ctx, W, H);
}

// ── STYLE 2 — MODERN ─────────────────────────────────────────────
function drawModern(ctx, W, H, d) {
  // Gradient bg
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, d.bg);
  g.addColorStop(0.6, shadeHex(d.bg, -30));
  g.addColorStop(1, shadeHex(d.bg, -60));
  ctx.fillStyle = g;
  rr(ctx, 0, 0, W, H, 18); ctx.fill();

  // Decorative blobs
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = '#fff';
  circ(ctx, W - 70, 50, 90);
  circ(ctx, W - 30, H - 30, 65);
  circ(ctx, 30, H - 40, 50);
  ctx.globalAlpha = 1;
  ctx.restore();

  // Top accent line
  ctx.fillStyle = d.accent;
  ctx.fillRect(0, 0, W, 5);
  rr(ctx, 0, 0, W, 5, 18, 'top'); ctx.fill();

  // Brand logo
  const _ml = window.rathnaLogo;
  if (_ml) {
    const _ls = 32;
    ctx.save();
    ctx.beginPath();
    ctx.arc(40, 28, _ls / 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(40, 28, _ls / 2, 0, Math.PI * 2);
    ctx.clip();
    try { ctx.drawImage(_ml, 40 - _ls / 2, 28 - _ls / 2, _ls, _ls); } catch(e){}
    ctx.restore();
  }

  // Discount badge
  ctx.fillStyle = d.accent;
  rr(ctx, 24, 48, 170, 72, 14); ctx.fill();
  ctx.font = 'bold 38px Inter, Segoe UI';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(d.discount, 109, 84);
  ctx.textBaseline = 'alphabetic';

  // Right content
  ctx.textAlign = 'left';
  ctx.font = 'bold 24px Inter, Segoe UI';
  ctx.fillStyle = d.textCol;
  ctx.fillText(d.title, 210, 80);

  ctx.font = '500 13px Inter, Segoe UI';
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText(d.desc, 210, 102);

  if (d.minPur) {
    ctx.font = '600 12px Inter, Segoe UI';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('Min. Purchase: ' + d.minPur, 210, 122);
  }

  // Divider
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 4]);
  ctx.beginPath(); ctx.moveTo(24, 140); ctx.lineTo(W - 24, 140); ctx.stroke();
  ctx.setLineDash([]);

  // Code row
  ctx.font = 'bold 20px "Courier New", monospace';
  ctx.fillStyle = d.accent;
  ctx.textAlign = 'left';
  ctx.fillText(d.code, 28, 172);

  ctx.font = '600 11px Inter, Segoe UI';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText('COUPON CODE', 28, 190);

  if (d.expiry) {
    ctx.textAlign = 'right';
    ctx.font = '500 12px Inter, Segoe UI';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('Expires: ' + fmtDate(d.expiry), W - 28, 172);
  }

  if (d.terms) {
    ctx.textAlign = 'left';
    ctx.font = '11px Inter, Segoe UI';
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillText(d.terms, 28, 215);
  }
  if (d.link) {
    ctx.font = '600 11px Inter, Segoe UI';
    ctx.fillStyle = d.accent;
    ctx.textAlign = 'left';
    ctx.fillText('🔗 ' + d.link, 28, 232);
  }

  drawBadgeAndLogo(ctx, W, H);
}

// ── STYLE 3 — MINIMAL ────────────────────────────────────────────
function drawMinimal(ctx, W, H, d) {
  // White bg
  ctx.fillStyle = '#ffffff';
  rr(ctx, 0, 0, W, H, 18); ctx.fill();

  // Top bar
  ctx.fillStyle = d.bg;
  rr(ctx, 0, 0, W, 8, 18, 'top'); ctx.fill();

  // Border
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1.5;
  rr(ctx, 1, 1, W - 2, H - 2, 17); ctx.stroke();

  // Left accent strip
  ctx.fillStyle = d.bg;
  ctx.fillRect(28, 30, 4, 180);

  // Brand logo
  const _minl = window.rathnaLogo;
  if (_minl) {
    const _ls = 32;
    ctx.save();
    ctx.beginPath();
    ctx.arc(44, 28, _ls / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#f3f4f6';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(44, 28, _ls / 2, 0, Math.PI * 2);
    ctx.clip();
    try { ctx.drawImage(_minl, 44 - _ls / 2, 28 - _ls / 2, _ls, _ls); } catch(e){}
    ctx.restore();
  }

  // Title
  ctx.font = 'bold 28px Inter, Segoe UI';
  ctx.fillStyle = '#111827';
  ctx.fillText(d.title, 44, 88);

  // Desc
  ctx.font = '500 13px Inter, Segoe UI';
  ctx.fillStyle = '#6b7280';
  ctx.fillText(d.desc, 44, 110);

  if (d.minPur) {
    ctx.font = '600 12px Inter, Segoe UI';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('Min. Purchase: ' + d.minPur, 44, 130);
  }

  // Discount — right side
  ctx.font = 'bold 52px Inter, Segoe UI';
  ctx.fillStyle = d.bg;
  ctx.textAlign = 'right';
  ctx.fillText(d.discount, W - 28, 100);

  // Dashed separator
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 4]);
  ctx.beginPath(); ctx.moveTo(28, 148); ctx.lineTo(W - 28, 148); ctx.stroke();
  ctx.setLineDash([]);

  // Notches on separator
  ctx.fillStyle = '#f0f2f5';
  circ(ctx, 28, 148, 10);
  circ(ctx, W - 28, 148, 10);

  // Code
  ctx.textAlign = 'left';
  ctx.font = 'bold 24px "Courier New", monospace';
  ctx.fillStyle = '#111827';
  ctx.fillText(d.code, 44, 186);

  ctx.font = '600 11px Inter, Segoe UI';
  ctx.fillStyle = '#9ca3af';
  ctx.fillText('USE THIS CODE AT CHECKOUT', 44, 204);

  if (d.expiry) {
    ctx.font = '500 11px Inter, Segoe UI';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('Valid until: ' + fmtDate(d.expiry), 44, 224);
  }

  if (d.terms) {
    ctx.textAlign = 'right';
    ctx.font = '11px Inter, Segoe UI';
    ctx.fillStyle = '#d1d5db';
    ctx.fillText(d.terms, W - 28, 224);
  }

  // Bottom bar
  ctx.fillStyle = d.bg;
  ctx.fillRect(0, H - 8, W, 8);
  rr(ctx, 0, H - 8, W, 8, 18, 'bottom'); ctx.fill();
  if (d.link) {
    ctx.font = '600 11px Inter, Segoe UI';
    ctx.fillStyle = d.bg;
    ctx.textAlign = 'left';
    ctx.fillText('🔗 ' + d.link, 44, 242);
  }

  drawBadgeAndLogo(ctx, W, H, true);
}

// ── STYLE 4 — LUXURY ─────────────────────────────────────────────
function drawLuxury(ctx, W, H, d) {
  // Dark bg
  ctx.fillStyle = '#0f0f1a';
  rr(ctx, 0, 0, W, H, 18); ctx.fill();

  // Gold border
  const gb = ctx.createLinearGradient(0, 0, W, H);
  gb.addColorStop(0, '#f59e0b');
  gb.addColorStop(0.5, '#fde68a');
  gb.addColorStop(1, '#d97706');
  ctx.strokeStyle = gb;
  ctx.lineWidth = 2;
  rr(ctx, 2, 2, W - 4, H - 4, 16); ctx.stroke();

  // Inner subtle border
  ctx.strokeStyle = 'rgba(245,158,11,0.2)';
  ctx.lineWidth = 1;
  rr(ctx, 8, 8, W - 16, H - 16, 12); ctx.stroke();

  // Gold diagonal pattern
  ctx.save();
  ctx.globalAlpha = 0.04;
  for (let i = -H; i < W + H; i += 20) {
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // Gold top accent
  ctx.fillStyle = gb;
  ctx.fillRect(40, 0, W - 80, 3);

  // Brand logo
  const _luxl = window.rathnaLogo;
  if (_luxl) {
    const _ls = 32;
    ctx.save();
    ctx.beginPath();
    ctx.arc(W / 2, 28, _ls / 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(245,158,11,0.2)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(W / 2, 28, _ls / 2, 0, Math.PI * 2);
    ctx.clip();
    try { ctx.drawImage(_luxl, W / 2 - _ls / 2, 28 - _ls / 2, _ls, _ls); } catch(e){}
    ctx.restore();
  }

  // Title
  ctx.font = 'bold 30px Inter, Segoe UI';
  ctx.fillStyle = '#fde68a';
  ctx.fillText(d.title, W / 2, 76);

  // Desc
  ctx.font = '500 13px Inter, Segoe UI';
  ctx.fillStyle = 'rgba(253,230,138,0.65)';
  ctx.fillText(d.desc, W / 2, 98);

  // Discount
  ctx.font = 'bold 52px Inter, Segoe UI';
  ctx.fillStyle = gb;
  ctx.fillText(d.discount, W / 2, 158);

  // Divider ornament
  ctx.strokeStyle = 'rgba(245,158,11,0.4)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath(); ctx.moveTo(40, 172); ctx.lineTo(W - 40, 172); ctx.stroke();
  ctx.setLineDash([]);

  // Code
  ctx.font = 'bold 22px "Courier New", monospace';
  ctx.fillStyle = '#fde68a';
  ctx.fillText(d.code, W / 2, 204);

  ctx.font = '600 10px Inter, Segoe UI';
  ctx.fillStyle = 'rgba(245,158,11,0.5)';
  ctx.fillText('EXCLUSIVE COUPON CODE', W / 2, 220);

  if (d.expiry) {
    ctx.font = '500 11px Inter, Segoe UI';
    ctx.fillStyle = 'rgba(245,158,11,0.5)';
    ctx.fillText('Valid until: ' + fmtDate(d.expiry), W / 2, 244);
  }

  if (d.terms) {
    ctx.font = '10px Inter, Segoe UI';
    ctx.fillStyle = 'rgba(245,158,11,0.3)';
    ctx.fillText(d.terms, W / 2, 264);
  }
  if (d.link) {
    ctx.font = '600 11px Inter, Segoe UI';
    ctx.fillStyle = '#f59e0b';
    ctx.textAlign = 'center';
    ctx.fillText('🔗 ' + d.link, W / 2, 280);
  }

  drawBadgeAndLogo(ctx, W, H);
}

// ── STYLE 5 — FESTIVAL ───────────────────────────────────────────
function drawFestival(ctx, W, H, d) {
  // Vibrant gradient bg
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#f97316');
  g.addColorStop(0.4, d.bg);
  g.addColorStop(1, '#ec4899');
  ctx.fillStyle = g;
  rr(ctx, 0, 0, W, H, 18); ctx.fill();

  // Confetti dots
  ctx.save();
  const dots = [[40,30,'#fff'],[120,20,'#fde68a'],[200,50,'#fff'],[300,25,'#a5f3fc'],
                [420,40,'#fde68a'],[500,20,'#fff'],[560,45,'#a5f3fc'],
                [80,H-30,'#fff'],[180,H-20,'#fde68a'],[350,H-35,'#fff'],[480,H-25,'#a5f3fc']];
  dots.forEach(([x,y,c]) => {
    ctx.fillStyle = c;
    ctx.globalAlpha = 0.7;
    circ(ctx, x, y, 4);
  });
  ctx.globalAlpha = 1;
  ctx.restore();

  // Star burst top-right
  ctx.save();
  ctx.translate(W - 60, 60);
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  for (let i = 0; i < 8; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 4);
    ctx.fillRect(-2, -50, 4, 50);
    ctx.restore();
  }
  ctx.restore();

  // Brand logo
  const _fesl = window.rathnaLogo;
  if (_fesl) {
    const _ls = 32;
    ctx.save();
    ctx.beginPath();
    ctx.arc(W - 40, 28, _ls / 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(W - 40, 28, _ls / 2, 0, Math.PI * 2);
    ctx.clip();
    try { ctx.drawImage(_fesl, W - 40 - _ls / 2, 28 - _ls / 2, _ls, _ls); } catch(e){}
    ctx.restore();
  }

  // Big discount
  ctx.font = 'bold 64px Inter, Segoe UI';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  ctx.fillText(d.discount, 24, 118);

  // Title
  ctx.font = 'bold 20px Inter, Segoe UI';
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillText(d.title, 24, 148);

  ctx.font = '500 13px Inter, Segoe UI';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText(d.desc, 24, 168);

  if (d.minPur) {
    ctx.font = '600 12px Inter, Segoe UI';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('Min: ' + d.minPur, 24, 188);
  }

  // Code pill
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  rr(ctx, 24, 200, 200, 40, 20); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1.5;
  rr(ctx, 24, 200, 200, 40, 20); ctx.stroke();
  ctx.font = 'bold 20px "Courier New", monospace';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(d.code, 124, 220);
  ctx.textBaseline = 'alphabetic';

  if (d.expiry) {
    ctx.textAlign = 'right';
    ctx.font = '500 11px Inter, Segoe UI';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('Valid until: ' + fmtDate(d.expiry), W - 24, 220);
  }

  if (d.terms) {
    ctx.textAlign = 'left';
    ctx.font = '10px Inter, Segoe UI';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText(d.terms, 24, 260);
  }
  if (d.link) {
    ctx.font = '600 11px Inter, Segoe UI';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.textAlign = 'left';
    ctx.fillText('🔗 ' + d.link, 24, 276);
  }

  drawBadgeAndLogo(ctx, W, H);
}

// ── STYLE 6 — NEON ───────────────────────────────────────────────
function drawNeon(ctx, W, H, d) {
  // Dark bg
  ctx.fillStyle = '#050510';
  rr(ctx, 0, 0, W, H, 18); ctx.fill();

  // Grid lines
  ctx.save();
  ctx.strokeStyle = 'rgba(99,102,241,0.12)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.restore();

  // Neon glow border
  ctx.save();
  ctx.shadowColor = d.bg;
  ctx.shadowBlur = 20;
  ctx.strokeStyle = d.bg;
  ctx.lineWidth = 2;
  rr(ctx, 3, 3, W - 6, H - 6, 16); ctx.stroke();
  ctx.restore();

  // Neon accent line top
  ctx.save();
  ctx.shadowColor = d.accent;
  ctx.shadowBlur = 15;
  ctx.fillStyle = d.accent;
  ctx.fillRect(40, 0, W - 80, 3);
  ctx.restore();

  // Brand logo
  const _neonl = window.rathnaLogo;
  if (_neonl) {
    const _ls = 32;
    ctx.save();
    ctx.shadowColor = d.bg;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(W - 40, 28, _ls / 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(W - 40, 28, _ls / 2, 0, Math.PI * 2);
    ctx.clip();
    try { ctx.drawImage(_neonl, W - 40 - _ls / 2, 28 - _ls / 2, _ls, _ls); } catch(e){}
    ctx.restore();
  }

  // Discount
  ctx.save();
  ctx.shadowColor = d.accent;
  ctx.shadowBlur = 24;
  ctx.font = 'bold 58px Inter, Segoe UI';
  ctx.fillStyle = d.accent;
  ctx.textAlign = 'left';
  ctx.fillText(d.discount, 24, 110);
  ctx.restore();

  // Title
  ctx.save();
  ctx.shadowColor = d.bg;
  ctx.shadowBlur = 12;
  ctx.font = 'bold 22px Inter, Segoe UI';
  ctx.fillStyle = d.textCol;
  ctx.textAlign = 'left';
  ctx.fillText(d.title, 24, 144);
  ctx.restore();

  ctx.font = '500 13px Inter, Segoe UI';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText(d.desc, 24, 166);

  if (d.minPur) {
    ctx.font = '600 12px Inter, Segoe UI';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText('Min: ' + d.minPur, 24, 186);
  }

  // Neon code box
  ctx.save();
  ctx.shadowColor = d.bg;
  ctx.shadowBlur = 16;
  ctx.strokeStyle = d.bg;
  ctx.lineWidth = 1.5;
  rr(ctx, 24, 198, 220, 42, 8); ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.shadowColor = d.accent;
  ctx.shadowBlur = 10;
  ctx.font = 'bold 22px "Courier New", monospace';
  ctx.fillStyle = d.accent;
  ctx.textAlign = 'left';
  ctx.fillText(d.code, 38, 225);
  ctx.restore();

  ctx.font = '600 10px Inter, Segoe UI';
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillText('COUPON CODE', 38, 248);

  if (d.expiry) {
    ctx.textAlign = 'right';
    ctx.font = '500 11px Inter, Segoe UI';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText('Valid until: ' + fmtDate(d.expiry), W - 24, 225);
  }

  if (d.terms) {
    ctx.textAlign = 'left';
    ctx.font = '10px Inter, Segoe UI';
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillText(d.terms, 24, 272);
  }
  if (d.link) {
    ctx.font = '600 11px Inter, Segoe UI';
    ctx.fillStyle = d.accent;
    ctx.textAlign = 'left';
    ctx.fillText('🔗 ' + d.link, 24, 288);
  }

  drawBadgeAndLogo(ctx, W, H);
}

// ── STYLE 7 — SAREE ────────────────────────────────────────────────────────
function drawSaree(ctx, W, H, d) {
  // Rich silk gradient bg
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#7b1fa2');
  g.addColorStop(0.5, d.bg);
  g.addColorStop(1, '#c62828');
  ctx.fillStyle = g;
  rr(ctx, 0, 0, W, H, 18); ctx.fill();

  // Gold border
  ctx.strokeStyle = '#f9a825';
  ctx.lineWidth = 3;
  rr(ctx, 4, 4, W - 8, H - 8, 15); ctx.stroke();

  // Decorative paisley dots
  ctx.save();
  ctx.globalAlpha = 0.18;
  const dotColors = ['#f9a825','#fff','#f9a825','#fff'];
  [[30,30],[W-30,30],[30,H-30],[W-30,H-30],[W/2,20],[W/2,H-20]].forEach(([x,y],i) => {
    ctx.fillStyle = dotColors[i % 2];
    circ(ctx, x, y, 8);
  });
  ctx.globalAlpha = 1;
  ctx.restore();

  // Saree SVG icon (top-left)
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  rr(ctx, 14, 14, 48, 48, 10); ctx.fill();
  ctx.strokeStyle = '#f9a825';
  ctx.lineWidth = 1.5;
  // Simple saree drape lines
  ctx.beginPath(); ctx.moveTo(20,20); ctx.bezierCurveTo(30,30,50,25,58,38); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(20,28); ctx.bezierCurveTo(32,38,52,33,58,46); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(20,36); ctx.bezierCurveTo(34,46,54,41,58,54); ctx.stroke();
  ctx.restore();

  // Brand logo area
  const _sl = window.rathnaLogo;
  if (_sl) {
    const ls = 36;
    ctx.save();
    ctx.beginPath(); ctx.arc(W - 30, 30, ls/2, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fill();
    ctx.beginPath(); ctx.arc(W - 30, 30, ls/2, 0, Math.PI*2); ctx.clip();
    try { ctx.drawImage(_sl, W-30-ls/2, 30-ls/2, ls, ls); } catch(e){}
    ctx.restore();
  }

  // Discount
  ctx.font = 'bold 52px Inter, Segoe UI';
  ctx.fillStyle = '#f9a825';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(d.discount, 24, 110);

  // Title
  ctx.font = 'bold 22px Inter, Segoe UI';
  ctx.fillStyle = '#fff';
  ctx.fillText(d.title, 24, 142);

  ctx.font = '500 13px Inter, Segoe UI';
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText(d.desc, 24, 162);

  if (d.minPur) { ctx.font = '600 12px Inter, Segoe UI'; ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillText('Min: ' + d.minPur, 24, 180); }

  // Code pill
  ctx.fillStyle = 'rgba(249,168,37,0.25)';
  rr(ctx, 24, 192, 200, 38, 19); ctx.fill();
  ctx.strokeStyle = '#f9a825'; ctx.lineWidth = 1.5;
  rr(ctx, 24, 192, 200, 38, 19); ctx.stroke();
  ctx.font = 'bold 18px "Courier New", monospace';
  ctx.fillStyle = '#f9a825';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(d.code, 124, 211);
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';

  if (d.expiry) { ctx.font = '500 11px Inter, Segoe UI'; ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillText('Valid until: ' + fmtDate(d.expiry), 24, 248); }
  if (d.terms)  { ctx.font = '10px Inter, Segoe UI'; ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillText(d.terms, 24, 264); }
  if (d.link)   { ctx.font = '600 11px Inter, Segoe UI'; ctx.fillStyle = '#f9a825'; ctx.fillText('🔗 ' + d.link, 24, 280); }

  drawBadgeAndLogo(ctx, W, H);
}

// ── STYLE 8 — GROCERY ─────────────────────────────────────────────────────
function drawGrocery(ctx, W, H, d) {
  // Warm yellow-green bg
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#f9a825');
  g.addColorStop(0.5, d.bg);
  g.addColorStop(1, '#2e7d32');
  ctx.fillStyle = g;
  rr(ctx, 0, 0, W, H, 18); ctx.fill();

  // White wave strip
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.moveTo(0, H * 0.55);
  for (let x = 0; x <= W; x += 40) ctx.quadraticCurveTo(x + 20, H * 0.45, x + 40, H * 0.55);
  ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
  ctx.restore();

  // Grocery basket SVG icon
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 2;
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  rr(ctx, W - 70, H - 70, 56, 56, 12); ctx.fill();
  // basket lines
  ctx.beginPath(); ctx.moveTo(W-62, H-50); ctx.lineTo(W-18, H-50); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W-58, H-50); ctx.lineTo(W-55, H-22); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W-22, H-50); ctx.lineTo(W-25, H-22); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W-55, H-22); ctx.lineTo(W-25, H-22); ctx.stroke();
  ctx.restore();

  // Discount
  ctx.font = 'bold 58px Inter, Segoe UI';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(d.discount, 24, 108);

  ctx.font = 'bold 20px Inter, Segoe UI';
  ctx.fillStyle = '#1b5e20';
  ctx.fillText(d.title, 24, 138);

  ctx.font = '500 13px Inter, Segoe UI';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText(d.desc, 24, 158);

  if (d.minPur) { ctx.font = '600 12px Inter, Segoe UI'; ctx.fillStyle = '#1b5e20'; ctx.fillText('Min: ' + d.minPur, 24, 176); }

  // Code box
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  rr(ctx, 24, 188, 210, 40, 10); ctx.fill();
  ctx.font = 'bold 20px "Courier New", monospace';
  ctx.fillStyle = '#2e7d32';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(d.code, 129, 208);
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';

  ctx.font = '600 11px Inter, Segoe UI'; ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText('USE CODE AT CHECKOUT', 24, 246);

  if (d.expiry) { ctx.font = '500 11px Inter, Segoe UI'; ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillText('Valid until: ' + fmtDate(d.expiry), 24, 262); }
  if (d.terms)  { ctx.font = '10px Inter, Segoe UI'; ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillText(d.terms, 24, 278); }
  if (d.link)   { ctx.font = '600 11px Inter, Segoe UI'; ctx.fillStyle = '#fff'; ctx.fillText('🔗 ' + d.link, 24, 292); }

  drawBadgeAndLogo(ctx, W, H);
}

// ── STYLE 9 — VEGETABLE ───────────────────────────────────────────────────
function drawVegetable(ctx, W, H, d) {
  ctx.fillStyle = '#fff';
  rr(ctx, 0, 0, W, H, 18); ctx.fill();

  // Green top band
  const g = ctx.createLinearGradient(0, 0, W, 90);
  g.addColorStop(0, '#2e7d32'); g.addColorStop(1, d.bg);
  ctx.fillStyle = g;
  rr(ctx, 0, 0, W, 90, 18, 'top'); ctx.fill();

  // Leaf SVG icon
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W-50, 15); ctx.bezierCurveTo(W-20, 10, W-10, 40, W-30, 55);
  ctx.bezierCurveTo(W-50, 40, W-70, 30, W-50, 15); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W-50, 15); ctx.lineTo(W-30, 55); ctx.stroke();
  ctx.restore();

  // Discount
  ctx.font = 'bold 48px Inter, Segoe UI';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(d.discount, 24, 72);

  // Title
  ctx.font = 'bold 22px Inter, Segoe UI';
  ctx.fillStyle = '#1b5e20';
  ctx.fillText(d.title, 24, 118);

  ctx.font = '500 13px Inter, Segoe UI';
  ctx.fillStyle = '#4a4a4a';
  ctx.fillText(d.desc, 24, 138);

  if (d.minPur) { ctx.font = '600 12px Inter, Segoe UI'; ctx.fillStyle = '#388e3c'; ctx.fillText('Min: ' + d.minPur, 24, 156); }

  // Dashed separator
  ctx.strokeStyle = '#a5d6a7'; ctx.lineWidth = 1; ctx.setLineDash([5,4]);
  ctx.beginPath(); ctx.moveTo(24, 168); ctx.lineTo(W-24, 168); ctx.stroke();
  ctx.setLineDash([]);

  // Code
  ctx.font = 'bold 22px "Courier New", monospace';
  ctx.fillStyle = '#2e7d32';
  ctx.fillText(d.code, 24, 200);
  ctx.font = '600 11px Inter, Segoe UI'; ctx.fillStyle = '#9ca3af';
  ctx.fillText('USE CODE AT CHECKOUT', 24, 218);

  if (d.expiry) { ctx.font = '500 11px Inter, Segoe UI'; ctx.fillStyle = '#6b7280'; ctx.fillText('Valid until: ' + fmtDate(d.expiry), 24, 238); }
  if (d.terms)  { ctx.font = '10px Inter, Segoe UI'; ctx.fillStyle = '#d1d5db'; ctx.textAlign = 'right'; ctx.fillText(d.terms, W-24, 238); ctx.textAlign = 'left'; }
  if (d.link)   { ctx.font = '600 11px Inter, Segoe UI'; ctx.fillStyle = '#2e7d32'; ctx.fillText('🔗 ' + d.link, 24, 256); }

  drawBadgeAndLogo(ctx, W, H, true);
}

// ── STYLE 10 — FRUIT ────────────────────────────────────────────────────────
function drawFruit(ctx, W, H, d) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#e53935'); g.addColorStop(0.5, d.bg); g.addColorStop(1, '#fdd835');
  ctx.fillStyle = g;
  rr(ctx, 0, 0, W, H, 18); ctx.fill();

  // Circular blobs
  ctx.save(); ctx.globalAlpha = 0.12; ctx.fillStyle = '#fff';
  circ(ctx, W-60, 60, 80); circ(ctx, 40, H-40, 60);
  ctx.globalAlpha = 1; ctx.restore();

  // Fruit icon (apple shape)
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.arc(W-50, 50, 28, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2;
  // stem
  ctx.beginPath(); ctx.moveTo(W-50, 22); ctx.quadraticCurveTo(W-38, 14, W-34, 20); ctx.stroke();
  ctx.restore();

  ctx.font = 'bold 56px Inter, Segoe UI';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(d.discount, 24, 108);

  ctx.font = 'bold 20px Inter, Segoe UI'; ctx.fillStyle = '#fff';
  ctx.fillText(d.title, 24, 138);
  ctx.font = '500 13px Inter, Segoe UI'; ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillText(d.desc, 24, 158);
  if (d.minPur) { ctx.font = '600 12px Inter, Segoe UI'; ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.fillText('Min: ' + d.minPur, 24, 176); }

  // Code pill
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  rr(ctx, 24, 188, 200, 38, 19); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.5;
  rr(ctx, 24, 188, 200, 38, 19); ctx.stroke();
  ctx.font = 'bold 18px "Courier New", monospace';
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(d.code, 124, 207);
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';

  if (d.expiry) { ctx.font = '500 11px Inter, Segoe UI'; ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.fillText('Valid until: ' + fmtDate(d.expiry), 24, 244); }
  if (d.terms)  { ctx.font = '10px Inter, Segoe UI'; ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillText(d.terms, 24, 260); }
  if (d.link)   { ctx.font = '600 11px Inter, Segoe UI'; ctx.fillStyle = '#fff'; ctx.fillText('🔗 ' + d.link, 24, 276); }

  drawBadgeAndLogo(ctx, W, H);
}

// ── STYLE 11 — HOME FOOD ──────────────────────────────────────────────────
function drawHomefood(ctx, W, H, d) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#bf360c'); g.addColorStop(0.6, d.bg); g.addColorStop(1, '#e65100');
  ctx.fillStyle = g;
  rr(ctx, 0, 0, W, H, 18); ctx.fill();

  // Steam lines
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(W-80+i*20, H-20);
    ctx.bezierCurveTo(W-85+i*20, H-40, W-75+i*20, H-50, W-80+i*20, H-70);
    ctx.stroke();
  }
  ctx.restore();

  // Pot icon
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2;
  rr(ctx, W-72, H-68, 50, 40, 8); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W-80, H-52); ctx.lineTo(W-72, H-52); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W-22, H-52); ctx.lineTo(W-14, H-52); ctx.stroke();
  ctx.restore();

  ctx.font = 'bold 54px Inter, Segoe UI';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(d.discount, 24, 106);

  ctx.font = 'bold 20px Inter, Segoe UI'; ctx.fillStyle = '#ffccbc';
  ctx.fillText(d.title, 24, 136);
  ctx.font = '500 13px Inter, Segoe UI'; ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText(d.desc, 24, 156);
  if (d.minPur) { ctx.font = '600 12px Inter, Segoe UI'; ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillText('Min: ' + d.minPur, 24, 174); }

  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  rr(ctx, 24, 186, 210, 38, 10); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1; ctx.setLineDash([4,3]);
  rr(ctx, 24, 186, 210, 38, 10); ctx.stroke(); ctx.setLineDash([]);
  ctx.font = 'bold 20px "Courier New", monospace';
  ctx.fillStyle = '#ffccbc'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(d.code, 129, 205);
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';

  if (d.expiry) { ctx.font = '500 11px Inter, Segoe UI'; ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillText('Valid until: ' + fmtDate(d.expiry), 24, 242); }
  if (d.terms)  { ctx.font = '10px Inter, Segoe UI'; ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillText(d.terms, 24, 258); }
  if (d.link)   { ctx.font = '600 11px Inter, Segoe UI'; ctx.fillStyle = '#ffccbc'; ctx.fillText('🔗 ' + d.link, 24, 274); }

  drawBadgeAndLogo(ctx, W, H);
}

// ── STYLE 12 — DAIRY ─────────────────────────────────────────────────────────
function drawDairy(ctx, W, H, d) {
  // Clean white bg with blue tint
  ctx.fillStyle = '#e3f2fd';
  rr(ctx, 0, 0, W, H, 18); ctx.fill();

  // Blue top band
  const g = ctx.createLinearGradient(0, 0, W, 80);
  g.addColorStop(0, '#0288d1'); g.addColorStop(1, d.bg);
  ctx.fillStyle = g;
  rr(ctx, 0, 0, W, 80, 18, 'top'); ctx.fill();

  // Milk drop icon
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.moveTo(W-50, 15);
  ctx.bezierCurveTo(W-30, 15, W-20, 35, W-20, 50);
  ctx.bezierCurveTo(W-20, 68, W-80, 68, W-80, 50);
  ctx.bezierCurveTo(W-80, 35, W-70, 15, W-50, 15);
  ctx.fill();
  ctx.restore();

  ctx.font = 'bold 48px Inter, Segoe UI';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(d.discount, 24, 66);

  ctx.font = 'bold 22px Inter, Segoe UI'; ctx.fillStyle = '#01579b';
  ctx.fillText(d.title, 24, 112);
  ctx.font = '500 13px Inter, Segoe UI'; ctx.fillStyle = '#546e7a';
  ctx.fillText(d.desc, 24, 132);
  if (d.minPur) { ctx.font = '600 12px Inter, Segoe UI'; ctx.fillStyle = '#0288d1'; ctx.fillText('Min: ' + d.minPur, 24, 150); }

  ctx.strokeStyle = '#b3e5fc'; ctx.lineWidth = 1; ctx.setLineDash([5,4]);
  ctx.beginPath(); ctx.moveTo(24, 162); ctx.lineTo(W-24, 162); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#b3e5fc'; circ(ctx, 24, 162, 8); circ(ctx, W-24, 162, 8);

  ctx.font = 'bold 22px "Courier New", monospace'; ctx.fillStyle = '#01579b';
  ctx.fillText(d.code, 24, 196);
  ctx.font = '600 11px Inter, Segoe UI'; ctx.fillStyle = '#90a4ae';
  ctx.fillText('USE CODE AT CHECKOUT', 24, 214);

  if (d.expiry) { ctx.font = '500 11px Inter, Segoe UI'; ctx.fillStyle = '#90a4ae'; ctx.fillText('Valid until: ' + fmtDate(d.expiry), 24, 234); }
  if (d.terms)  { ctx.font = '10px Inter, Segoe UI'; ctx.fillStyle = '#b0bec5'; ctx.textAlign = 'right'; ctx.fillText(d.terms, W-24, 234); ctx.textAlign = 'left'; }
  if (d.link)   { ctx.font = '600 11px Inter, Segoe UI'; ctx.fillStyle = '#0288d1'; ctx.fillText('🔗 ' + d.link, 24, 252); }

  drawBadgeAndLogo(ctx, W, H, true);
}

// ── STYLE 13 — DRIED VEG ──────────────────────────────────────────────────
function drawDriedveg(ctx, W, H, d) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#4e342e'); g.addColorStop(0.6, d.bg); g.addColorStop(1, '#795548');
  ctx.fillStyle = g;
  rr(ctx, 0, 0, W, H, 18); ctx.fill();

  // Diagonal texture
  ctx.save(); ctx.globalAlpha = 0.06;
  for (let i = -H; i < W+H; i += 16) {
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i+H, H); ctx.stroke();
  }
  ctx.globalAlpha = 1; ctx.restore();

  // Sun-dry icon (sun)
  ctx.save();
  ctx.strokeStyle = 'rgba(255,204,128,0.6)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(W-50, 50, 20, 0, Math.PI*2); ctx.stroke();
  for (let a = 0; a < 8; a++) {
    const angle = (a * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(W-50 + Math.cos(angle)*24, 50 + Math.sin(angle)*24);
    ctx.lineTo(W-50 + Math.cos(angle)*32, 50 + Math.sin(angle)*32);
    ctx.stroke();
  }
  ctx.restore();

  ctx.font = 'bold 52px Inter, Segoe UI';
  ctx.fillStyle = '#ffcc80';
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(d.discount, 24, 106);

  ctx.font = 'bold 20px Inter, Segoe UI'; ctx.fillStyle = '#ffe0b2';
  ctx.fillText(d.title, 24, 136);
  ctx.font = '500 13px Inter, Segoe UI'; ctx.fillStyle = 'rgba(255,224,178,0.75)';
  ctx.fillText(d.desc, 24, 156);
  if (d.minPur) { ctx.font = '600 12px Inter, Segoe UI'; ctx.fillStyle = 'rgba(255,204,128,0.7)'; ctx.fillText('Min: ' + d.minPur, 24, 174); }

  ctx.fillStyle = 'rgba(255,204,128,0.2)';
  rr(ctx, 24, 186, 210, 38, 10); ctx.fill();
  ctx.strokeStyle = 'rgba(255,204,128,0.5)'; ctx.lineWidth = 1; ctx.setLineDash([4,3]);
  rr(ctx, 24, 186, 210, 38, 10); ctx.stroke(); ctx.setLineDash([]);
  ctx.font = 'bold 20px "Courier New", monospace';
  ctx.fillStyle = '#ffcc80'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(d.code, 129, 205);
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';

  if (d.expiry) { ctx.font = '500 11px Inter, Segoe UI'; ctx.fillStyle = 'rgba(255,204,128,0.55)'; ctx.fillText('Valid until: ' + fmtDate(d.expiry), 24, 242); }
  if (d.terms)  { ctx.font = '10px Inter, Segoe UI'; ctx.fillStyle = 'rgba(255,204,128,0.35)'; ctx.fillText(d.terms, 24, 258); }
  if (d.link)   { ctx.font = '600 11px Inter, Segoe UI'; ctx.fillStyle = '#ffcc80'; ctx.fillText('🔗 ' + d.link, 24, 274); }

  drawBadgeAndLogo(ctx, W, H);
}

// ── STYLE 14 — NUTS ──────────────────────────────────────────────────────────
function drawNuts(ctx, W, H, d) {
  ctx.fillStyle = '#3e2723';
  rr(ctx, 0, 0, W, H, 18); ctx.fill();

  // Warm gradient overlay
  const g = ctx.createRadialGradient(W*0.3, H*0.3, 0, W*0.3, H*0.3, W*0.7);
  g.addColorStop(0, 'rgba(161,136,127,0.3)'); g.addColorStop(1, 'transparent');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  // Gold border
  ctx.strokeStyle = '#a1887f'; ctx.lineWidth = 2;
  rr(ctx, 4, 4, W-8, H-8, 15); ctx.stroke();

  // Nut icon (almond shape)
  ctx.save();
  ctx.fillStyle = 'rgba(161,136,127,0.3)';
  ctx.beginPath();
  ctx.ellipse(W-50, 50, 22, 32, Math.PI/6, 0, Math.PI*2);
  ctx.fill();
  ctx.strokeStyle = '#d7ccc8'; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(W-50, 50, 22, 32, Math.PI/6, 0, Math.PI*2);
  ctx.stroke();
  ctx.restore();

  ctx.font = 'bold 52px Inter, Segoe UI';
  ctx.fillStyle = '#d7ccc8';
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(d.discount, 24, 106);

  ctx.font = 'bold 20px Inter, Segoe UI'; ctx.fillStyle = '#efebe9';
  ctx.fillText(d.title, 24, 136);
  ctx.font = '500 13px Inter, Segoe UI'; ctx.fillStyle = 'rgba(239,235,233,0.7)';
  ctx.fillText(d.desc, 24, 156);
  if (d.minPur) { ctx.font = '600 12px Inter, Segoe UI'; ctx.fillStyle = '#a1887f'; ctx.fillText('Min: ' + d.minPur, 24, 174); }

  ctx.strokeStyle = '#6d4c41'; ctx.lineWidth = 1; ctx.setLineDash([5,4]);
  ctx.beginPath(); ctx.moveTo(24, 186); ctx.lineTo(W-24, 186); ctx.stroke();
  ctx.setLineDash([]);

  ctx.font = 'bold 22px "Courier New", monospace'; ctx.fillStyle = '#d7ccc8';
  ctx.fillText(d.code, 24, 218);
  ctx.font = '600 11px Inter, Segoe UI'; ctx.fillStyle = '#8d6e63';
  ctx.fillText('USE CODE AT CHECKOUT', 24, 236);

  if (d.expiry) { ctx.font = '500 11px Inter, Segoe UI'; ctx.fillStyle = '#8d6e63'; ctx.fillText('Valid until: ' + fmtDate(d.expiry), 24, 256); }
  if (d.terms)  { ctx.font = '10px Inter, Segoe UI'; ctx.fillStyle = '#6d4c41'; ctx.textAlign = 'right'; ctx.fillText(d.terms, W-24, 256); ctx.textAlign = 'left'; }
  if (d.link)   { ctx.font = '600 11px Inter, Segoe UI'; ctx.fillStyle = '#d7ccc8'; ctx.fillText('🔗 ' + d.link, 24, 274); }

  drawBadgeAndLogo(ctx, W, H);
}

// ── STYLE 15 — HERBAL ─────────────────────────────────────────────────────────
function drawHerbal(ctx, W, H, d) {
  ctx.fillStyle = '#f9fbe7';
  rr(ctx, 0, 0, W, H, 18); ctx.fill();

  // Deep green left panel
  const g = ctx.createLinearGradient(0, 0, 180, H);
  g.addColorStop(0, '#1b5e20'); g.addColorStop(1, d.bg);
  ctx.fillStyle = g;
  rr(ctx, 0, 0, 180, H, 18, 'left'); ctx.fill();

  // Dashed tear line
  ctx.save(); ctx.setLineDash([5,5]);
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(180, 0); ctx.lineTo(180, H); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = '#f9fbe7'; circ(ctx, 180, -1, 12); circ(ctx, 180, H+1, 12);

  // Herb leaf icon
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(90, H-20); ctx.lineTo(90, 60);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(90, 80); ctx.bezierCurveTo(60, 70, 50, 50, 70, 40);
  ctx.bezierCurveTo(80, 35, 90, 60, 90, 60); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(90, 100); ctx.bezierCurveTo(120, 90, 130, 70, 110, 60);
  ctx.bezierCurveTo(100, 55, 90, 80, 90, 80); ctx.stroke();
  ctx.restore();

  // Left discount
  ctx.font = 'bold 32px Inter, Segoe UI';
  ctx.fillStyle = '#a5d6a7';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(d.discount, 90, H/2);
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';

  // Right content
  const rx = 198;
  ctx.font = 'bold 24px Inter, Segoe UI'; ctx.fillStyle = '#1b5e20';
  ctx.fillText(d.title, rx, 58);
  ctx.font = '500 13px Inter, Segoe UI'; ctx.fillStyle = '#4a4a4a';
  ctx.fillText(d.desc, rx, 78);
  if (d.minPur) { ctx.font = '600 12px Inter, Segoe UI'; ctx.fillStyle = '#388e3c'; ctx.fillText('Min: ' + d.minPur, rx, 96); }

  ctx.fillStyle = 'rgba(27,94,32,0.1)';
  rr(ctx, rx, 108, 210, 40, 10); ctx.fill();
  ctx.strokeStyle = '#a5d6a7'; ctx.lineWidth = 1; ctx.setLineDash([4,3]);
  rr(ctx, rx, 108, 210, 40, 10); ctx.stroke(); ctx.setLineDash([]);
  ctx.font = 'bold 20px "Courier New", monospace'; ctx.fillStyle = '#1b5e20';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(d.code, rx + 105, 128);
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';

  ctx.font = '600 11px Inter, Segoe UI'; ctx.fillStyle = '#9ca3af';
  ctx.fillText('USE CODE AT CHECKOUT', rx, 164);
  if (d.expiry) { ctx.font = '500 11px Inter, Segoe UI'; ctx.fillStyle = '#6b7280'; ctx.fillText('Valid until: ' + fmtDate(d.expiry), rx, 184); }
  if (d.terms)  { ctx.font = '10px Inter, Segoe UI'; ctx.fillStyle = '#d1d5db'; ctx.fillText(d.terms, rx, 202); }
  if (d.link)   { ctx.font = '600 11px Inter, Segoe UI'; ctx.fillStyle = '#1b5e20'; ctx.fillText('🔗 ' + d.link, rx, 220); }

  drawBadgeAndLogo(ctx, W, H, true);
}

// ── STYLE 16 — SEEDS ──────────────────────────────────────────────────────────
function drawSeeds(ctx, W, H, d) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#f57f17'); g.addColorStop(0.5, d.bg); g.addColorStop(1, '#33691e');
  ctx.fillStyle = g;
  rr(ctx, 0, 0, W, H, 18); ctx.fill();

  // Seed dot pattern
  ctx.save(); ctx.globalAlpha = 0.12;
  const seedPos = [[50,40],[120,25],[200,45],[300,30],[400,50],[500,35],[560,55],
                   [80,H-35],[180,H-25],[280,H-40],[380,H-30],[480,H-45]];
  seedPos.forEach(([x,y]) => {
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(x, y, 5, 8, Math.PI/4, 0, Math.PI*2); ctx.fill();
  });
  ctx.globalAlpha = 1; ctx.restore();

  // Seed icon
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath(); ctx.ellipse(W-50, 50, 18, 28, Math.PI/5, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(W-50, 50, 18, 28, Math.PI/5, 0, Math.PI*2); ctx.stroke();
  ctx.restore();

  ctx.font = 'bold 54px Inter, Segoe UI';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(d.discount, 24, 106);

  ctx.font = 'bold 20px Inter, Segoe UI'; ctx.fillStyle = '#fff9c4';
  ctx.fillText(d.title, 24, 136);
  ctx.font = '500 13px Inter, Segoe UI'; ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText(d.desc, 24, 156);
  if (d.minPur) { ctx.font = '600 12px Inter, Segoe UI'; ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillText('Min: ' + d.minPur, 24, 174); }

  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  rr(ctx, 24, 186, 210, 38, 19); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1.5;
  rr(ctx, 24, 186, 210, 38, 19); ctx.stroke();
  ctx.font = 'bold 18px "Courier New", monospace';
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(d.code, 124, 205);
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';

  if (d.expiry) { ctx.font = '500 11px Inter, Segoe UI'; ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillText('Valid until: ' + fmtDate(d.expiry), 24, 242); }
  if (d.terms)  { ctx.font = '10px Inter, Segoe UI'; ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillText(d.terms, 24, 258); }
  if (d.link)   { ctx.font = '600 11px Inter, Segoe UI'; ctx.fillStyle = '#fff9c4'; ctx.fillText('🔗 ' + d.link, 24, 274); }

  drawBadgeAndLogo(ctx, W, H);
}

// ═══════════════════════════════════════════════════════════════
//  PART B — BADGE · LOGO · DOWNLOAD · WHATSAPP SHARE
// ═══════════════════════════════════════════════════════════════

// ── RATHNA PRODUCT BADGE + LOGO ──────────────────────────────────
function drawBadgeAndLogo(ctx, W, H, lightBg = false) {

  // ── "A RATHNA Product" ribbon badge (top-right corner) ─────────
  ctx.save();
  const bw = 160, bh = 38, bx = W - bw, by = 0;

  // Shadow
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur  = 12;

  // Badge body — rich red gradient
  const badgeGrad = ctx.createLinearGradient(bx, 0, W, bh);
  badgeGrad.addColorStop(0, '#991b1b');
  badgeGrad.addColorStop(0.5, '#dc2626');
  badgeGrad.addColorStop(1, '#b91c1c');
  ctx.fillStyle = badgeGrad;
  ctx.beginPath();
  ctx.moveTo(bx + 16, by);
  ctx.lineTo(W - 16, by);
  ctx.quadraticCurveTo(W, by, W, by + 16);
  ctx.lineTo(W, by + bh);
  ctx.lineTo(bx, by + bh);
  ctx.lineTo(bx, by + 16);
  ctx.quadraticCurveTo(bx, by, bx + 16, by);
  ctx.closePath();
  ctx.fill();

  // Shine strip on badge
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.moveTo(bx + 16, by);
  ctx.lineTo(W - 16, by);
  ctx.quadraticCurveTo(W, by, W, by + 16);
  ctx.lineTo(W, by + bh / 2);
  ctx.lineTo(bx, by + bh / 2);
  ctx.lineTo(bx, by + 16);
  ctx.quadraticCurveTo(bx, by, bx + 16, by);
  ctx.closePath();
  ctx.fill();

  // Notch / tail
  ctx.fillStyle = '#7f1d1d';
  ctx.beginPath();
  ctx.moveTo(bx, by + bh);
  ctx.lineTo(bx + 16, by + bh + 14);
  ctx.lineTo(bx + 32, by + bh);
  ctx.closePath();
  ctx.fill();

  // Badge text line 1 — "A RATHNA Product"
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur  = 4;
  ctx.fillStyle   = '#fff';
  ctx.font        = 'bold 13px Inter, Segoe UI';
  ctx.textAlign   = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('A RATHNA Product', bx + bw / 2, by + bh / 2);
  ctx.restore();

  const logo = window.rathnaLogo;

  // ── Logo bottom-right — circular clipped ──────────────────────
  const cr = 46;
  const cx = W - cr - 16;
  const cy = H - cr - 16;
  ctx.save();
  ctx.shadowColor = 'rgba(99,102,241,0.45)';
  ctx.shadowBlur  = 20;
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.lineWidth   = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, cr + 5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur  = 0;
  ctx.strokeStyle = 'rgba(99,102,241,0.35)';
  ctx.lineWidth   = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, cr + 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowColor = 'rgba(0,0,0,0.25)';
  ctx.shadowBlur  = 16;
  ctx.fillStyle   = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, cr, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur  = 0;
  ctx.beginPath();
  ctx.arc(cx, cy, cr - 3, 0, Math.PI * 2);
  ctx.clip();
  if (logo) {
    const d2 = (cr - 3) * 2;
    try { ctx.drawImage(logo, cx - (cr - 3), cy - (cr - 3), d2, d2); } catch(e){}
  } else {
    ctx.fillStyle = '#b91c1c';
    ctx.font = 'bold 11px Inter, Segoe UI';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('RATHNA', cx, cy - 7);
    ctx.fillText('Products', cx, cy + 8);
  }
  ctx.restore();
}

// ── DOWNLOAD COUPON (8K quality) ─────────────────────────────────
function downloadCoupon() {
  const canvas = document.getElementById('couponCanvas');
  const code   = document.getElementById('couponCode').value || 'coupon';
  const scale  = 8; // 8K: 600*8=4800 x 300*8=2400
  const hq     = document.createElement('canvas');
  hq.width     = canvas.width  * scale;
  hq.height    = canvas.height * scale;
  const hqCtx  = hq.getContext('2d');
  hqCtx.imageSmoothingEnabled = true;
  hqCtx.imageSmoothingQuality = 'high';
  hqCtx.scale(scale, scale);
  hqCtx.drawImage(canvas, 0, 0);
  const a    = document.createElement('a');
  a.download = `generator-coupon-${code}-8K.png`;
  a.href     = hq.toDataURL('image/png', 1.0);
  a.click();
}

// ── BUILD WHATSAPP MESSAGE ────────────────────────────────────────
function buildShareMsg() {
  const brand    = document.getElementById('couponBrand').value    || 'RATHNA Products';
  const title    = document.getElementById('couponTitle').value    || 'SPECIAL OFFER';
  const discount = document.getElementById('couponDiscount').value || '';
  const code     = document.getElementById('couponCode').value     || '';
  const expiry   = document.getElementById('couponExpiry').value;
  const desc     = document.getElementById('couponDesc').value     || '';
  const minPur   = document.getElementById('couponMin').value      || '';
  const terms    = document.getElementById('couponTerms').value    || '';
  const link     = document.getElementById('couponLink') ? document.getElementById('couponLink').value || '' : '';

  const lines = [
    `🎉🎉 *EXCLUSIVE OFFER from ${brand}!* 🎉🎉`,
    ``,
    `🔥 *${title}* 🔥`,
    discount ? `💰 *Get ${discount} on your next order!*` : '',
    desc     ? `📦 *Offer:* ${desc}` : '',
    minPur   ? `🛒 *Min. Order:* ${minPur}` : '',
    ``,
    `════════════════════════`,
    `🎫 *USE THIS COUPON CODE:*`,
    ``,
    `➡️  *${code}*  ⬅️`,
    ``,
    `════════════════════════`,
    ``,
    `📝 *How to Redeem:*`,
    `    ✅ Step 1: Visit *${brand}*`,
    `    ✅ Step 2: Add your favourite items`,
    `    ✅ Step 3: Apply code *${code}* at checkout`,
    `    🎉 Step 4: Save big & enjoy!`,
    ``,
    link   ? `🔗 *Shop Now & Redeem:* ${link}` : '',
    expiry ? `⏰ *Offer Expires: ${fmtDate(expiry)}* — Don’t wait!` : '',
    terms  ? `📌 _${terms}_` : '',
    ``,
    `════════════════════════`,
    `⭐ _${brand} — Quality You Can Always Trust_`,
    link ? `🌐 _${link}_` : `🌐 _www.rathnaproducts.store_`,
    `════════════════════════`,
    `_Powered by Generator — A RATHNA Product_`,
  ];
  return lines.filter(Boolean).join('\n');
}

// ── WHATSAPP SHARE ────────────────────────────────────────────────
async function shareOnWhatsApp() {
  const canvas  = document.getElementById('couponCanvas');
  const msg     = buildShareMsg();
  const code    = document.getElementById('couponCode').value || 'coupon';

  // High-quality 8K canvas for sharing
  const scale = 8;
  const hq    = document.createElement('canvas');
  hq.width    = canvas.width  * scale;
  hq.height   = canvas.height * scale;
  const hqCtx = hq.getContext('2d');
  hqCtx.imageSmoothingEnabled = true;
  hqCtx.imageSmoothingQuality = 'high';
  hqCtx.scale(scale, scale);
  hqCtx.drawImage(canvas, 0, 0);

  let blob = null, dataUrl = null;
  try {
    dataUrl = hq.toDataURL('image/png', 1.0);
    blob    = await new Promise(res => hq.toBlob(res, 'image/png', 1.0));
  } catch (e) { blob = null; }

  // ── MOBILE: Web Share API sends image + text in ONE message ──
  if (blob) {
    const file = new File([blob], `rathna-coupon-${code}.png`, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files : [file],
          text  : msg,
          title : `${code} — Coupon from RATHNA Products`
        });
        return;
      } catch (e) {
        if (e.name === 'AbortError') return;
      }
    }
  }

  // ── DESKTOP: show modal — image download + pre-filled message ──
  // Do NOT open WhatsApp separately — user copies message from modal
  // and pastes it along with the image in one WhatsApp message
  showShareModal(dataUrl, msg, blob, code);
}

// ── SHARE MODAL ───────────────────────────────────────────────────
function showShareModal(dataUrl, msg, blob, code) {
  const old = document.getElementById('waShareModal');
  if (old) old.remove();

  const modal  = document.createElement('div');
  modal.id     = 'waShareModal';
  modal._blob  = blob;

  const imgTag = dataUrl
    ? `<img src="${dataUrl}" alt="Coupon Preview"/>`
    : `<div style="padding:20px;color:#9ca3af;font-size:0.85rem">Image not available</div>`;

  const dlBtn = dataUrl
    ? `<a download="rathna-coupon-${code}.png" href="${dataUrl}" class="wsm-btn-dl">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Download Coupon Image
       </a>` : '';

  modal.innerHTML = `
    <div class="wsm-overlay" onclick="document.getElementById('waShareModal').remove()"></div>
    <div class="wsm-box">
      <h3>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#25D366">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.857L.057 23.428a.5.5 0 00.609.61l5.71-1.496A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.95 9.95 0 01-5.187-1.453l-.371-.22-3.388.888.903-3.296-.242-.381A9.953 9.953 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
        Share on WhatsApp
      </h3>
      <p class="wsm-sub">Send the coupon image &amp; message together in <strong>one WhatsApp message</strong></p>

      <div class="wsm-steps">
        <div class="wsm-step">
          <span class="wsm-num">1</span>
          <div>
            <strong>Download the coupon image</strong>
            ${dlBtn}
          </div>
        </div>
        <div class="wsm-step">
          <span class="wsm-num">2</span>
          <div>
            <strong>Copy the message below</strong>
            <button class="wsm-btn-copy" id="wsmCopyBtn" onclick="wsmCopyMsg()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
              Copy Message
            </button>
          </div>
        </div>
        <div class="wsm-step">
          <span class="wsm-num">3</span>
          <div>
            <strong>Open WhatsApp &rarr; attach image &rarr; paste message &rarr; Send</strong>
            <button class="wsm-btn-copy" style="margin-top:8px" onclick="window.open('https://web.whatsapp.com/','_blank')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Open WhatsApp Web
            </button>
          </div>
        </div>
      </div>

      <div class="wsm-preview">
        ${imgTag}
        <pre id="wsmMsgText">${msg}</pre>
      </div>

      <button class="wsm-close" onclick="document.getElementById('waShareModal').remove()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        Close
      </button>
    </div>
  `;

  document.body.appendChild(modal);
}

// ── COPY MESSAGE ONLY ─────────────────────────────────────────────
async function wsmCopyMsg() {
  const msg = document.getElementById('wsmMsgText').textContent;
  const btn = document.getElementById('wsmCopyBtn');
  try {
    await navigator.clipboard.writeText(msg);
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = msg; document.body.appendChild(ta);
    ta.select(); document.execCommand('copy'); ta.remove();
  }
  btn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    Copied!
  `;
  btn.style.background = 'linear-gradient(135deg,#16a34a,#15803d)';
  setTimeout(() => {
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copy Message`;
    btn.style.background = '';
  }, 2500);
}

// ═══════════════════════════════════════════════════════════════
//  PART C — BARCODE · QR CODE · HELPERS
// ═══════════════════════════════════════════════════════════════

// ── BARCODE GENERATOR ────────────────────────────────────────────
function generateBarcode() {
  const value   = document.getElementById('barcodeValue').value.trim() || '123456789012';
  const format  = document.getElementById('barcodeFormat').value;
  const width   = parseFloat(document.getElementById('barcodeWidth').value);
  const height  = parseInt(document.getElementById('barcodeHeight').value);
  const color   = document.getElementById('barcodeColor').value;
  const bgCol   = document.getElementById('barcodeBg').value;
  const showTxt = document.getElementById('barcodeShowText').checked;
  const fontSize= parseInt(document.getElementById('barcodeFont').value);
  const label   = document.getElementById('barcodeLabel').value;

  try {
    JsBarcode('#barcodesvg', value, {
      format,
      width,
      height,
      lineColor  : color,
      background : bgCol,
      displayValue: showTxt,
      fontSize,
      fontOptions: 'bold',
      font       : 'Inter, Segoe UI, sans-serif',
      margin     : 18,
      marginTop  : 14,
      marginBottom: 14,
    });
    document.getElementById('barcodeLabelText').textContent = label;
  } catch (e) {
    document.getElementById('barcodeLabelText').textContent = '⚠ Invalid value for selected format. Try CODE128.';
  }
}

// ── BARCODE DOWNLOAD PNG ──────────────────────────────────────────
function downloadBarcode() {
  const svg  = document.getElementById('barcodesvg');
  const xml  = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([xml], { type: 'image/svg+xml' });
  const url  = URL.createObjectURL(blob);
  const img  = new Image();

  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width  = img.width  || svg.getBoundingClientRect().width  || 400;
    canvas.height = img.height || svg.getBoundingClientRect().height || 200;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const a      = document.createElement('a');
    a.download   = `rathna-barcode-${document.getElementById('barcodeValue').value}.png`;
    a.href       = canvas.toDataURL('image/png');
    a.click();
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

// ── BARCODE DOWNLOAD SVG ──────────────────────────────────────────
function downloadBarcodeSVG() {
  const svg  = document.getElementById('barcodesvg');
  const xml  = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([xml], { type: 'image/svg+xml' });
  const a    = document.createElement('a');
  a.download = `rathna-barcode-${document.getElementById('barcodeValue').value}.svg`;
  a.href     = URL.createObjectURL(blob);
  a.click();
}

// ── BARCODE LABEL UPDATERS ────────────────────────────────────────
function updateBarcodeWidthLabel(v)  { document.getElementById('barcodeWidthLabel').textContent  = v; }
function updateBarcodeHeightLabel(v) { document.getElementById('barcodeHeightLabel').textContent = v + 'px'; }
function updateBarcodeFontLabel(v)   { document.getElementById('barcodeFontLabel').textContent   = v; }

// ── QR CODE GENERATOR ────────────────────────────────────────────
let _qrInstance = null;

function generateQR() {
  const type  = document.getElementById('qrType').value;
  const raw   = document.getElementById('qrValue').value.trim();
  const size  = parseInt(document.getElementById('qrSize').value);
  const dark  = document.getElementById('qrDark').value;
  const light = document.getElementById('qrLight').value;
  const label = document.getElementById('qrLabel').value;
  const ecc   = document.getElementById('qrEcc').value;

  // Build final QR content based on type
  let content = raw;
  if (raw) {
    switch (type) {
      case 'phone':     content = `tel:${raw}`;                          break;
      case 'email':     content = `mailto:${raw}`;                       break;
      case 'whatsapp':  content = `https://wa.me/${raw.replace(/\D/g,'')}`; break;
      case 'upi':       content = `upi://pay?pa=${raw}&pn=RATHNA+Products`; break;
      default:          content = raw;
    }
  }

  const eccMap = { L: QRCode.CorrectLevel.L, M: QRCode.CorrectLevel.M, Q: QRCode.CorrectLevel.Q, H: QRCode.CorrectLevel.H };

  const container = document.getElementById('qrcode-output');
  container.innerHTML = '';

  try {
    _qrInstance = new QRCode(container, {
      text        : content || 'https://www.rathnaproducts.store',
      width       : size,
      height      : size,
      colorDark   : dark,
      colorLight  : light,
      correctLevel: eccMap[ecc] || QRCode.CorrectLevel.M,
    });
  } catch (e) {
    container.innerHTML = '<p style="color:#ef4444;font-size:0.85rem">⚠ Could not generate QR. Check your input.</p>';
  }

  document.getElementById('qrLabelText').textContent = label;
}

// ── QR TYPE PLACEHOLDER ───────────────────────────────────────────
function updateQrPlaceholder() {
  const type  = document.getElementById('qrType').value;
  const input = document.getElementById('qrValue');
  const lbl   = document.getElementById('qrValueLabel');
  const map   = {
    url      : ['URL',             'https://www.rathnaproducts.store'],
    text     : ['Text',            'Enter any text here'],
    phone    : ['Phone Number',    '+91 98765 43210'],
    email    : ['Email Address',   'hello@rathnaproducts.store'],
    whatsapp : ['WhatsApp Number', '919876543210'],
    upi      : ['UPI ID',          'rathna@upi'],
  };
  lbl.textContent    = map[type][0];
  input.placeholder  = map[type][1];
  input.value        = '';
}

// ── QR SIZE LABEL ─────────────────────────────────────────────────
function updateQrSizeLabel(v) { document.getElementById('qrSizeLabel').textContent = v; }

// ── QR DOWNLOAD ───────────────────────────────────────────────────
function downloadQR() {
  // QRCode.js renders a canvas (modern) or img (fallback)
  const canvas = document.querySelector('#qrcode-output canvas');
  const img    = document.querySelector('#qrcode-output img');
  const a      = document.createElement('a');
  a.download   = 'rathna-qrcode.png';

  if (canvas) {
    a.href = canvas.toDataURL('image/png');
  } else if (img) {
    a.href = img.src;
  } else {
    return;
  }
  a.click();
}

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

// Rounded rect path — mode: 'all' | 'left' | 'top' | 'bottom'
function rr(ctx, x, y, w, h, r, mode = 'all') {
  ctx.beginPath();
  const tl = (mode === 'all' || mode === 'top'    || mode === 'left')   ? r : 0;
  const tr = (mode === 'all' || mode === 'top'    || mode === 'right')  ? r : 0;
  const br = (mode === 'all' || mode === 'bottom' || mode === 'right')  ? r : 0;
  const bl = (mode === 'all' || mode === 'bottom' || mode === 'left')   ? r : 0;
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  ctx.quadraticCurveTo(x + w, y,     x + w, y + tr);
  ctx.lineTo(x + w, y + h - br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
  ctx.lineTo(x + bl, y + h);
  ctx.quadraticCurveTo(x, y + h,     x, y + h - bl);
  ctx.lineTo(x, y + tl);
  ctx.quadraticCurveTo(x, y,         x + tl, y);
  ctx.closePath();
}

// Circle path
function circ(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

// Format date dd/mm/yyyy
function fmtDate(str) {
  if (!str) return '';
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}

// Shade a hex color by amt (+/-)
function shadeHex(hex, amt) {
  let r = Math.max(0, Math.min(255, parseInt(hex.slice(1, 3), 16) + amt));
  let g = Math.max(0, Math.min(255, parseInt(hex.slice(3, 5), 16) + amt));
  let b = Math.max(0, Math.min(255, parseInt(hex.slice(5, 7), 16) + amt));
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

// ═══════════════════════════════════════════════════════════════
//  PREMIUM — Benefits · Checkout · Code Activation
// ═══════════════════════════════════════════════════════════════

const PREM_UPI_ID   = 'rathnaraj1234567890-7@okhdfcbank';
const PREM_UPI_NAME = 'RATHNA Generator';
const PREM_AMOUNT   = 199;
const PREM_WA_NUM   = '918248599487';

// Google Sheets Apps Script URL — replace with your deployed URL
const PREM_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyGDsTtv71TcfCpc9sTjJVW-Ot94XUGRzNcCMNM8Bj9TFCJZcY-FWPTW9gKrXU6t_1B/exec';

// ── OPEN / CLOSE ─────────────────────────────────────────────────
function openPremium() {
  // If already active, show status
  const exp = localStorage.getItem('prem_expiry');
  if (exp && Date.now() < parseInt(exp)) {
    premGoScreen(4);
    document.getElementById('premCodeMsg').textContent = '✅ Premium is active until ' + new Date(parseInt(exp)).toLocaleDateString('en-IN');
    document.getElementById('premCodeMsg').style.color = '#16a34a';
  } else {
    premGoScreen(1);
  }
  const ov = document.getElementById('premiumOverlay');
  ov.style.display = 'flex';
  ov.classList.add('open');
}

function closePremium() {
  const ov = document.getElementById('premiumOverlay');
  ov.style.display = 'none';
  ov.classList.remove('open');
}

function premGoScreen(n) {
  [1,2,3,4].forEach(i => {
    const el = document.getElementById('premScreen' + i);
    if (el) el.style.display = i === n ? 'block' : 'none';
  });
}

function premGoCheckout() {
  premGoScreen(2);
  premRenderQR();
}

function premGoEnterCode() {
  premGoScreen(4);
  document.getElementById('premCodeMsg').textContent = '';
}

// ── UPI QR CODE ───────────────────────────────────────────────────
function premRenderQR() {
  const upiUrl = `upi://pay?pa=${PREM_UPI_ID}&pn=${encodeURIComponent(PREM_UPI_NAME)}&am=${PREM_AMOUNT}&cu=INR&tn=${encodeURIComponent('Generator Premium 1 Month')}`;
  const qrEl = document.getElementById('premQrCode');
  qrEl.innerHTML = '';
  try {
    new QRCode(qrEl, {
      text: upiUrl, width: 160, height: 160,
      colorDark: '#1e1b4b', colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M,
    });
  } catch(e) {
    qrEl.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(upiUrl)}&color=1e1b4b&bgcolor=ffffff&margin=4" width="160" height="160" style="border-radius:6px"/>`;
  }
}

function premCopyUpi() {
  navigator.clipboard.writeText(PREM_UPI_ID).then(() => {
    const btn = document.querySelector('.prem-copy-btn');
    btn.textContent = '✅ Copied!';
    setTimeout(() => btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copy`, 2000);
  });
}

function premTxnCheck() {
  const val = document.getElementById('premTxnId').value.trim();
  const el  = document.getElementById('premTxnCheck');
  if (val.length >= 8) {
    el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
  } else {
    el.innerHTML = val.length > 0 ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>` : '';
  }
}

// ── SUBMIT ORDER ──────────────────────────────────────────────────
function premSubmitOrder() {
  const name  = document.getElementById('premName').value.trim();
  const phone = document.getElementById('premPhone').value.trim();
  const txn   = document.getElementById('premTxnId').value.trim();

  if (!name)                        { premToast('⚠️ Please enter your name.'); return; }
  if (!/^[6-9]\d{9}$/.test(phone)) { premToast('⚠️ Enter a valid 10-digit phone number.'); return; }
  if (txn.length < 8)               { premToast('⚠️ Please enter a valid Transaction ID.'); return; }

  const btn = document.querySelector('#premScreen2 .prem-btn-buy');
  btn.disabled = true; btn.textContent = 'Submitting...';

  const orderId = 'PREM' + Date.now();
  const dateStr = new Date().toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' });

  // Send order to Google Sheets via GET (reliable from browser)
  const params = new URLSearchParams({
    action : 'order',
    orderId, name, phone,
    txnId  : txn,
    amount : PREM_AMOUNT
  });
  fetch(PREM_SHEETS_URL + '?' + params.toString()).catch(() => {});

  localStorage.setItem('prem_pending', JSON.stringify({ orderId, name, phone, txn, date: dateStr }));

  const msg =
    `⭐ *Premium Order — Generator*%0A` +
    `━━━━━━━━━━━━━━━━━━━━%0A` +
    `🆔 Order ID: ${orderId}%0A` +
    `📅 Date: ${dateStr}%0A` +
    `👤 Name: ${name}%0A` +
    `📱 Phone: ${phone}%0A` +
    `💰 Amount: ₹${PREM_AMOUNT}%0A` +
    `💳 UPI TXN ID: ${txn}%0A` +
    `━━━━━━━━━━━━━━━━━━━━%0A` +
    `✅ Verify payment & approve in Google Sheet to auto-generate code.`;

  document.getElementById('premOrderId').textContent = 'Order ID: ' + orderId;
  premGoScreen(3);
  btn.disabled = false;
  setTimeout(() => window.open(`https://wa.me/${PREM_WA_NUM}?text=${msg}`, '_blank'), 600);
}

// ── ACTIVATE CODE (verify against Google Sheets) ──────────────────
async function premActivateCode() {
  const code  = document.getElementById('premCode').value.trim().toUpperCase();
  const msgEl = document.getElementById('premCodeMsg');

  if (!code) { msgEl.textContent = '⚠️ Please enter your code.'; msgEl.style.color = '#dc2626'; return; }

  msgEl.textContent = '🔄 Verifying...';
  msgEl.style.color = '#6366f1';

  try {
    const res  = await fetch(`${PREM_SHEETS_URL}?action=verify&code=${encodeURIComponent(code)}`);
    const data = await res.json();

    if (data.valid) {
      const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
      localStorage.setItem('prem_active', '1');
      localStorage.setItem('prem_expiry', expiry.toString());
      localStorage.setItem('prem_code', code);
      localStorage.setItem('prem_name', data.name || '');
      msgEl.textContent = `✅ Premium Activated! Valid until ${data.expiry || '30 days'}.`;
      msgEl.style.color = '#16a34a';
      premShowActiveBadge();
      setTimeout(() => closePremium(), 2200);
    } else {
      msgEl.textContent = data.reason === 'expired'
        ? '❌ Code expired. Please renew your Premium.'
        : '❌ Invalid code. Please check and try again.';
      msgEl.style.color = '#dc2626';
    }
  } catch(e) {
    const stored = localStorage.getItem('prem_code');
    if (stored === code && Date.now() < parseInt(localStorage.getItem('prem_expiry') || '0')) {
      msgEl.textContent = '✅ Premium already active!';
      msgEl.style.color = '#16a34a';
      return;
    }
    msgEl.textContent = '⚠️ Cannot connect. Check internet & try again.';
    msgEl.style.color = '#d97706';
  }
}

// ── SHOW ACTIVE BADGE ─────────────────────────────────────────────
function premShowActiveBadge() {
  const footer = document.querySelector('.sidebar-footer');
  if (!footer) return;
  if (document.getElementById('premActiveBadge')) return;
  const badge = document.createElement('span');
  badge.id = 'premActiveBadge';
  badge.className = 'prem-active-badge';
  badge.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg> Premium`;
  footer.appendChild(badge);

  // Show dark mode toggle
  const toggle = document.getElementById('darkModeToggle');
  if (toggle) toggle.classList.add('visible');

  // Restore dark mode if was previously active
  if (localStorage.getItem('prem_dark') === '1') {
    document.body.classList.add('dark-premium');
    const lbl = document.getElementById('darkModeLabel');
    if (lbl) lbl.textContent = 'Light Mode';
  }
}

// ── TOGGLE PREMIUM DARK MODE ───────────────────────────────────────────
function togglePremDark() {
  const exp = localStorage.getItem('prem_expiry');
  if (!exp || Date.now() >= parseInt(exp)) {
    premToast('⚠️ Dark Mode is a Premium feature.');
    return;
  }
  const isDark = document.body.classList.toggle('dark-premium');
  localStorage.setItem('prem_dark', isDark ? '1' : '0');
  const lbl = document.getElementById('darkModeLabel');
  if (lbl) lbl.textContent = isDark ? 'Light Mode' : 'Dark Mode';
  const svg = document.querySelector('#darkModeToggle svg');
  if (svg) {
    svg.innerHTML = isDark
      ? '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>'
      : '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>';
  }
}

// ── CHECK PREMIUM ON LOAD ─────────────────────────────────────────
(function premCheckOnLoad() {
  const exp = localStorage.getItem('prem_expiry');
  if (exp && Date.now() < parseInt(exp)) {
    premShowActiveBadge();
  } else if (exp) {
    localStorage.removeItem('prem_active');
    localStorage.removeItem('prem_expiry');
    localStorage.removeItem('prem_code');
    localStorage.removeItem('prem_dark');
    document.body.classList.remove('dark-premium');
  }
})();

// ── TOAST ─────────────────────────────────────────────────────────
function premToast(msg) {
  let t = document.getElementById('premToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'premToast';
    t.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#1e1b4b;color:#fff;padding:10px 20px;border-radius:20px;font-size:0.85rem;font-weight:600;z-index:99999;opacity:0;transition:opacity 0.3s;pointer-events:none;white-space:nowrap';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  setTimeout(() => t.style.opacity = '0', 2500);
}

// Close on overlay click
document.getElementById('premiumOverlay').addEventListener('click', function(e) {
  if (e.target === this) closePremium();
});
