(function () {
    const navToggle = document.querySelector('[data-nav-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');

    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    const heroSlides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const heroDots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    let activeSlide = 0;

    function showSlide(index) {
        if (!heroSlides.length) {
            return;
        }
        activeSlide = (index + heroSlides.length) % heroSlides.length;
        heroSlides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeSlide);
        });
        heroDots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeSlide);
        });
    }

    if (heroSlides.length) {
        heroDots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
            });
        });
        showSlide(0);
        setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    const forms = Array.from(document.querySelectorAll('[data-site-search]'));
    forms.forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const input = form.querySelector('input[type="search"], input[type="text"]');
            const query = input ? input.value.trim() : '';
            if (query) {
                window.location.href = './search.html?q=' + encodeURIComponent(query);
            }
        });
    });

    function filterCards(input, cards) {
        const value = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
            const haystack = (card.getAttribute('data-search') || '').toLowerCase();
            card.hidden = value && haystack.indexOf(value) === -1;
        });
    }

    const filterInput = document.querySelector('[data-filter-input]');
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));

    if (filterInput && cards.length) {
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q');
        if (query) {
            filterInput.value = query;
        }
        filterCards(filterInput, cards);
        filterInput.addEventListener('input', function () {
            filterCards(filterInput, cards);
        });
    }
})();
