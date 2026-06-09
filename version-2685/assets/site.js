(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function start() {
            stop();
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        start();
    }

    function setupFilters() {
        var input = document.querySelector("[data-filter-input]");
        var year = document.querySelector("[data-filter-year]");
        var type = document.querySelector("[data-filter-type]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        if (!cards.length || (!input && !year && !type)) {
            return;
        }
        function value(node) {
            return node ? node.value.trim().toLowerCase() : "";
        }
        function apply() {
            var term = value(input);
            var yearValue = value(year);
            var typeValue = value(type);
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-genre") || "",
                    card.getAttribute("data-region") || "",
                    card.getAttribute("data-type") || "",
                    card.getAttribute("data-year") || ""
                ].join(" ").toLowerCase();
                var ok = true;
                if (term && haystack.indexOf(term) === -1) {
                    ok = false;
                }
                if (yearValue && (card.getAttribute("data-year") || "").toLowerCase() !== yearValue) {
                    ok = false;
                }
                if (typeValue && (card.getAttribute("data-type") || "").toLowerCase() !== typeValue) {
                    ok = false;
                }
                card.classList.toggle("is-hidden", !ok);
            });
        }
        [input, year, type].forEach(function (node) {
            if (node) {
                node.addEventListener("input", apply);
                node.addEventListener("change", apply);
            }
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
}());

function initMoviePlayer(settings) {
    var video = document.querySelector("[data-video]");
    var button = document.querySelector("[data-play-button]");
    var frame = document.querySelector("[data-player]");
    var url = settings && settings.url ? settings.url : "";
    var loaded = false;
    var hls = null;
    if (!video || !url) {
        return;
    }
    function load() {
        if (loaded) {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
        } else if (window.Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90
            });
            hls.loadSource(url);
            hls.attachMedia(video);
        } else {
            video.src = url;
        }
        loaded = true;
    }
    function reveal() {
        if (button) {
            button.classList.add("is-hidden");
        }
        if (frame) {
            frame.classList.add("is-playing");
        }
    }
    function conceal() {
        if (button) {
            button.classList.remove("is-hidden");
        }
        if (frame) {
            frame.classList.remove("is-playing");
        }
    }
    function play() {
        load();
        reveal();
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                conceal();
            });
        }
    }
    if (button) {
        button.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });
    video.addEventListener("play", reveal);
    video.addEventListener("ended", conceal);
    window.addEventListener("pagehide", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
