
(function () {
  const doc = document;

  function qs(root, sel) {
    return root.querySelector(sel);
  }

  function qsa(root, sel) {
    return Array.from(root.querySelectorAll(sel));
  }

  function initMenu() {
    const toggle = qs(doc, '[data-nav-toggle]');
    const panel = qs(doc, '[data-nav-panel]');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', () => {
      panel.classList.toggle('is-open');
    });
  }

  function initHeroCarousel() {
    const carousel = qs(doc, '[data-carousel]');
    if (!carousel) return;
    const slides = qsa(carousel, '.hero-slide');
    const prev = qs(carousel, '[data-carousel-prev]');
    const next = qs(carousel, '[data-carousel-next]');
    const dotsWrap = qs(carousel, '[data-carousel-dots]');
    if (!slides.length) return;

    let index = 0;
    const dots = [];

    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      slides.forEach((slide, i) => {
        const dot = doc.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', '切换轮播 ' + (i + 1));
        dot.addEventListener('click', () => show(i));
        dotsWrap.appendChild(dot);
        dots.push(dot);
      });
    }

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((slide, idx) => slide.classList.toggle('is-active', idx === index));
      dots.forEach((dot, idx) => dot.classList.toggle('is-active', idx === index));
    }

    if (prev) prev.addEventListener('click', () => show(index - 1));
    if (next) next.addEventListener('click', () => show(index + 1));
    show(0);
    setInterval(() => show(index + 1), 5200);
  }

  function initSearch() {
    qsa(doc, '[data-search-input]').forEach(input => {
      const scope = input.closest('[data-search-scope]');
      if (!scope) return;
      const cards = qsa(scope, '[data-search]');
      const empty = qs(scope, '[data-empty-state]');
      const update = () => {
        const term = input.value.trim().toLowerCase();
        let visible = 0;
        cards.forEach(card => {
          const haystack = (card.getAttribute('data-search') || '').toLowerCase();
          const show = !term || haystack.includes(term);
          card.classList.toggle('hidden', !show);
          if (show) visible += 1;
        });
        if (empty) empty.classList.toggle('hidden', visible !== 0);
      };
      input.addEventListener('input', update);
      update();
    });
  }

  let hlsLoader;
  function loadHls() {
    if (window.Hls) return Promise.resolve(window.Hls);
    if (hlsLoader) return hlsLoader;
    hlsLoader = new Promise(resolve => {
      const script = doc.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
      script.async = true;
      script.onload = () => resolve(window.Hls || null);
      script.onerror = () => resolve(null);
      doc.head.appendChild(script);
    });
    return hlsLoader;
  }

  function initPlayers() {
    qsa(doc, '[data-player]').forEach(shell => {
      const video = qs(shell, 'video');
      const overlay = qs(shell, '[data-player-overlay]');
      const button = qs(shell, '[data-player-play]');
      const source = shell.getAttribute('data-src');
      if (!video || !source) return;

      let prepared = false;
      let hls = null;

      async function start() {
        if (!prepared) {
          prepared = true;
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
          } else {
            const HlsClass = await loadHls();
            if (HlsClass && HlsClass.isSupported()) {
              hls = new HlsClass();
              hls.loadSource(source);
              hls.attachMedia(video);
              shell._hls = hls;
            } else {
              video.src = source;
            }
          }
        }

        if (overlay) overlay.classList.add('is-hidden');
        try {
          await video.play();
        } catch (err) {
          // silently ignore autoplay policy errors after user interaction
        }
      }

      if (overlay) overlay.addEventListener('click', start);
      if (button) button.addEventListener('click', start);
      video.addEventListener('click', start);
      shell.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') start();
      });
    });
  }

  function initDetailExtras() {
    const hashes = qsa(doc, '[data-scroll-target]');
    hashes.forEach(link => {
      link.addEventListener('click', (ev) => {
        const target = qs(doc, link.getAttribute('data-scroll-target'));
        if (!target) return;
        ev.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  doc.addEventListener('DOMContentLoaded', () => {
    initMenu();
    initHeroCarousel();
    initSearch();
    initPlayers();
    initDetailExtras();
  });
})();
