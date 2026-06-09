(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-nav-menu]');

    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
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
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide') || 0));
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    var searchInput = document.querySelector('[data-search-input]');
    var searchButton = document.querySelector('[data-search-button]');
    var list = document.querySelector('.searchable-list');
    var filterGroup = document.querySelector('[data-filter-group]');
    var emptyState = document.querySelector('[data-empty-state]');
    var activeFilter = 'all';

    function getQueryFromUrl() {
        var params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applySearch() {
        if (!list) {
            return;
        }

        var query = normalize(searchInput ? searchInput.value : '');
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        var visible = 0;

        cards.forEach(function (item) {
            var haystack = normalize(item.getAttribute('data-search'));
            var type = normalize(item.getAttribute('data-type'));
            var matchesText = !query || haystack.indexOf(query) !== -1;
            var matchesType = activeFilter === 'all' || type.indexOf(normalize(activeFilter)) !== -1 || haystack.indexOf(normalize(activeFilter)) !== -1;
            var shouldShow = matchesText && matchesType;

            item.style.display = shouldShow ? '' : 'none';

            if (shouldShow) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('is-visible', visible === 0);
        }
    }

    if (searchInput) {
        searchInput.value = getQueryFromUrl();
        searchInput.addEventListener('input', applySearch);
    }

    if (searchButton) {
        searchButton.addEventListener('click', applySearch);
    }

    if (filterGroup) {
        filterGroup.addEventListener('click', function (event) {
            var button = event.target.closest('[data-filter-value]');

            if (!button) {
                return;
            }

            activeFilter = button.getAttribute('data-filter-value') || 'all';

            filterGroup.querySelectorAll('[data-filter-value]').forEach(function (item) {
                item.classList.toggle('active', item === button);
            });

            applySearch();
        });
    }

    applySearch();
})();
