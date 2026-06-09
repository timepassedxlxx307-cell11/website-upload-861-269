(function () {
  const mobileButton = document.querySelector('[data-mobile-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero-slider]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const previous = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    const show = function (nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    const schedule = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    };

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        schedule();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        schedule();
      });
    });

    show(0);
    schedule();
  }

  document.querySelectorAll('[data-scroll-target]').forEach(function (button) {
    button.addEventListener('click', function () {
      const target = document.querySelector(button.getAttribute('data-scroll-target'));
      const direction = button.getAttribute('data-scroll-direction') === 'left' ? -1 : 1;

      if (target) {
        target.scrollBy({ left: direction * 640, behavior: 'smooth' });
      }
    });
  });

  document.querySelectorAll('[data-local-filter]').forEach(function (panel) {
    const input = panel.querySelector('[data-filter-keyword]');
    const region = panel.querySelector('[data-filter-region]');
    const year = panel.querySelector('[data-filter-year]');
    const type = panel.querySelector('[data-filter-type]');
    const cards = Array.from(document.querySelectorAll('[data-title]'));
    const empty = document.querySelector('[data-empty-state]');

    const apply = function () {
      const keyword = input ? input.value.trim().toLowerCase() : '';
      const regionValue = region ? region.value : '';
      const yearValue = year ? year.value : '';
      const typeValue = type ? type.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const text = [
          card.dataset.title || '',
          card.dataset.region || '',
          card.dataset.year || '',
          card.dataset.genre || ''
        ].join(' ').toLowerCase();
        const passKeyword = !keyword || text.indexOf(keyword) !== -1;
        const passRegion = !regionValue || (card.dataset.region || '') === regionValue;
        const passYear = !yearValue || (card.dataset.year || '') === yearValue;
        const passType = !typeValue || text.indexOf(typeValue.toLowerCase()) !== -1;
        const shouldShow = passKeyword && passRegion && passYear && passType;

        card.style.display = shouldShow ? '' : 'none';

        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };

    [input, region, year, type].forEach(function (field) {
      if (field) {
        field.addEventListener('input', apply);
        field.addEventListener('change', apply);
      }
    });
  });
})();

function startMoviePlayer(videoId, buttonId, overlayId, streamUrl) {
  const video = document.getElementById(videoId);
  const button = document.getElementById(buttonId);
  const overlay = document.getElementById(overlayId);
  let prepared = false;

  if (!video || !button || !overlay || !streamUrl) {
    return;
  }

  const prepare = function () {
    if (prepared) {
      return;
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({ enableWorker: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  };

  const play = function () {
    prepare();
    overlay.classList.add('is-hidden');
    const promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        overlay.classList.remove('is-hidden');
      });
    }
  };

  button.addEventListener('click', play);
  overlay.addEventListener('click', function (event) {
    if (event.target === overlay) {
      play();
    }
  });
  video.addEventListener('play', function () {
    overlay.classList.add('is-hidden');
  });
  video.addEventListener('pause', function () {
    if (video.currentTime === 0 || video.ended) {
      overlay.classList.remove('is-hidden');
    }
  });
}
