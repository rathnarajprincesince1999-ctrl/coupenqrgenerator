(function () {
  const LINKS = [
    {
      id: 'wa-channel',
      label: 'WhatsApp Channel',
      url: 'https://whatsapp.com/channel/0029VbCUoKKKQuJAzDFVfX29',
      color: '#25d366',
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`,
      badge: 'Channel'
    },
    {
      id: 'instagram',
      label: 'Instagram',
      url: 'https://www.instagram.com/rathnaproducts?igsh=MWpqZXRuZHdjOGp6cA==',
      color: '#e1306c',
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
      badge: 'Follow'
    },
    {
      id: 'telegram',
      label: 'Telegram Channel',
      url: 'https://t.me/+fbSdTF3VJ9s2MzE1',
      color: '#229ed9',
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>`,
      badge: 'Join'
    },
    {
      id: 'wa-group',
      label: 'WhatsApp Group',
      url: 'https://chat.whatsapp.com/IQK74w3mJI16uutaXzIK88',
      color: '#128c7e',
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`,
      badge: 'Group'
    }
  ];

  function qrDataUrl(text, size) {
    // Use Google Charts QR API (works offline-free, no JS lib needed)
    return 'https://api.qrserver.com/v1/create-qr-code/?size=' + size + 'x' + size + '&data=' + encodeURIComponent(text) + '&margin=6';
  }

  function injectStyles() {
    if (document.getElementById('rp-follow-style')) return;
    const s = document.createElement('style');
    s.id = 'rp-follow-style';
    s.textContent = `
      #rp-follow-btn {
        position: fixed;
        bottom: 22px;
        right: 22px;
        z-index: 99990;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: linear-gradient(135deg,#25d366,#128c7e);
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 18px rgba(37,211,102,0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform .2s, box-shadow .2s;
        padding: 0;
      }
      #rp-follow-btn:hover { transform: scale(1.12); box-shadow: 0 6px 24px rgba(37,211,102,0.6); }
      #rp-follow-btn svg { width: 26px; height: 26px; color: #fff; fill: #fff; }

      #rp-follow-panel {
        position: fixed;
        bottom: 82px;
        right: 18px;
        z-index: 99989;
        width: 300px;
        background: #fff;
        border-radius: 18px;
        box-shadow: 0 8px 40px rgba(0,0,0,0.18);
        overflow: hidden;
        transform: scale(0.85) translateY(20px);
        transform-origin: bottom right;
        opacity: 0;
        pointer-events: none;
        transition: transform .25s cubic-bezier(.34,1.56,.64,1), opacity .2s;
      }
      #rp-follow-panel.rp-open {
        transform: scale(1) translateY(0);
        opacity: 1;
        pointer-events: auto;
      }
      .rp-panel-head {
        background: linear-gradient(135deg,#25d366,#128c7e);
        color: #fff;
        padding: 14px 16px 10px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .rp-panel-head svg { width: 22px; height: 22px; fill: #fff; flex-shrink: 0; }
      .rp-panel-head-text { flex: 1; }
      .rp-panel-head-text strong { display: block; font-size: .95rem; font-weight: 800; letter-spacing: .2px; }
      .rp-panel-head-text span { font-size: .72rem; opacity: .85; }
      .rp-panel-close {
        background: rgba(255,255,255,.2);
        border: none;
        border-radius: 50%;
        width: 26px; height: 26px;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        color: #fff;
        flex-shrink: 0;
      }
      .rp-panel-close svg { width: 14px; height: 14px; stroke: #fff; fill: none; }
      .rp-social-list { padding: 10px 12px 12px; display: flex; flex-direction: column; gap: 8px; }
      .rp-social-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 9px 12px;
        border-radius: 12px;
        text-decoration: none;
        color: #111;
        background: #f7f7f7;
        transition: background .15s, transform .15s;
        cursor: pointer;
        border: none;
        width: 100%;
        text-align: left;
      }
      .rp-social-item:hover { background: #eee; transform: translateX(3px); }
      .rp-social-icon {
        width: 36px; height: 36px;
        border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }
      .rp-social-icon svg { width: 20px; height: 20px; fill: #fff; }
      .rp-social-info { flex: 1; }
      .rp-social-info strong { display: block; font-size: .82rem; font-weight: 700; color: #111; }
      .rp-social-info span { font-size: .7rem; color: #666; }
      .rp-social-badge {
        font-size: .65rem;
        font-weight: 800;
        padding: 2px 7px;
        border-radius: 20px;
        color: #fff;
        letter-spacing: .3px;
      }
      .rp-qr-btn {
        background: none;
        border: 1.5px solid #ddd;
        border-radius: 8px;
        padding: 3px 7px;
        font-size: .65rem;
        font-weight: 700;
        cursor: pointer;
        color: #555;
        transition: border-color .15s, color .15s;
        flex-shrink: 0;
      }
      .rp-qr-btn:hover { border-color: #888; color: #111; }

      /* QR overlay */
      #rp-qr-overlay {
        position: fixed;
        inset: 0;
        z-index: 99995;
        background: rgba(0,0,0,.55);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity .2s;
      }
      #rp-qr-overlay.rp-open { opacity: 1; pointer-events: auto; }
      .rp-qr-box {
        background: #fff;
        border-radius: 20px;
        padding: 24px 20px 20px;
        text-align: center;
        box-shadow: 0 12px 48px rgba(0,0,0,.25);
        max-width: 260px;
        width: 90%;
        position: relative;
      }
      .rp-qr-box img { width: 180px; height: 180px; border-radius: 10px; display: block; margin: 0 auto 12px; }
      .rp-qr-box strong { display: block; font-size: .9rem; font-weight: 800; margin-bottom: 4px; }
      .rp-qr-box a {
        display: inline-block;
        margin-top: 10px;
        padding: 8px 20px;
        border-radius: 20px;
        color: #fff;
        font-size: .8rem;
        font-weight: 700;
        text-decoration: none;
      }
      .rp-qr-close {
        position: absolute;
        top: 10px; right: 12px;
        background: #f0f0f0;
        border: none;
        border-radius: 50%;
        width: 28px; height: 28px;
        cursor: pointer;
        font-size: 1rem;
        display: flex; align-items: center; justify-content: center;
        color: #555;
      }
      /* ── Mobile responsive ── */
      @media (max-width: 480px) {
        #rp-follow-btn {
          bottom: 72px;
          right: 14px;
          width: 44px;
          height: 44px;
        }
        #rp-follow-btn svg { width: 22px; height: 22px; }
        #rp-follow-panel {
          bottom: 0;
          right: 0;
          left: 0;
          width: 100%;
          max-height: 88vh;
          border-radius: 20px 20px 0 0;
          transform-origin: bottom center;
          transform: translateY(100%);
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
        #rp-follow-panel.rp-open {
          transform: translateY(0);
        }
        .rp-panel-head { padding: 16px 16px 12px; }
        .rp-panel-head-text strong { font-size: 1rem; }
        .rp-social-list { padding: 10px 12px 24px; gap: 10px; }
        .rp-social-item { padding: 11px 12px; }
        .rp-social-icon { width: 40px; height: 40px; border-radius: 12px; }
        .rp-social-icon svg { width: 22px; height: 22px; }
        .rp-social-info strong { font-size: .88rem; }
        .rp-social-info span { font-size: .74rem; }
        .rp-social-badge { font-size: .7rem; padding: 3px 9px; }
        .rp-qr-btn { padding: 5px 10px; font-size: .7rem; }
        .rp-qr-box { max-width: 92vw; padding: 20px 16px 18px; }
        .rp-qr-box img { width: 160px; height: 160px; }
      }
      /* bottom-nav safe area for phones with home indicator */
      @supports (padding-bottom: env(safe-area-inset-bottom)) {
        @media (max-width: 480px) {
          #rp-follow-btn { bottom: calc(72px + env(safe-area-inset-bottom)); }
          .rp-social-list { padding-bottom: calc(24px + env(safe-area-inset-bottom)); }
        }
      }
    `;
    document.head.appendChild(s);
  }

  function buildWidget() {
    injectStyles();

    // Floating button
    const btn = document.createElement('button');
    btn.id = 'rp-follow-btn';
    btn.title = 'Follow RATHNA Products';
    btn.setAttribute('aria-label', 'Follow RATHNA Products');
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;

    // Panel
    const panel = document.createElement('div');
    panel.id = 'rp-follow-panel';
    panel.innerHTML = `
      <div class="rp-panel-head">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        <div class="rp-panel-head-text">
          <strong>Follow RATHNA Products</strong>
          <span>Stay connected on all platforms</span>
        </div>
        <button class="rp-panel-close" id="rp-panel-close-btn" aria-label="Close">
          <svg viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="rp-social-list">
        ${LINKS.map(l => `
          <div style="display:flex;align-items:center;gap:8px;">
            <a href="${l.url}" target="_blank" rel="noopener noreferrer" class="rp-social-item" style="flex:1">
              <div class="rp-social-icon" style="background:${l.color}">${l.svg}</div>
              <div class="rp-social-info">
                <strong>${l.label}</strong>
                <span>Tap to open</span>
              </div>
              <span class="rp-social-badge" style="background:${l.color}">${l.badge}</span>
            </a>
            <button class="rp-qr-btn" data-url="${l.url}" data-label="${l.label}" data-color="${l.color}" title="Show QR Code">QR</button>
          </div>
        `).join('')}
      </div>
    `;

    // QR overlay
    const qrOverlay = document.createElement('div');
    qrOverlay.id = 'rp-qr-overlay';
    qrOverlay.innerHTML = `<div class="rp-qr-box" id="rp-qr-box"></div>`;

    // Mobile backdrop (closes panel when tapping outside on mobile)
    const backdrop = document.createElement('div');
    backdrop.id = 'rp-follow-backdrop';
    backdrop.style.cssText = 'display:none;position:fixed;inset:0;z-index:99988;background:rgba(0,0,0,.35);';

    document.body.appendChild(backdrop);
    document.body.appendChild(btn);
    document.body.appendChild(panel);
    document.body.appendChild(qrOverlay);

    function isMobile() { return window.innerWidth <= 480; }

    function openPanel() {
      panel.classList.add('rp-open');
      if (isMobile()) backdrop.style.display = 'block';
      startAutoClose();
    }

    function closePanel() {
      panel.classList.remove('rp-open');
      backdrop.style.display = 'none';
      cancelAutoClose();
    }

    var autoCloseTimer = null;

    function startAutoClose() {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = setTimeout(function () {
        panel.classList.remove('rp-open');
      }, 3000);
    }

    function cancelAutoClose() {
      clearTimeout(autoCloseTimer);
    }

    // Toggle panel
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (panel.classList.contains('rp-open')) closePanel();
      else openPanel();
    });

    // Reset timer while hovering / touching the panel
    panel.addEventListener('mouseenter', cancelAutoClose);
    panel.addEventListener('mouseleave', function () {
      if (panel.classList.contains('rp-open')) startAutoClose();
    });
    // On mobile: each touch inside panel resets the 3s timer
    panel.addEventListener('touchstart', function () {
      cancelAutoClose();
      startAutoClose();
    }, { passive: true });

    document.getElementById('rp-panel-close-btn').addEventListener('click', function () {
      closePanel();
    });
    backdrop.addEventListener('click', function () {
      closePanel();
    });
    document.addEventListener('click', function (e) {
      if (!panel.contains(e.target) && e.target !== btn && e.target !== backdrop) {
        closePanel();
      }
    });

    // QR buttons
    panel.querySelectorAll('.rp-qr-btn').forEach(function (qBtn) {
      qBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var url = qBtn.dataset.url;
        var label = qBtn.dataset.label;
        var color = qBtn.dataset.color;
        var box = document.getElementById('rp-qr-box');
        box.innerHTML = `
          <button class="rp-qr-close" id="rp-qr-close">✕</button>
          <strong>${label}</strong>
          <img src="${qrDataUrl(url, 180)}" alt="QR Code for ${label}" loading="lazy"/>
          <p style="font-size:.7rem;color:#888;margin:0 0 4px">Scan to open on your phone</p>
          <a href="${url}" target="_blank" rel="noopener noreferrer" style="background:${color}">${label}</a>
        `;
        qrOverlay.classList.add('rp-open');
        document.getElementById('rp-qr-close').addEventListener('click', function () {
          qrOverlay.classList.remove('rp-open');
        });
      });
    });
    qrOverlay.addEventListener('click', function (e) {
      if (e.target === qrOverlay) qrOverlay.classList.remove('rp-open');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildWidget);
  } else {
    buildWidget();
  }
})();
