(function () {
  var navToggle = document.querySelector('.nav-toggle');
  var navMenu = document.querySelector('.nav-menu');
  var topSearch = document.querySelector('.top-search');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      var open = navMenu.classList.toggle('is-open');
      if (topSearch) {
        topSearch.classList.toggle('is-open', open);
      }
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prev = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, idx) {
      slide.classList.toggle('is-active', idx === current);
    });
    dots.forEach(function (dot, idx) {
      dot.classList.toggle('is-active', idx === current);
    });
  }

  function startHero() {
    if (!slides.length) {
      return;
    }
    clearInterval(timer);
    timer = setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot, idx) {
    dot.addEventListener('click', function () {
      showSlide(idx);
      startHero();
    });
  });

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
      startHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      startHero();
    });
  }

  startHero();

  var grid = document.getElementById('movieGrid');
  var searchInput = document.getElementById('movieSearch') || document.querySelector('.movie-search-local');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.filter-btn'));
  var noResults = document.getElementById('noResults');
  var activeFilter = 'all';

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function cardMatchesFilter(card, filter) {
    if (filter === 'all') {
      return true;
    }
    var text = [card.dataset.type, card.dataset.year, card.dataset.region, card.dataset.search].join(' ').toLowerCase();
    if (filter === '剧') {
      return text.indexOf('剧') !== -1 || text.indexOf('tv') !== -1;
    }
    if (filter === '动画') {
      return text.indexOf('动画') !== -1 || text.indexOf('动漫') !== -1 || text.indexOf('ova') !== -1;
    }
    if (filter === '欧美') {
      return ['欧美', '美国', '英国', '法国', '德国', '意大利', '西班牙', '俄罗斯', '加拿大', '澳大利亚'].some(function (key) {
        return text.indexOf(key) !== -1;
      });
    }
    return text.indexOf(filter.toLowerCase()) !== -1;
  }

  function applySearch() {
    if (!grid) {
      return;
    }
    var query = normalize(searchInput ? searchInput.value : '');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var count = 0;
    cards.forEach(function (card) {
      var haystack = normalize(card.dataset.search);
      var ok = (!query || haystack.indexOf(query) !== -1) && cardMatchesFilter(card, activeFilter);
      card.style.display = ok ? '' : 'none';
      if (ok) {
        count += 1;
      }
    });
    if (noResults) {
      noResults.classList.toggle('is-visible', count === 0);
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', applySearch);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      filterButtons.forEach(function (item) {
        item.classList.remove('is-active');
      });
      button.classList.add('is-active');
      activeFilter = button.dataset.filter || 'all';
      applySearch();
    });
  });

  var params = new URLSearchParams(window.location.search);
  var q = params.get('q');
  if (q && searchInput) {
    searchInput.value = q;
    applySearch();
  }
})();
