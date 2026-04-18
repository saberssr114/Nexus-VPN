/* speedtest.js — Animated Real-Time Line Chart Speed Test */
'use strict';

(function () {

  /* ── Config ─────────────────────────────────────────────── */
  const SAMPLES   = 14;          // number of data points drawn
  const DL_URL    = 'https://speed.cloudflare.com/__down?bytes=';
  const UL_URL    = 'https://speed.cloudflare.com/__up';
  const PING_URL  = 'https://speed.cloudflare.com/__down?bytes=1';

  const COLOR_DL   = '#00d4ff';
  const COLOR_UL   = '#a78bff';
  const COLOR_PING = '#00ff88';
  const COLOR_GRID = 'rgba(255,255,255,0.05)';
  const COLOR_AXIS = 'rgba(255,255,255,0.12)';

  /* ── State ───────────────────────────────────────────────── */
  let running   = false;
  let dlSeries  = [];   // Mbps per sample
  let ulSeries  = [];
  let pingSeries= [];
  let animFrame = null;

  /* ── DOM refs (set after DOMContentLoaded) ─────────────── */
  let canvas, ctx, btnRun, dlVal, ulVal, pingVal, dlBar, ulBar, pingBar, statusMsg;

  /* ── Main init ────────────────────────────────────────────  */
  document.addEventListener('DOMContentLoaded', () => {
    canvas   = document.getElementById('stCanvas');
    btnRun   = document.getElementById('stBtnRun');
    dlVal    = document.getElementById('stDlVal');
    ulVal    = document.getElementById('stUlVal');
    pingVal  = document.getElementById('stPingVal');
    dlBar    = document.getElementById('stDlBar');
    ulBar    = document.getElementById('stUlBar');
    pingBar  = document.getElementById('stPingBar');
    statusMsg= document.getElementById('stStatus');

    if (!canvas || !btnRun) return;
    ctx = canvas.getContext('2d');

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    drawIdle();

    btnRun.addEventListener('click', () => {
      if (running) return;
      startTest();
    });
  });

  /* ── Canvas size ──────────────────────────────────────────  */
  function resizeCanvas() {
    if (!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width  = rect.width  || 700;
    canvas.height = Math.min(320, Math.max(220, rect.width * 0.38));
    if (!running) drawIdle();
  }

  /* ── Idle placeholder grid ───────────────────────────────── */
  function drawIdle() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(100);

    /* Flat dashed hint lines */
    [[COLOR_DL, 0.35], [COLOR_UL, 0.55], [COLOR_PING, 0.75]].forEach(([c, y]) => {
      ctx.save();
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = c.replace(')', ',0.2)').replace('rgb', 'rgba').replace('#', '');
      /* Use rgba workaround */
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = c;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(50, canvas.height * y);
      ctx.lineTo(canvas.width - 20, canvas.height * y);
      ctx.stroke();
      ctx.restore();
    });

    drawLabel('Click "Run Test" to start', canvas.width / 2, canvas.height / 2, 'rgba(255,255,255,0.25)', '14px');
  }

  /* ── Grid ─────────────────────────────────────────────────  */
  function drawGrid(maxVal) {
    const W = canvas.width, H = canvas.height;
    const pad = { top: 24, right: 20, bottom: 36, left: 52 };
    const innerW = W - pad.left - pad.right;
    const innerH = H - pad.top  - pad.bottom;

    ctx.clearRect(0, 0, W, H);

    /* Horizontal grid lines */
    const rows = 5;
    for (let i = 0; i <= rows; i++) {
      const y = pad.top + (innerH / rows) * i;
      ctx.strokeStyle = COLOR_GRID;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();

      /* Y labels */
      const val = Math.round(maxVal - (maxVal / rows) * i);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(val, pad.left - 6, y + 3);
    }

    /* Vertical grid lines */
    for (let i = 0; i <= SAMPLES; i++) {
      const x = pad.left + (innerW / SAMPLES) * i;
      ctx.strokeStyle = COLOR_GRID;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, H - pad.bottom); ctx.stroke();
    }

    /* Axes */
    ctx.strokeStyle = COLOR_AXIS;
    ctx.lineWidth   = 1.5;
    ctx.beginPath(); ctx.moveTo(pad.left, pad.top); ctx.lineTo(pad.left, H - pad.bottom); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad.left, H - pad.bottom); ctx.lineTo(W - pad.right, H - pad.bottom); ctx.stroke();

    /* Y-axis unit */
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';
    ctx.translate(13, pad.top + innerH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Mbps / ms', 0, 0);
    ctx.restore();

    return { pad, innerW, innerH };
  }

  /* ── Draw series on canvas ────────────────────────────────  */
  function drawChart() {
    if (!ctx) return;
    const maxDL   = Math.max(100, ...dlSeries,   1);
    const maxUL   = Math.max(100, ...ulSeries,   1);
    const maxPing = Math.max(200, ...pingSeries, 1);
    const maxVal  = Math.max(maxDL, maxUL, maxPing);

    const { pad, innerW, innerH } = drawGrid(Math.ceil(maxVal / 10) * 10);
    const W = canvas.width, H = canvas.height;

    function plotSeries(series, color, labelY) {
      if (series.length < 2) return;
      const pts = series.map((v, i) => ({
        x: pad.left + (innerW / SAMPLES) * i,
        y: pad.top  + innerH - (v / (Math.ceil(maxVal / 10) * 10)) * innerH,
      }));

      /* Glow effect */
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur  = 12;

      /* Line */
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        /* Smooth cubic bezier */
        const cpx = (pts[i-1].x + pts[i].x) / 2;
        ctx.bezierCurveTo(cpx, pts[i-1].y, cpx, pts[i].y, pts[i].x, pts[i].y);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth   = 2.5;
      ctx.lineJoin    = 'round';
      ctx.stroke();

      /* Area fill */
      ctx.lineTo(pts[pts.length-1].x, H - pad.bottom);
      ctx.lineTo(pts[0].x, H - pad.bottom);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, pad.top, 0, H - pad.bottom);
      grad.addColorStop(0,   hexToRgba(color, 0.18));
      grad.addColorStop(1,   hexToRgba(color, 0.0));
      ctx.fillStyle = grad;
      ctx.fill();

      /* Dots */
      pts.forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#0a0f1e';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      ctx.restore();
    }

    plotSeries(pingSeries, COLOR_PING);
    plotSeries(ulSeries,   COLOR_UL);
    plotSeries(dlSeries,   COLOR_DL);

    /* Legend */
    const legend = [
      { label: 'Download', color: COLOR_DL,   val: dlSeries[dlSeries.length-1]   || 0 },
      { label: 'Upload',   color: COLOR_UL,   val: ulSeries[ulSeries.length-1]   || 0 },
      { label: 'Ping',     color: COLOR_PING, val: pingSeries[pingSeries.length-1]|| 0 },
    ];
    legend.forEach((l, i) => {
      const lx = pad.left + 10 + i * 155;
      const ly = H - 8;
      ctx.beginPath();
      ctx.arc(lx, ly - 4, 5, 0, Math.PI * 2);
      ctx.fillStyle = l.color;
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font      = '11px Inter';
      ctx.textAlign = 'left';
      ctx.fillText(`${l.label}: ${l.val.toFixed(1)} ${l.label === 'Ping' ? 'ms' : 'Mbps'}`, lx + 10, ly);
    });
  }

  /* ── Label helper ─────────────────────────────────────────  */
  function drawLabel(text, x, y, color, font) {
    ctx.fillStyle = color;
    ctx.font = font + ' Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
  }

  /* ── Hex → rgba ───────────────────────────────────────────  */
  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  /* ── Ping measurement ─────────────────────────────────────  */
  async function measurePing() {
    const pings = [];
    for (let i = 0; i < 4; i++) {
      const t0 = performance.now();
      try {
        await fetch(PING_URL, { cache: 'no-store', signal: AbortSignal.timeout(4000) });
        pings.push(performance.now() - t0);
      } catch (_) {}
    }
    pings.sort((a,b) => a - b);
    return pings.length ? Math.round(pings[1] || pings[0]) : 999;
  }

  /* ── Download measurement ─────────────────────────────────  */
  async function measureDownload(sampleIndex, onValue) {
    const size  = 2 * 1024 * 1024;  // 2 MB per sample
    const t0    = performance.now();
    try {
      const res  = await fetch(DL_URL + size, { cache: 'no-store', signal: AbortSignal.timeout(12000) });
      await res.arrayBuffer();
      const secs = (performance.now() - t0) / 1000;
      const mbps = (size * 8) / (secs * 1_000_000);
      onValue(Math.round(mbps * 10) / 10);
    } catch (_) { onValue(0); }
  }

  /* ── Upload measurement ───────────────────────────────────  */
  async function measureUpload(onValue) {
    const size = 1 * 1024 * 1024; // 1 MB
    const data = new Uint8Array(size);
    const t0   = performance.now();
    try {
      await fetch(UL_URL, {
        method: 'POST',
        body: data,
        cache: 'no-store',
        signal: AbortSignal.timeout(12000),
      });
      const secs = (performance.now() - t0) / 1000;
      const mbps = (size * 8) / (secs * 1_000_000);
      onValue(Math.round(mbps * 10) / 10);
    } catch (_) { onValue(0); }
  }

  /* ── Metric card update ───────────────────────────────────  */
  function updateMetric(elVal, elBar, value, max, unit) {
    if (!elVal) return;
    elVal.textContent = value.toFixed(1) + ' ' + unit;
    if (elBar) {
      const pct = Math.min(100, (value / max) * 100);
      elBar.style.width = pct + '%';
    }
  }

  function setStatus(msg) {
    if (statusMsg) statusMsg.textContent = msg;
  }

  /* ── Main test runner ─────────────────────────────────────  */
  async function startTest() {
    running    = true;
    dlSeries   = [];
    ulSeries   = [];
    pingSeries = [];

    btnRun.disabled   = true;
    btnRun.textContent = '⏱ Testing...';
    btnRun.classList.add('testing');

    /* Phase 1: Ping */
    setStatus('📡 Measuring ping...');
    for (let i = 0; i < 4; i++) {
      const ping = await measurePing();
      pingSeries.push(ping);
      updateMetric(pingVal, pingBar, ping, 200, 'ms');
      drawChart();
      await sleep(200);
    }

    /* Phase 2: Download */
    setStatus('⬇ Download speed...');
    for (let i = 0; i < 5; i++) {
      await measureDownload(i, v => {
        dlSeries.push(v);
        updateMetric(dlVal, dlBar, v, 500, 'Mbps');
        drawChart();
      });
      /* Parallel ping sample */
      const p = await measurePing();
      pingSeries.push(p);
      updateMetric(pingVal, pingBar, p, 200, 'ms');
      drawChart();
    }

    /* Phase 3: Upload */
    setStatus('⬆ Upload speed...');
    for (let i = 0; i < 5; i++) {
      await measureUpload(v => {
        ulSeries.push(v);
        updateMetric(ulVal, ulBar, v, 500, 'Mbps');
        drawChart();
      });
      const p = await measurePing();
      pingSeries.push(p);
      drawChart();
    }

    /* Final summary */
    const avgDL   = avg(dlSeries);
    const avgUL   = avg(ulSeries);
    const avgPing = avg(pingSeries);

    updateMetric(dlVal,   dlBar,   avgDL,   1000, 'Mbps');
    updateMetric(ulVal,   ulBar,   avgUL,   1000, 'Mbps');
    updateMetric(pingVal, pingBar, avgPing, 200,  'ms');
    drawChart();

    const grade = avgDL > 100 ? '🚀 Excellent' : avgDL > 30 ? '✅ Good' : avgDL > 5 ? '⚠ Fair' : '🐌 Slow';
    setStatus(`${grade} — ↓ ${avgDL.toFixed(1)} Mbps  ↑ ${avgUL.toFixed(1)} Mbps  ⏱ ${avgPing.toFixed(0)} ms`);

    btnRun.disabled   = false;
    btnRun.textContent = '🔁 Run Again';
    btnRun.classList.remove('testing');
    running = false;
  }

  function avg(arr) {
    return arr.length ? arr.reduce((a,b) => a+b, 0) / arr.length : 0;
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

})();
