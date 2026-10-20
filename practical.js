/* practical.js — honest, useful behaviour on top of the existing scripts */
'use strict';
document.addEventListener('DOMContentLoaded', () => {
  const $ = s => document.querySelector(s);

  /* 1. Active nav link while scrolling */
  const links = [...document.querySelectorAll('.nav-link')];
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-40% 0px -55% 0px' });
  links.forEach(l => { const t = document.querySelector(l.getAttribute('href')); if (t) io.observe(t); });

  /* 2. Nav badge shows the real public IP; click copies it */
  const badge = $('#connectionBadge');
  let tries = 0;
  const wait = setInterval(() => {
    const ip = window.RealVPN && window.RealVPN.myIP;
    if (ip && ip.ip && ip.ip !== 'Unavailable') {
      $('.status-text').textContent = `${ip.flag} ${ip.ip}`;
      badge.title = 'Your public IP — click to copy';
      clearInterval(wait);
    } else if (++tries > 20) { $('.status-text').textContent = 'IP unavailable'; clearInterval(wait); }
  }, 500);
  badge.addEventListener('click', () => {
    const ip = window.RealVPN?.myIP?.ip;
    if (ip) copyToClipboard(ip, 'IP copied');
  });

  /* 3. Sample codes are not real: mark them and drop the fake Connect buttons */
  const grid = $('#codesGrid');
  const fixCards = () => grid.querySelectorAll('.code-card:not(.is-demo)').forEach(c => {
    c.classList.add('is-demo');
    c.querySelector('.btn-card-connect')?.remove();
  });
  new MutationObserver(fixCards).observe(grid, { childList: true });
  fixCards();
  const old = $('#btnConnectServer');
  if (old) {
    const b = old.cloneNode(false);
    b.id = 'btnConnectServer'; b.className = 'btn-connect-server';
    b.textContent = 'View sample configs';
    b.addEventListener('click', () => $('#codes').scrollIntoView({ behavior: 'smooth' }));
    old.replaceWith(b);
    new MutationObserver(() => { b.textContent = 'View sample configs'; })
      .observe(b, { childList: true });
  }

});
