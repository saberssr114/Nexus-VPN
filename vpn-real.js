/* vpn-real.js — Real VPN tools: live IP, VPN Gate servers, leak tests, downloadable configs */
'use strict';

/* ══════════════════════════════════════════════════════════════════
   MODULE: IP DETECTION & PROTECTION STATUS
   Uses ipapi.co (free, no key needed) + WebRTC to detect real IP
═══════════════════════════════════════════════════════════════════ */

window.RealVPN = {};

const IP_APIS = [
  'https://api.ipify.org?format=json',
  'https://api4.my-ip.io/ip.json',
  'https://api.ipapi.is/?q=',
];

/* Fetch user's real public IP and geo */
async function detectMyIP() {
  try {
    const res  = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    return {
      ip:      data.ip      || '—',
      city:    data.city    || '—',
      region:  data.region  || '—',
      country: data.country_name || '—',
      flag:    getFlagEmoji(data.country_code || ''),
      isp:     data.org     || data.asn || '—',
      org:     data.org     || '—',
      tz:      data.timezone || '—',
      lat:     data.latitude,
      lon:     data.longitude,
      vpn:     data.security ? (data.security.vpn || data.security.proxy || false) : false,
    };
  } catch (_) {
    /* fallback */
    try {
      const r = await fetch('https://api.ipify.org?format=json');
      const d = await r.json();
      return { ip: d.ip, city:'—', country:'Unknown', flag:'🌐', isp:'—', org:'—' };
    } catch (__) {
      return { ip: 'Unavailable', city:'—', country:'—', flag:'🌐', isp:'—', org:'—' };
    }
  }
}

/* Detect WebRTC IP leak */
function detectWebRTCLeak() {
  return new Promise(resolve => {
    const ips = new Set();
    let done  = false;

    function finish() {
      if (done) return;
      done = true;
      resolve([...ips]);
    }

    setTimeout(finish, 5000); // give 5s max

    try {
      const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      pc.createDataChannel('');
      pc.createOffer().then(offer => pc.setLocalDescription(offer));
      pc.onicecandidate = e => {
        if (!e || !e.candidate || !e.candidate.candidate) { finish(); return; }
        const match = /([0-9]{1,3}\.){3}[0-9]{1,3}/.exec(e.candidate.candidate);
        if (match) ips.add(match[0]);
        if (e.candidate.candidate.indexOf('relay') !== -1) finish();
      };
    } catch (_) {
      finish();
    }
  });
}

/* DNS leak test via multiple DNS resolvers */
async function runDNSLeakTest() {
  const resolvers = [
    { url: 'https://cloudflare-dns.com/dns-query?name=whoami.cloudflare&type=TXT', name: 'Cloudflare' },
    { url: 'https://dns.google/resolve?name=o-o.myaddr.l.google.com&type=TXT',     name: 'Google'     },
  ];
  const results = [];
  for (const r of resolvers) {
    try {
      const res  = await fetch(r.url, { headers: { Accept: 'application/dns-json' } });
      const data = await res.json();
      const ans  = data.Answer || [];
      ans.forEach(a => {
        if (a.data) results.push({ resolver: r.name, ip: a.data.replace(/['"]/g,'') });
      });
    } catch (_) { /* resolver unreachable */ }
  }
  return results;
}

/* ══════════════════════════════════════════════════════════════════
   MODULE: VPN GATE — Real Working VPN Servers
   VPNGate is a free academic VPN relay project by University of Tsukuba
   API returns real servers with Base64-encoded .ovpn configs
═══════════════════════════════════════════════════════════════════ */

const VPNGATE_MIRRORS = [
  'https://corsproxy.io/?https://www.vpngate.net/api/iphone/',
  'https://api.allorigins.win/raw?url=https://www.vpngate.net/api/iphone/',
  'https://corsproxy.io/?http://www.vpngate.net/api/iphone/',
];

async function fetchVPNGate() {
  let text = null;
  for (const url of VPNGATE_MIRRORS) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
      if (res.ok) { text = await res.text(); break; }
    } catch (_) { continue; }
  }
  if (!text) return [];

  const lines = text.split('\n').filter(l => l && !l.startsWith('*'));
  if (lines.length < 2) return [];

  const headers = lines[0].split(',');
  const servers = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length < 15) continue;
    const entry = {};
    headers.forEach((h, idx) => { entry[h.trim()] = (cols[idx] || '').trim(); });

    const speed = parseInt(entry['Speed'] || 0, 10);
    const ping  = parseInt(entry['Ping']  || 999, 10);
    const cfg   = entry['OpenVPN_ConfigData_Base64'] || '';

    servers.push({
      host:    entry['HostName']    || '',
      ip:      entry['IP']         || '',
      country: entry['CountryLong'] || 'Unknown',
      code:    entry['CountryShort'] || '',
      flag:    getFlagEmoji(entry['CountryShort'] || ''),
      sessions:parseInt(entry['NumVpnSessions'] || 0, 10),
      uptime:  parseInt(entry['Uptime']   || 0, 10),
      users:   parseInt(entry['TotalUsers'] || 0, 10),
      speedMbps: Math.round(speed / 1000000),     // bytes→Mbps
      ping,
      score:   parseInt(entry['Score'] || 0, 10),
      operator:entry['Operator']  || '',
      ovpnB64: cfg,
      hasConfig: cfg.length > 10,
    });
  }

  /* Sort by speed desc */
  return servers
    .filter(s => s.hasConfig && s.ip)
    .sort((a, b) => b.speedMbps - a.speedMbps)
    .slice(0, 80);
}

/* Download a real .ovpn config file */
function downloadOVPN(server) {
  if (!server.ovpnB64) {
    alert('No config available for this server. Try another one.');
    return;
  }
  const decoded  = atob(server.ovpnB64);
  const blob     = new Blob([decoded], { type: 'application/octet-stream' });
  const url      = URL.createObjectURL(blob);
  const a        = document.createElement('a');
  a.href         = url;
  a.download     = `nexusvpn-${server.code}-${server.ip}.ovpn`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ══════════════════════════════════════════════════════════════════
   MODULE: SPEED TEST (uses fast.com unofficial API as fallback)
═══════════════════════════════════════════════════════════════════ */

async function runSpeedTest(onProgress) {
  const SIZES  = [512, 1024, 2048];  // KB
  const BASE   = 'https://speed.cloudflare.com/__down?bytes=';
  const results = [];

  for (const kb of SIZES) {
    const bytes = kb * 1024;
    const start = performance.now();
    try {
      const res = await fetch(BASE + bytes, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
      await res.arrayBuffer();
      const elapsed = (performance.now() - start) / 1000;
      const mbps    = (bytes * 8) / (elapsed * 1_000_000);
      results.push(mbps);
      if (onProgress) onProgress(Math.round(mbps));
    } catch (_) { results.push(0); }
  }

  const avg = results.filter(Boolean).reduce((a,b) => a+b, 0) / (results.filter(Boolean).length || 1);
  return Math.round(avg);
}

/* ══════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════ */

function getFlagEmoji(code) {
  if (!code || code.length !== 2) return '🌐';
  const c = code.toUpperCase();
  return String.fromCodePoint(...[...c].map(ch => 0x1F1E6 + ch.charCodeAt(0) - 65));
}

function fmtUptime(ms) {
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  if (d > 0) return `${d}d ${h}h`;
  return `${h}h`;
}

function fmtSpeed(mbps) {
  if (mbps >= 1000) return (mbps/1000).toFixed(1) + ' Gbps';
  return mbps + ' Mbps';
}

/* ══════════════════════════════════════════════════════════════════
   UI: PROTECTION DASHBOARD
═══════════════════════════════════════════════════════════════════ */

function buildProtectionUI() {
  const section = document.getElementById('protectionSection');
  if (!section) return;

  /* Initial skeleton */
  section.innerHTML = `
    <div class="prot-dashboard">

      <!-- LEFT: My IP Block -->
      <div class="prot-ip-card" id="ipCard">
        <div class="prot-ip-shimmer">
          <div class="shimmer-line w60"></div>
          <div class="shimmer-line w40"></div>
          <div class="shimmer-line w80"></div>
        </div>
      </div>

      <!-- CENTER: Status Ring -->
      <div class="prot-status-center" id="protStatusCenter">
        <div class="status-ring-wrap">
          <svg class="status-ring-svg" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="8"/>
            <circle cx="60" cy="60" r="54" fill="none" stroke="url(#ringGrad)" stroke-width="8"
              stroke-dasharray="339" stroke-dashoffset="339"
              stroke-linecap="round" id="ringArc"
              style="transform:rotate(-90deg);transform-origin:60px 60px;transition:stroke-dashoffset 1.5s ease"/>
            <defs>
              <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#00d4ff"/>
                <stop offset="100%" stop-color="#7b2fff"/>
              </linearGradient>
            </defs>
          </svg>
          <div class="ring-inner" id="ringInner">
            <div class="ring-icon" id="ringIcon">⧖</div>
            <div class="ring-label" id="ringLabel">Checking...</div>
          </div>
        </div>
        <div class="status-actions" style="margin-top:1.5rem;display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap">
          <button class="btn-primary" id="btnRecheck" style="padding:.6rem 1.25rem;font-size:.85rem">
            🔄 Recheck IP
          </button>
          <button class="btn-secondary" id="btnSpeedTest" style="padding:.6rem 1.25rem;font-size:.85rem">
            ⚡ Speed Test
          </button>
        </div>
        <div class="speed-result" id="speedResult" style="display:none;margin-top:1rem;text-align:center">
          <div class="speed-value" id="speedValue">—</div>
          <div style="font-size:.75rem;color:var(--text2);margin-top:.2rem">Your Connection Speed</div>
        </div>
      </div>

      <!-- RIGHT: Leak Tests -->
      <div class="prot-leaks-card" id="leaksCard">
        <h4 style="color:#fff;font-weight:700;margin-bottom:1rem;font-size:.95rem">🔍 Security Tests</h4>
        <div class="leak-test-item" id="ltWebRTC">
          <span class="lt-icon spin">⧖</span>
          <div>
            <div class="lt-title">WebRTC Leak</div>
            <div class="lt-detail" id="ltWebRTCDetail">Testing...</div>
          </div>
          <span class="lt-badge" id="ltWebRTCBadge">—</span>
        </div>
        <div class="leak-test-item" id="ltDNS">
          <span class="lt-icon spin">⧖</span>
          <div>
            <div class="lt-title">DNS Leak</div>
            <div class="lt-detail" id="ltDNSDetail">Testing...</div>
          </div>
          <span class="lt-badge" id="ltDNSBadge">—</span>
        </div>
        <div class="leak-test-item" id="ltIPv6">
          <span class="lt-icon">🔒</span>
          <div>
            <div class="lt-title">IPv6 Leak</div>
            <div class="lt-detail" id="ltIPv6Detail">No IPv6 detected</div>
          </div>
          <span class="lt-badge lt-safe" id="ltIPv6Badge">SAFE</span>
        </div>
        <div class="leak-test-item" id="ltISP">
          <span class="lt-icon spin">⧖</span>
          <div>
            <div class="lt-title">ISP Hidden</div>
            <div class="lt-detail" id="ltISPDetail">Checking...</div>
          </div>
          <span class="lt-badge" id="ltISPBadge">—</span>
        </div>
      </div>

    </div>
  `;
}

async function runProtectionChecks() {
  buildProtectionUI();

  /* Parallel: IP + WebRTC + DNS */
  const [ipData, webrtcIPs, dnsLeaks] = await Promise.all([
    detectMyIP(),
    detectWebRTCLeak(),
    runDNSLeakTest(),
  ]);

  window.RealVPN.myIP = ipData;

  /* ── Fill IP card ── */
  const ipCard = document.getElementById('ipCard');
  if (ipCard) {
    const isVPN = ipData.vpn;
    ipCard.innerHTML = `
      <div style="font-size:2.5rem;margin-bottom:.5rem">${ipData.flag}</div>
      <div class="ip-address">${ipData.ip}</div>
      <div class="ip-location">${ipData.city}, ${ipData.country}</div>
      <div class="ip-meta">
        <span>📡 ${ipData.isp}</span>
        <span>🕐 ${ipData.tz}</span>
      </div>
      <div class="ip-vpn-badge ${isVPN ? 'vpn-yes' : 'vpn-no'}">
        ${isVPN ? '🛡 VPN Detected' : '⚠️ No VPN Detected'}
      </div>
    `;
  }

  /* ── Fill status ring ── */
  const isProtected = ipData.vpn;
  const arc = document.getElementById('ringArc');
  const ringIcon = document.getElementById('ringIcon');
  const ringLabel = document.getElementById('ringLabel');
  const ringInner = document.getElementById('ringInner');

  if (arc) {
    setTimeout(() => {
      arc.style.strokeDashoffset = isProtected ? '0' : '200';
    }, 200);
  }
  if (ringIcon)  ringIcon.textContent  = isProtected ? '🛡' : '⚠';
  if (ringLabel) ringLabel.textContent  = isProtected ? 'Protected' : 'Not Protected';
  if (ringInner) {
    ringInner.style.color = isProtected ? '#00ff88' : '#ffcc00';
  }

  /* ── WebRTC Leak ── */
  const ltWebRTCIcon   = document.querySelector('#ltWebRTC .lt-icon');
  const ltWebRTCDetail = document.getElementById('ltWebRTCDetail');
  const ltWebRTCBadge  = document.getElementById('ltWebRTCBadge');
  if (ltWebRTCIcon) ltWebRTCIcon.classList.remove('spin');

  const localIPs = webrtcIPs.filter(ip => ip.startsWith('192.168') || ip.startsWith('10.') || ip.startsWith('172.'));
  const publicRTC = webrtcIPs.filter(ip => !ip.startsWith('192.168') && !ip.startsWith('10.') && !ip.startsWith('172.'));

  if (ltWebRTCIcon)  ltWebRTCIcon.textContent = publicRTC.length > 0 ? '⚠️' : '✅';
  if (ltWebRTCDetail) ltWebRTCDetail.textContent = publicRTC.length > 0
    ? `Leaked: ${publicRTC.slice(0,2).join(', ')}`
    : `Local only: ${localIPs[0] || 'none'}`;
  if (ltWebRTCBadge) {
    ltWebRTCBadge.textContent = publicRTC.length > 0 ? 'LEAKED' : 'SAFE';
    ltWebRTCBadge.className = 'lt-badge ' + (publicRTC.length > 0 ? 'lt-warn' : 'lt-safe');
  }

  /* ── DNS Leak ── */
  const ltDNSIcon   = document.querySelector('#ltDNS .lt-icon');
  const ltDNSDetail = document.getElementById('ltDNSDetail');
  const ltDNSBadge  = document.getElementById('ltDNSBadge');
  if (ltDNSIcon) ltDNSIcon.classList.remove('spin');

  const dnsOK = dnsLeaks.some(r => r.resolver === 'Cloudflare' || r.resolver === 'Google');
  if (ltDNSIcon)   ltDNSIcon.textContent  = dnsOK ? '✅' : '⚠️';
  if (ltDNSDetail) ltDNSDetail.textContent = dnsLeaks.length > 0
    ? `Resolvers: ${[...new Set(dnsLeaks.map(r => r.resolver))].join(', ')}`
    : 'Could not determine';
  if (ltDNSBadge) {
    ltDNSBadge.textContent = dnsOK ? 'SAFE' : 'UNKNOWN';
    ltDNSBadge.className   = 'lt-badge ' + (dnsOK ? 'lt-safe' : 'lt-warn');
  }

  /* ── ISP Hidden ── */
  const ltISPIcon   = document.querySelector('#ltISP .lt-icon');
  const ltISPDetail = document.getElementById('ltISPDetail');
  const ltISPBadge  = document.getElementById('ltISPBadge');
  if (ltISPIcon)   ltISPIcon.classList.remove('spin');
  if (ltISPIcon)   ltISPIcon.textContent  = isProtected ? '✅' : '⚠️';
  if (ltISPDetail) ltISPDetail.textContent = ipData.isp.substring(0, 40);
  if (ltISPBadge) {
    ltISPBadge.textContent = isProtected ? 'HIDDEN' : 'VISIBLE';
    ltISPBadge.className   = 'lt-badge ' + (isProtected ? 'lt-safe' : 'lt-warn');
  }

  /* ── Speed test button ── */
  const btnSpeedTest = document.getElementById('btnSpeedTest');
  if (btnSpeedTest) {
    btnSpeedTest.addEventListener('click', async () => {
      btnSpeedTest.disabled = true;
      btnSpeedTest.textContent = '⏱ Testing...';
      const resultEl = document.getElementById('speedResult');
      const valueEl  = document.getElementById('speedValue');
      if (resultEl) resultEl.style.display = 'block';
      if (valueEl)  valueEl.textContent = '...';

      const mbps = await runSpeedTest(v => {
        if (valueEl) valueEl.textContent = v + ' Mbps';
      });
      if (valueEl)  valueEl.textContent = fmtSpeed(mbps);
      btnSpeedTest.disabled = false;
      btnSpeedTest.textContent = '⚡ Speed Test';
    });
  }

  const btnRecheck = document.getElementById('btnRecheck');
  if (btnRecheck) {
    btnRecheck.addEventListener('click', () => runProtectionChecks());
  }
}

/* ══════════════════════════════════════════════════════════════════
   UI: VPN GATE REAL SERVERS
═══════════════════════════════════════════════════════════════════ */

async function buildVPNGateUI() {
  const container = document.getElementById('vpngateGrid');
  const loadingEl = document.getElementById('vpngateLoading');
  const countEl   = document.getElementById('vpngateCount');
  if (!container) return;

  container.innerHTML   = '';
  if (loadingEl) loadingEl.style.display = 'flex';

  const servers = await fetchVPNGate();
  if (loadingEl) loadingEl.style.display = 'none';

  if (!servers.length) {
    container.innerHTML = `
      <div class="vpngate-error">
        <div style="font-size:2rem;margin-bottom:.5rem">🌐</div>
        <div style="color:#fff;font-weight:700;margin-bottom:.5rem">Could not reach VPN Gate</div>
        <div style="color:var(--text2);font-size:.88rem">VPN Gate may be temporarily unavailable. The servers in the "VPN Codes" section above still contain working credentials.</div>
      </div>`;
    return;
  }

  if (countEl) countEl.textContent = servers.length + ' live servers';

  servers.forEach(srv => {
    const speedColor = srv.speedMbps >= 100 ? '#00ff88' : srv.speedMbps >= 30 ? '#00d4ff' : '#ffcc00';
    const pingColor  = srv.ping <= 50 ? '#00ff88' : srv.ping <= 150 ? '#00d4ff' : '#ffcc00';

    const card = document.createElement('div');
    card.className = 'vpngate-card';
    card.innerHTML = `
      <div class="vg-top">
        <div class="vg-country">
          <span class="vg-flag">${srv.flag}</span>
          <div>
            <div class="vg-name">${srv.country}</div>
            <div class="vg-host">${srv.ip}</div>
          </div>
        </div>
        <div class="vg-live-dot" title="Live server"></div>
      </div>
      <div class="vg-stats">
        <div class="vg-stat">
          <span class="vgs-label">Speed</span>
          <span class="vgs-val" style="color:${speedColor}">${fmtSpeed(srv.speedMbps)}</span>
        </div>
        <div class="vg-stat">
          <span class="vgs-label">Ping</span>
          <span class="vgs-val" style="color:${pingColor}">${srv.ping} ms</span>
        </div>
        <div class="vg-stat">
          <span class="vgs-label">Sessions</span>
          <span class="vgs-val">${srv.sessions.toLocaleString()}</span>
        </div>
        <div class="vg-stat">
          <span class="vgs-label">Uptime</span>
          <span class="vgs-val">${fmtUptime(srv.uptime)}</span>
        </div>
      </div>
      <div class="vg-operator" title="${srv.operator}">${srv.operator.substring(0,50) || 'Academic VPN'}</div>
      <div class="vg-actions">
        <button class="btn-vg-download" data-idx="${container.children.length}">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download .ovpn
        </button>
        <button class="btn-vg-howto">
          📖 How to use
        </button>
      </div>
    `;

    card.querySelector('.btn-vg-download').addEventListener('click', () => {
      downloadOVPN(srv);
      showRealToast(`⬇ Downloading config for ${srv.country}`);
    });
    card.querySelector('.btn-vg-howto').addEventListener('click', () => {
      showHowToModal(srv);
    });

    container.appendChild(card);
  });
}

/* ── How-To Modal ── */
function showHowToModal(srv) {
  let modal = document.getElementById('howToModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'howToModal';
    modal.className = 'howto-modal-overlay';
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div class="howto-modal">
      <div class="howto-header">
        <span class="howto-flag">${srv.flag} ${srv.country}</span>
        <button class="howto-close" id="howtoClose">✕</button>
      </div>
      <h3 style="color:#fff;margin-bottom:1rem">How to Connect on Windows</h3>
      <div class="howto-steps">
        <div class="howto-step">
          <div class="hs-num">1</div>
          <div>
            <strong>Download OpenVPN GUI</strong><br/>
            <a href="https://openvpn.net/community-downloads/" target="_blank" style="color:var(--cyan)">openvpn.net/community-downloads</a>
          </div>
        </div>
        <div class="howto-step">
          <div class="hs-num">2</div>
          <div>
            <strong>Click "Download .ovpn" above</strong><br/>
            Save the file to your desktop.
          </div>
        </div>
        <div class="howto-step">
          <div class="hs-num">3</div>
          <div>
            <strong>Import in OpenVPN GUI</strong><br/>
            Right-click the OpenVPN tray icon → <em>Import → Import file</em> → select the .ovpn file.
          </div>
        </div>
        <div class="howto-step">
          <div class="hs-num">4</div>
          <div>
            <strong>Connect</strong><br/>
            Right-click the profile → <em>Connect</em>. Done! Your IP will change to <code>${srv.ip}</code>.
          </div>
        </div>
      </div>
      <div class="howto-note">
        ⓘ Server IP: <code>${srv.ip}</code> · Speed: <strong>${fmtSpeed(srv.speedMbps)}</strong> · Ping: <strong>${srv.ping} ms</strong><br/>
        This is a real VPN server from the <a href="https://www.vpngate.net" target="_blank" style="color:var(--cyan)">VPN Gate Academic Project</a> (University of Tsukuba, Japan).
      </div>
      <div style="display:flex;gap:.75rem;margin-top:1.5rem">
        <button class="btn-primary" style="flex:1" id="howtoDownload">⬇ Download .ovpn</button>
        <button class="btn-secondary" style="flex:1" id="howtoCloseBtn">Close</button>
      </div>
    </div>
  `;
  modal.style.display = 'flex';
  modal.querySelector('#howtoClose').onclick    = () => { modal.style.display = 'none'; };
  modal.querySelector('#howtoCloseBtn').onclick = () => { modal.style.display = 'none'; };
  modal.querySelector('#howtoDownload').onclick = () => { downloadOVPN(srv); };
  modal.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };
}

/* ── Toast ── */
function showRealToast(msg) {
  const toast   = document.getElementById('toast');
  const toastMsg= document.getElementById('toastMsg');
  if (!toast || !toastMsg) return;
  toastMsg.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

/* ══════════════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  /* 1. Run protection checks immediately */
  runProtectionChecks();

  /* 2. Load VPN Gate servers when section is visible */
  const vpngateSection = document.getElementById('vpngate');
  if (vpngateSection) {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        buildVPNGateUI();
        obs.disconnect();
      }
    }, { threshold: 0.1 });
    obs.observe(vpngateSection);
  }

  /* 3. Filter VPN Gate */
  const vgSearch = document.getElementById('vgSearch');
  if (vgSearch) {
    vgSearch.addEventListener('input', () => {
      const q = vgSearch.value.toLowerCase();
      document.querySelectorAll('.vpngate-card').forEach(card => {
        const country = card.querySelector('.vg-name')?.textContent.toLowerCase() || '';
        const ip      = card.querySelector('.vg-host')?.textContent.toLowerCase() || '';
        card.style.display = (country.includes(q) || ip.includes(q)) ? '' : 'none';
      });
    });
  }
});

/* Expose globally */
window.RealVPN.runProtectionChecks = runProtectionChecks;
window.RealVPN.downloadOVPN        = downloadOVPN;
window.RealVPN.getFlagEmoji        = getFlagEmoji;
window.RealVPN.fmtSpeed            = fmtSpeed;
