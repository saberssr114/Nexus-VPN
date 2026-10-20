(function () {
  function initGlobe() {
    const canvas = document.getElementById('globeCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const markers = (window.VPN_DATA || []).map((item, index) => ({
      name: item.country,
      flag: item.flag,
      region: item.region,
      x: 0.2 + ((index * 79) % 85) / 100,
      y: 0.18 + ((index * 41) % 72) / 100,
      radius: 8 + (index % 3) * 2,
    }));

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      const size = Math.min(window.innerWidth * 0.8, 520);
      canvas.width = size * ratio;
      canvas.height = size * ratio;
      canvas.style.width = size + 'px';
      canvas.style.height = size + 'px';
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    function drawGlobe(t) {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) * 0.36;
      const isDark = document.body.dataset.theme === 'dark';
      const surface = isDark ? '#000000' : '#faf7f3';
      const globe = isDark ? '#faf7f3' : '#000000';
      const line = isDark ? 'rgba(0,0,0,0.18)' : 'rgba(250,247,243,0.2)';

      ctx.clearRect(0, 0, w, h);

      const grd = ctx.createRadialGradient(cx - 40, cy - 60, 18, cx, cy, r + 70);
      grd.addColorStop(0, isDark ? 'rgba(250,247,243,0.12)' : 'rgba(0,0,0,0.12)');
      grd.addColorStop(0.45, isDark ? 'rgba(250,247,243,0.06)' : 'rgba(0,0,0,0.06)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = globe;
      ctx.fill();
      ctx.strokeStyle = line;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * (0.55 + i * 0.12), r * (0.3 + i * 0.08), 0, 0, Math.PI * 2);
        ctx.strokeStyle = isDark ? 'rgba(0,0,0,0.08)' : 'rgba(250,247,243,0.1)';
        ctx.stroke();
      }

      markers.forEach((marker, index) => {
        const px = cx + Math.cos((t * 0.00015) + index) * (r * 0.9) * (marker.x * 1.25 - 0.2);
        const py = cy + Math.sin((t * 0.00018) + index * 1.4) * (r * 0.9) * (marker.y * 0.8 + 0.15);

        const dx = px - cx;
        const dy = py - cy;
        const dist = Math.hypot(dx, dy);
        if (dist > r * 0.95) return;

        ctx.beginPath();
        ctx.fillStyle = surface;
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + (dx / dist) * 28, py + (dy / dist) * 28);
        ctx.strokeStyle = line;
        ctx.stroke();
      });

      const tooltip = document.getElementById('globeTooltip');
      if (tooltip) {
        const hover = markers.reduce((closest, m) => {
          const px = cx + Math.cos((t * 0.00015)) * (r * 0.9) * (m.x * 1.1);
          const py = cy + Math.sin((t * 0.00018)) * (r * 0.9) * (m.y + 0.1);
          const d = Math.hypot(px - (window.innerWidth * 0.36), py - (window.innerHeight * 0.34));
          return d < closest ? d : closest;
        }, Number.POSITIVE_INFINITY);
        if (hover < Number.POSITIVE_INFINITY) {
          const m = markers[0];
          const name = document.getElementById('tooltipName');
          const flag = document.getElementById('tooltipFlag');
          if (name) name.textContent = m.name;
          if (flag) flag.textContent = m.flag;
        }
      }
    }

    function animate(t) {
      drawGlobe(t);
      requestAnimationFrame(animate);
    }

    resize();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      drawGlobe(0);
    } else {
      requestAnimationFrame(animate);
    }
    window.addEventListener('resize', resize);

    canvas.addEventListener('click', (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const r = Math.min(rect.width, rect.height) * 0.36;
      const hit = markers.find((marker, index) => {
        const px = cx + Math.cos(index * 1.7) * (r * 0.9) * (marker.x * 1.25 - 0.2);
        const py = cy + Math.sin(index * 1.4) * (r * 0.9) * (marker.y * 0.8 + 0.15);
        return Math.hypot(px - x, py - y) < 12;
      });
      if (hit && window.openCountryPanel) {
        window.openCountryPanel({ name: hit.name, flag: hit.flag, region: hit.region });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlobe);
  } else {
    initGlobe();
  }
})();
