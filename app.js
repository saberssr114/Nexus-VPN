/* app.js — Main application logic */
'use strict';

/* ── WAIT FOR DOM + DATA ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initStatCounters();
  initGlobePanel();
  initCodesGrid();
  initFilterBar();
  initMarquee();
  initConnectButton();
  initPSCopy();
  initStepAnimations();
});

/* ── NAVBAR SCROLL ──────────────────────────────────────────────────── */
function initNavbar() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });
  /* Smooth scroll for nav links */
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ── STAT COUNTERS ──────────────────────────────────────────────────── */
function initStatCounters() {
  const nums = document.querySelectorAll('.stat-num[data-count]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      animateNumber(el, 0, target, 1800);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });
  nums.forEach(n => observer.observe(n));
}

function animateNumber(el, from, to, duration) {
  const start = performance.now();
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    el.textContent = Math.floor(from + (to - from) * eased).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ── GLOBE ↔ PANEL ──────────────────────────────────────────────────── */
function initGlobePanel() {
  const panel = document.getElementById('countryPanel');
  const panelClose = document.getElementById('panelClose');
  const btnConnectServer = document.getElementById('btnConnectServer');
  const btnCopyCode = document.getElementById('btnCopyCode');

  panelClose.addEventListener('click', closePanel);
  btnCopyCode.addEventListener('click', () => {
    const txt = document.getElementById('codeBlock').textContent;
    copyToClipboard(txt, 'Config copied!');
  });

  let serverConnecting = false;
  btnConnectServer.addEventListener('click', () => {
    if (serverConnecting) return;
    serverConnecting = true;
    btnConnectServer.textContent = '⚡ Connecting…';
    btnConnectServer.classList.add('connecting');
    setTimeout(() => {
      btnConnectServer.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Connected!';
      btnConnectServer.classList.remove('connecting');
      btnConnectServer.classList.add('connected');
      /* update badge */
      const dot = document.querySelector('.status-dot');
      const statusTxt = document.querySelector('.status-text');
      const country = document.getElementById('panelCountryName').textContent;
      dot.classList.add('connected');
      statusTxt.textContent = `${country}`;
      showToast('✅ VPN Connected to ' + country + '!');
      serverConnecting = false;
    }, 2400);
  });

  /* Global function called from globe.js */
  window.openCountryPanel = function (countryData) {
    /* Find matching VPN server data */
    const vpnEntry = (window.VPN_DATA || []).find(v =>
      v.country.toLowerCase() === countryData.name.toLowerCase()
    );

    /* Set flag + name + region */
    document.getElementById('panelFlag').textContent = countryData.flag;
    document.getElementById('panelCountryName').textContent = countryData.name;
    document.getElementById('panelRegion').textContent = countryData.region;

    if (vpnEntry) {
      fillPanel(vpnEntry);
    } else {
      /* Generate plausible data if not in DB */
      const fake = generateFakeServerData(countryData);
      fillPanel(fake);
    }

    panel.classList.add('open');

    /* Reset connect button */
    btnConnectServer.textContent = '';
    btnConnectServer.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6l-8-4z"/></svg> Connect to This Server';
    btnConnectServer.classList.remove('connecting', 'connected');
  };
}

function fillPanel(entry) {
  /* Speeds */
  document.getElementById('metricDownload').textContent = entry.download + ' Mbps';
  document.getElementById('metricUpload').textContent = entry.upload + ' Mbps';
  document.getElementById('metricPing').textContent = entry.ping + ' ms';

  const maxSpeed = 1000;
  document.getElementById('fillDownload').style.width = Math.min(entry.download / maxSpeed * 100, 100) + '%';
  document.getElementById('fillUpload').style.width = Math.min(entry.upload / maxSpeed * 100, 100) + '%';
  /* Ping: less is better, so invert */
  const pingPct = Math.max(0, 100 - entry.ping * 2);
  document.getElementById('fillPing').style.width = pingPct + '%';

  /* Connection info */
  document.getElementById('connUsers').textContent = (entry.users || 0).toLocaleString();
  document.getElementById('connLoad').textContent = (entry.load || 0) + '%';
  document.getElementById('connServers').textContent = entry.servers || '—';

  /* VPN code */
  const config = window.buildWindowsConfig ? window.buildWindowsConfig(entry) : '# Config not available';
  document.getElementById('codeBlock').textContent = config;
}

function closePanel() {
  document.getElementById('countryPanel').classList.remove('open');
}

function generateFakeServerData(country) {
  const dl = 100 + Math.floor(Math.random() * 500);
  const ul = Math.floor(dl * (0.5 + Math.random() * 0.4));
  const ping = 10 + Math.floor(Math.random() * 80);
  return {
    country: country.name, flag: country.flag, region: country.region,
    protocol: ['WireGuard','OpenVPN'][Math.floor(Math.random()*2)],
    server: country.name.toLowerCase().replace(/ /g,'-') + '-01.nexusvpn.io',
    port: [51820,1194,443][Math.floor(Math.random()*3)],
    download: dl, upload: ul, ping,
    users: 50 + Math.floor(Math.random() * 600),
    load: 20 + Math.floor(Math.random() * 60),
    servers: 4 + Math.floor(Math.random() * 20),
    username: 'vpn_user_' + rand6(),
    password: genPass(),
    psk: genPSK(),
    pubKey: genPSK(),
    privKey: genPSK(),
    ipRange: '10.20.0.0/24',
    dns: '1.1.1.1',
    windows: {
      server: country.name.toLowerCase().replace(/ /g,'-') + '-01.nexusvpn.io',
      type: ['IKEv2','L2TP/IPSec'][Math.floor(Math.random()*2)],
      username: 'nexus_' + rand6(),
      password: genPass(),
      psk: genPSK(),
    }
  };
}

/* ── CODES GRID ─────────────────────────────────────────────────────── */
function initCodesGrid() {
  renderCodesGrid(window.VPN_DATA || []);
}

function renderCodesGrid(data) {
  const grid = document.getElementById('codesGrid');
  if (!grid) return;
  grid.innerHTML = '';

  data.forEach(entry => {
    const card = document.createElement('div');
    card.className = 'code-card';
    card.setAttribute('data-tier', entry.tier || '');
    card.setAttribute('data-proto', entry.protocol.toLowerCase().replace('/','-'));

    const protoClass = {
      'WireGuard': 'proto-wg',
      'OpenVPN': 'proto-ovpn',
      'IKEv2': 'proto-ikev2',
      'L2TP/IPSec': 'proto-l2tp',
    }[entry.protocol] || 'proto-ovpn';

    const speedColor = entry.download >= 700 ? '#00ff88' : entry.download >= 400 ? '#00d4ff' : '#ffcc00';
    const loadColor = entry.load > 60 ? '#ff2f8e' : entry.load > 40 ? '#ffcc00' : '#00ff88';
    const pingColor = entry.ping <= 10 ? '#00ff88' : entry.ping <= 30 ? '#00d4ff' : '#ffcc00';

    card.innerHTML = `
      <div class="card-top">
        <div class="card-country">
          <span class="card-flag">${entry.flag}</span>
          <div>
            <div class="card-name">${entry.country}</div>
            <div style="font-size:.72rem;color:var(--text2)">${entry.city} · ${entry.region}</div>
          </div>
        </div>
        <span class="card-protocol ${protoClass}">${entry.protocol}</span>
      </div>

      <div class="card-speeds">
        <div class="speed-badge">
          <span class="sb-label">⬇ Download</span>
          <span class="sb-val" style="color:${speedColor}">${entry.download} Mbps</span>
        </div>
        <div class="speed-badge">
          <span class="sb-label">⬆ Upload</span>
          <span class="sb-val" style="color:var(--cyan)">${entry.upload} Mbps</span>
        </div>
        <div class="speed-badge">
          <span class="sb-label">📡 Ping</span>
          <span class="sb-val" style="color:${pingColor}">${entry.ping} ms</span>
        </div>
        <div class="speed-badge">
          <span class="sb-label">👥 Load</span>
          <span class="sb-val" style="color:${loadColor}">${entry.load}%</span>
        </div>
      </div>

      <div class="card-creds">
        <span class="cred-label">Server: </span><span>${entry.server}:${entry.port}</span><br/>
        <span class="cred-label">User:   </span><span>${entry.username}</span><br/>
        <span class="cred-label">Pass:   </span><span>${entry.password}</span><br/>
        <span class="cred-label">PSK:    </span><span style="word-break:break-all">${entry.psk.substring(0,22)}…</span>
      </div>

      <div class="card-actions">
        <button class="btn-card-copy" data-id="${entry.id}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Copy Config
        </button>
        <button class="btn-card-connect" data-id="${entry.id}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6l-8-4z"/></svg>
          Connect
        </button>
      </div>
    `;

    /* Events */
    card.querySelector('.btn-card-copy').addEventListener('click', () => {
      const cfg = window.buildWindowsConfig(entry);
      copyToClipboard(cfg, `📋 Config for ${entry.country} copied!`);
    });

    card.querySelector('.btn-card-connect').addEventListener('click', function() {
      const btn = this;
      btn.textContent = '⚡ Connecting…';
      btn.disabled = true;
      setTimeout(() => {
        btn.innerHTML = '✅ Connected!';
        btn.style.background = 'linear-gradient(135deg, #00ff88, #00cc66)';
        /* update nav badge */
        document.querySelector('.status-dot').classList.add('connected');
        document.querySelector('.status-text').textContent = entry.country;
        showToast('✅ Connected to ' + entry.country + ' · ' + entry.download + ' Mbps');
        setTimeout(() => {
          btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6l-8-4z"/></svg> Connect';
          btn.style.background = '';
          btn.disabled = false;
        }, 4000);
      }, 2000);
    });

    grid.appendChild(card);
  });
}

/* ── FILTER BAR ─────────────────────────────────────────────────────── */
function initFilterBar() {
  const search = document.getElementById('searchInput');
  const pills = document.querySelectorAll('.pill');

  let activeFilter = 'all';
  let searchQuery = '';

  function applyFilters() {
    const filtered = (window.VPN_DATA || []).filter(entry => {
      const matchSearch = !searchQuery ||
        entry.country.toLowerCase().includes(searchQuery) ||
        entry.protocol.toLowerCase().includes(searchQuery) ||
        entry.region.toLowerCase().includes(searchQuery) ||
        entry.city.toLowerCase().includes(searchQuery);

      const tier = (entry.tier || '').toLowerCase();
      const proto = entry.protocol.toLowerCase();
      const matchFilter =
        activeFilter === 'all' ||
        (activeFilter === 'fast' && entry.download >= 500) ||
        (activeFilter === 'free' && tier.includes('free')) ||
        (activeFilter === 'wireguard' && proto.includes('wireguard')) ||
        (activeFilter === 'openvpn' && proto.includes('openvpn'));

      return matchSearch && matchFilter;
    });
    renderCodesGrid(filtered);
  }

  search.addEventListener('input', () => {
    searchQuery = search.value.toLowerCase().trim();
    applyFilters();
  });

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeFilter = pill.dataset.filter;
      applyFilters();
    });
  });

  /* Explore button scrolls to codes */
  document.getElementById('btnExploreGlobe')?.addEventListener('click', () => {
    document.getElementById('codes')?.scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('btnGetCodes')?.addEventListener('click', () => {
    document.getElementById('codes')?.scrollIntoView({ behavior: 'smooth' });
  });
}

/* ── MARQUEE ─────────────────────────────────────────────────────────── */
function initMarquee() {
  const marquee = document.getElementById('statsMarquee');
  if (!marquee) return;

  const items = (window.VPN_DATA || []).map(v =>
    `<div class="marquee-item">
      <span class="m-flag">${v.flag}</span>
      <span class="m-name">${v.country}</span>
      <span class="m-speed">${v.download} Mbps</span>
    </div>`
  );

  /* Duplicate for seamless loop */
  const doubled = [...items, ...items];
  marquee.innerHTML = doubled.join('');
}

/* ── HEADER CONNECT BUTTON ──────────────────────────────────────────── */
function initConnectButton() {
  const btn = document.getElementById('btnConnect');
  btn?.addEventListener('click', () => {
    document.getElementById('codes')?.scrollIntoView({ behavior: 'smooth' });
  });
}

/* ── POWERSHELL COPY ─────────────────────────────────────────────────── */
function initPSCopy() {
  document.getElementById('btnCopyPS')?.addEventListener('click', () => {
    const txt = document.getElementById('psCode')?.textContent || '';
    copyToClipboard(txt, '📋 PowerShell script copied!');
  });
}

/* ── STEP ANIMATIONS (Intersection Observer) ─────────────────────────── */
function initStepAnimations() {
  const steps = document.querySelectorAll('.step-card');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.animationPlayState = 'running';
      }
    });
  }, { threshold: 0.2 });
  steps.forEach(s => {
    s.style.animationPlayState = 'paused';
    obs.observe(s);
  });
}

/* ── UTILITIES ───────────────────────────────────────────────────────── */
function copyToClipboard(text, message = 'Copied!') {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => showToast(message));
  } else {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast(message);
  }
}

let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  toastMsg.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ── LOCAL GENERATORS (need same impl as data.js) ────────────────────── */
function rand6() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
function genPass() {
  const c = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$';
  let p = '';
  for (let i = 0; i < 16; i++) p += c[Math.floor(Math.random() * c.length)];
  return p;
}
function genPSK() {
  const c = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/';
  let k = '';
  for (let i = 0; i < 44; i++) k += c[Math.floor(Math.random() * c.length)];
  return k + '=';
}
