(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-mobile-nav]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    slider.addEventListener('mouseenter', function () {
      window.clearInterval(timer);
    });
    slider.addEventListener('mouseleave', start);
    start();
  }

  function setupSearchForms() {
    var forms = document.querySelectorAll('[data-search-form]');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (input && input.value.trim()) {
          return;
        }
        event.preventDefault();
        window.location.href = './search.html';
      });
    });
  }

  function setupFilters() {
    var roots = document.querySelectorAll('[data-filter-root]');
    roots.forEach(function (root) {
      var search = root.querySelector('[data-filter-search]');
      var region = root.querySelector('[data-filter-region]');
      var type = root.querySelector('[data-filter-type]');
      var year = root.querySelector('[data-filter-year]');
      var genre = root.querySelector('[data-filter-genre]');
      var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
      var empty = root.querySelector('[data-empty-message]');

      function normalize(value) {
        return String(value || '').trim().toLowerCase();
      }

      function apply() {
        var q = normalize(search ? search.value : '');
        var selectedRegion = region ? region.value : '';
        var selectedType = type ? type.value : '';
        var selectedYear = year ? year.value : '';
        var selectedGenre = genre ? genre.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search'));
          var cardRegion = card.getAttribute('data-region') || '';
          var cardType = card.getAttribute('data-type') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var cardGenre = card.getAttribute('data-genre') || '';
          var ok = true;
          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (selectedRegion && cardRegion !== selectedRegion) {
            ok = false;
          }
          if (selectedType && cardType !== selectedType) {
            ok = false;
          }
          if (selectedYear && cardYear !== selectedYear) {
            ok = false;
          }
          if (selectedGenre && cardGenre.indexOf(selectedGenre) === -1) {
            ok = false;
          }
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [search, region, type, year, genre].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query && search) {
        search.value = query;
      }
      apply();
    });
  }

  function setupScrollPlayer() {
    var links = document.querySelectorAll('[data-scroll-player]');
    links.forEach(function (link) {
      link.addEventListener('click', function (event) {
        var player = document.querySelector('.player-shell');
        if (!player) {
          return;
        }
        event.preventDefault();
        player.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  }

  window.initMoviePlayer = function (streamUrl) {
    var video = document.getElementById('movieVideo');
    var overlay = document.getElementById('playerOverlay');
    if (!video || !overlay || !streamUrl) {
      return;
    }
    var hls;
    var prepared = false;

    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;
      video.controls = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (video.paused) {
            video.play().catch(function () {});
          }
        });
      } else {
        video.src = streamUrl;
      }
    }

    function start() {
      prepare();
      overlay.classList.add('is-hidden');
      video.play().catch(function () {
        overlay.classList.remove('is-hidden');
      });
    }

    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!prepared || video.paused) {
        start();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        overlay.classList.remove('is-hidden');
      }
    });
    video.addEventListener('ended', function () {
      overlay.classList.remove('is-hidden');
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupMobileMenu();
    setupHeroSlider();
    setupSearchForms();
    setupFilters();
    setupScrollPlayer();
  });
}());
