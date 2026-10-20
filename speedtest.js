(function () {
  const ENDPOINT = 'https://speed.cloudflare.com';
  const DOWNLOAD_SIZES = [1_000_000, 8_000_000];
  const UPLOAD_SIZES = [1_000_000, 4_000_000];

  function formatSpeed(mbps) {
    const precision = mbps >= 100 ? 0 : 1;
    return `${mbps.toFixed(precision)} Mbps`;
  }

  function updateBars(download, upload, ping) {
    const downloadBar = document.getElementById('stDlBar');
    const uploadBar = document.getElementById('stUlBar');
    const pingBar = document.getElementById('stPingBar');
    if (downloadBar) downloadBar.style.width = `${Math.min(download / 1000 * 100, 100)}%`;
    if (uploadBar) uploadBar.style.width = `${Math.min(upload / 500 * 100, 100)}%`;
    if (pingBar) pingBar.style.width = `${Math.max(0, 100 - ping)}%`;
  }

  function drawChart(samples) {
    const canvas = document.getElementById('stCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const isDark = document.body.dataset.theme === 'dark';
    const lineColor = isDark ? '#faf7f3' : '#000000';
    ctx.strokeStyle = isDark ? 'rgba(250,247,243,0.16)' : 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 1;
    for (let index = 0; index < 5; index += 1) {
      const y = 24 + index * ((height - 48) / 4);
      ctx.beginPath();
      ctx.moveTo(28, y);
      ctx.lineTo(width - 20, y);
      ctx.stroke();
    }

    const left = 32;
    const right = width - 24;
    const top = 28;
    const bottom = height - 28;
    const series = [
      { values: samples.download, dash: [] },
      { values: samples.upload, dash: [7, 4] },
      { values: samples.ping, dash: [2, 4] },
    ];

    series.forEach(({ values, dash }) => {
      if (values.length === 0) return;
      const maximum = Math.max(...values, 1);
      ctx.beginPath();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash(dash);
      values.forEach((value, index) => {
        const x = values.length === 1 ? (left + right) / 2 : left + (index / (values.length - 1)) * (right - left);
        const y = bottom - (value / maximum) * (bottom - top);
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
    ctx.setLineDash([]);
  }

  function median(values) {
    const sorted = [...values].sort((first, second) => first - second);
    return sorted[Math.floor(sorted.length / 2)];
  }

  function cacheBusted(url) {
    return `${url}${url.includes('?') ? '&' : '?'}_=${Date.now()}-${Math.random()}`;
  }

  async function measurePing(samples, status) {
    const results = [];
    for (let index = 0; index < 5; index += 1) {
      status.textContent = `Measuring latency ${index + 1} of 5...`;
      const start = performance.now();
      const response = await fetch(cacheBusted(`${ENDPOINT}/__down?bytes=0`), {
        cache: 'no-store',
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error('Latency request failed');
      await response.arrayBuffer();
      results.push(performance.now() - start);
      samples.ping.push(results[results.length - 1]);
      drawChart(samples);
    }
    return median(results);
  }

  async function measureDownload(bytes, samples, status, index, count) {
    status.textContent = `Measuring download ${index} of ${count}...`;
    const start = performance.now();
    const response = await fetch(cacheBusted(`${ENDPOINT}/__down?bytes=${bytes}`), {
      cache: 'no-store',
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error('Download request failed');
    const received = await response.arrayBuffer();
    const elapsedSeconds = (performance.now() - start) / 1000;
    if (received.byteLength === 0 || elapsedSeconds <= 0) throw new Error('Download returned no data');
    const mbps = (received.byteLength * 8) / (elapsedSeconds * 1_000_000);
    samples.download.push(mbps);
    drawChart(samples);
    return mbps;
  }

  function createUploadPayload(bytes) {
    const payload = new Uint8Array(bytes);
    for (let offset = 0; offset < bytes; offset += 65_536) {
      crypto.getRandomValues(payload.subarray(offset, Math.min(offset + 65_536, bytes)));
    }
    return new Blob([payload], { type: 'text/plain' });
  }

  async function measureUpload(bytes, samples, status, index, count) {
    status.textContent = `Measuring upload ${index} of ${count}...`;
    const payload = createUploadPayload(bytes);
    const start = performance.now();
    const response = await fetch(cacheBusted(`${ENDPOINT}/__up`), {
      method: 'POST',
      body: payload,
      cache: 'no-store',
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error('Upload request failed');
    await response.arrayBuffer();
    const elapsedSeconds = (performance.now() - start) / 1000;
    if (elapsedSeconds <= 0) throw new Error('Upload timing was invalid');
    const mbps = (bytes * 8) / (elapsedSeconds * 1_000_000);
    samples.upload.push(mbps);
    drawChart(samples);
    return mbps;
  }

  async function runSpeedTest() {
    const status = document.getElementById('stStatus');
    const downloadValue = document.getElementById('stDlVal');
    const uploadValue = document.getElementById('stUlVal');
    const pingValue = document.getElementById('stPingVal');
    const button = document.getElementById('stBtnRun');
    if (!status || !button) return;

    const samples = { download: [], upload: [], ping: [] };
    button.disabled = true;
    button.textContent = 'Testing...';
    status.textContent = 'Connecting to Cloudflare speed test...';
    [downloadValue, uploadValue, pingValue].forEach(value => {
      if (value) value.textContent = '—';
    });
    updateBars(0, 0, 0);
    drawChart(samples);

    try {
      const ping = await measurePing(samples, status);
      let download = 0;
      for (let index = 0; index < DOWNLOAD_SIZES.length; index += 1) {
        download = await measureDownload(DOWNLOAD_SIZES[index], samples, status, index + 1, DOWNLOAD_SIZES.length);
      }

      let upload = 0;
      for (let index = 0; index < UPLOAD_SIZES.length; index += 1) {
        upload = await measureUpload(UPLOAD_SIZES[index], samples, status, index + 1, UPLOAD_SIZES.length);
      }

      if (downloadValue) downloadValue.textContent = formatSpeed(download);
      if (uploadValue) uploadValue.textContent = formatSpeed(upload);
      if (pingValue) pingValue.textContent = `${Math.round(ping)} ms`;
      updateBars(download, upload, ping);
      status.textContent = 'Real network test complete';
    } catch (_) {
      status.textContent = 'Could not reach Cloudflare. Check your connection and try again.';
    } finally {
      button.disabled = false;
      button.textContent = 'Run Speed Test';
    }
  }

  function initSpeedTest() {
    const button = document.getElementById('stBtnRun');
    if (!button) return;
    button.addEventListener('click', runSpeedTest);
    drawChart({ download: [], upload: [], ping: [] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSpeedTest);
  } else {
    initSpeedTest();
  }
})();