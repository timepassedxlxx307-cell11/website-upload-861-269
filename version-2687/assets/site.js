(function () {
  var header = document.querySelector('[data-header]');
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  function setHeaderState() {
    if (!header) {
      return;
    }
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var nextIndex = parseInt(dot.getAttribute('data-hero-dot'), 10);
        showSlide(nextIndex);
      });
    });

    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  function initPlayers() {
    var frames = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    frames.forEach(function (frame) {
      var video = frame.querySelector('video');
      var button = frame.querySelector('.play-overlay');
      var message = frame.querySelector('.player-message');
      if (!video) {
        return;
      }

      var source = video.querySelector('source');
      var url = source ? source.getAttribute('src') : video.getAttribute('src');
      if (source) {
        source.parentNode.removeChild(source);
      }

      if (url) {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && message) {
              message.textContent = '视频暂时无法播放';
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (message) {
          message.textContent = '视频暂时无法播放';
        }
      }

      function startVideo() {
        if (button) {
          button.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            if (button) {
              button.classList.remove('is-hidden');
            }
            if (message) {
              message.textContent = '请再次点击播放';
            }
          });
        }
      }

      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          startVideo();
        });
      }

      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
        if (message) {
          message.textContent = '';
        }
      });

      video.addEventListener('pause', function () {
        if (button && video.currentTime === 0) {
          button.classList.remove('is-hidden');
        }
      });
    });
  }

  initPlayers();

  var searchRoot = document.querySelector('[data-search-root]');
  if (searchRoot && Array.isArray(window.MOVIES_DATA)) {
    var form = searchRoot.querySelector('[data-search-form]');
    var resultBox = searchRoot.querySelector('[data-search-results]');

    function cardTemplate(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span class="tag">' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<article class="movie-card">' +
        '<a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">' +
        '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="poster-shade"></span>' +
        '<span class="play-chip">立即观看</span>' +
        '</a>' +
        '<div class="card-body">' +
        '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.year) + '</span></div>' +
        '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
        '<p>' + escapeHtml(movie.description) + '</p>' +
        '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
        '</article>';
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char];
      });
    }

    function renderResults() {
      var data = new FormData(form);
      var query = String(data.get('q') || '').trim().toLowerCase();
      var category = String(data.get('category') || '');
      var year = String(data.get('year') || '');
      var region = String(data.get('region') || '');
      var filtered = window.MOVIES_DATA.filter(function (movie) {
        var hay = [movie.title, movie.description, movie.genre, movie.region, movie.type, movie.year, movie.category].concat(movie.tags || []).join(' ').toLowerCase();
        return (!query || hay.indexOf(query) !== -1) &&
          (!category || movie.category === category) &&
          (!year || movie.year === year) &&
          (!region || movie.region === region);
      }).slice(0, 96);

      if (!filtered.length) {
        resultBox.innerHTML = '<div class="search-empty">没有找到相关影片</div>';
        return;
      }
      resultBox.innerHTML = filtered.map(cardTemplate).join('');
    }

    form.addEventListener('input', renderResults);
    form.addEventListener('change', renderResults);
    renderResults();
  }
})();
