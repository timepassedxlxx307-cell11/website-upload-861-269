
(function () {
  const onReady = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  };

  function qs(sel, root = document) { return root.querySelector(sel); }
  function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

  function setActiveNav() {
    const path = location.pathname.replace(/\\/g, '/');
    qsa('[data-nav-link]').forEach((a) => {
      const href = a.getAttribute('href') || '';
      const normalized = href.replace(/\\/g, '/');
      if (href === '/' && (path.endsWith('/index.html') || path === '/' || path === '')) {
        a.classList.add('active');
      } else if (normalized && normalized !== '/' && path.endsWith(normalized)) {
        a.classList.add('active');
      }
    });
  }

  function initMobileMenu() {
    const btn = qs('[data-mobile-toggle]');
    const menu = qs('[data-mobile-menu]');
    if (!btn || !menu) return;
    btn.addEventListener('click', () => menu.classList.toggle('hidden'));
  }

  function filterCardsBySearch() {
    const form = qs('[data-live-search]');
    if (!form) return;
    const input = qs('input[type="search"]', form);
    const select = qs('select', form);
    const cards = qsa('[data-card]');
    const count = qs('[data-result-count]');

    const apply = () => {
      const keyword = (input?.value || '').trim().toLowerCase();
      const category = (select?.value || '').trim();
      let visible = 0;
      cards.forEach((card) => {
        const hay = [
          card.dataset.title,
          card.dataset.genre,
          card.dataset.region,
          card.dataset.tags,
          card.dataset.summary,
          card.dataset.year,
          card.dataset.category,
        ].join(' ').toLowerCase();
        const matchKeyword = !keyword || hay.includes(keyword);
        const matchCategory = !category || card.dataset.category === category;
        const ok = matchKeyword && matchCategory;
        card.classList.toggle('hidden', !ok);
        if (ok) visible += 1;
      });
      if (count) count.textContent = String(visible);
    };

    input?.addEventListener('input', apply);
    select?.addEventListener('change', apply);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      apply();
    });
    apply();
  }

  function initSearchPage() {
    const root = qs('[data-search-page]');
    if (!root || !window.MOVIE_DATA) return;
    const params = new URLSearchParams(location.search);
    const keyword = (params.get('q') || params.get('keyword') || '').trim().toLowerCase();
    const out = qs('[data-search-results]', root);
    const count = qs('[data-search-count]', root);
    const queryLabel = qs('[data-query-label]', root);
    const items = keyword
      ? window.MOVIE_DATA.filter((m) => {
          const hay = [m.title, m.genre, m.region, m.tags, m.one_line, m.summary, m.review].join(' ').toLowerCase();
          return hay.includes(keyword);
        })
      : window.MOVIE_DATA.slice(0, 60);

    if (queryLabel) queryLabel.textContent = keyword ? `「${keyword}」` : '精选推荐';
    if (count) count.textContent = String(items.length);
    if (!out) return;
    out.innerHTML = items.map(renderSearchCard).join('');
  }

  function renderSearchCard(m) {
    return `
      <a class="movie-card" data-card href="movies/movie-${m.id}.html" style="--hue:${m.hue}">
        <div class="poster">
          <span class="poster-chip">${escapeHtml(m.year || '')}</span>
          <div class="poster-info">
            <strong>${escapeHtml(m.title)}</strong>
            <span>${escapeHtml(m.region)} · ${escapeHtml(m.type)}</span>
          </div>
        </div>
        <div class="body">
          <div class="meta-line">
            <span>${escapeHtml(m.genre)}</span>
            <span>${escapeHtml(m.rating)} 分</span>
          </div>
          <h3>${escapeHtml(m.title)}</h3>
          <p class="summary">${escapeHtml(m.one_line || m.summary || '')}</p>
        </div>
      </a>
    `;
  }

  function initVideoPlayer() {
    qsa('video[data-hls], video[data-mp4]').forEach((video) => {
      const hlsUrl = video.dataset.hls;
      const mp4Url = video.dataset.mp4;
      const canNativeHls = !!video.canPlayType && video.canPlayType('application/vnd.apple.mpegurl');
      if (canNativeHls && hlsUrl) {
        video.src = hlsUrl;
        return;
      }
      if (window.Hls && Hls.isSupported && Hls.isSupported() && hlsUrl) {
        const hls = new Hls({ enableWorker: true });
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function () {
          if (mp4Url && !video.src) video.src = mp4Url;
        });
        return;
      }
      if (mp4Url) video.src = mp4Url;
    });
  }

  function initBackToTop() {
    const btn = qs('[data-back-top]');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.style.opacity = window.scrollY > 500 ? '1' : '0';
      btn.style.pointerEvents = window.scrollY > 500 ? 'auto' : 'none';
    });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  onReady(() => {
    setActiveNav();
    initMobileMenu();
    filterCardsBySearch();
    initSearchPage();
    initVideoPlayer();
    initBackToTop();
  });
})();
