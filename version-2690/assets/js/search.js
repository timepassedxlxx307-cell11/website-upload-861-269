(function () {
  const form = document.querySelector('[data-search-form]');
  const input = document.querySelector('[data-search-input]');
  const results = document.querySelector('[data-search-results]');
  const empty = document.querySelector('[data-search-empty]');
  const base = document.body.dataset.base || './';

  if (!form || !input || !results || !Array.isArray(window.SEARCH_MOVIES)) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';
  input.value = initialQuery;

  const createCard = function (movie) {
    return [
      '<article class="movie-card" data-title="', escapeHtml(movie.title), '" data-region="', escapeHtml(movie.region), '" data-year="', escapeHtml(movie.year), '" data-genre="', escapeHtml(movie.genre), '">',
      '<a class="poster" href="', escapeHtml(base + movie.url), '">',
      '<img src="', escapeHtml(base + movie.cover), '" alt="', escapeHtml(movie.title), '" loading="lazy">',
      '<span class="poster-badge">', escapeHtml(movie.type), '</span><span class="poster-shade"></span></a>',
      '<div class="card-body"><h3><a href="', escapeHtml(base + movie.url), '">', escapeHtml(movie.title), '</a></h3>',
      '<p>', escapeHtml(movie.oneLine), '</p><div class="card-meta"><span>', escapeHtml(movie.year), '</span><span>', escapeHtml(movie.region), '</span><span>', escapeHtml(movie.genre), '</span></div></div></article>'
    ].join('');
  };

  const render = function (query) {
    const value = query.trim().toLowerCase();
    const list = window.SEARCH_MOVIES.filter(function (movie) {
      const text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(' ').toLowerCase();
      return !value || text.indexOf(value) !== -1;
    }).slice(0, 240);

    results.innerHTML = list.map(createCard).join('');

    if (empty) {
      empty.classList.toggle('is-visible', list.length === 0);
    }
  };

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const query = input.value.trim();
    const nextUrl = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
    window.history.replaceState(null, '', nextUrl);
    render(query);
  });

  input.addEventListener('input', function () {
    render(input.value);
  });

  render(initialQuery);
})();

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
