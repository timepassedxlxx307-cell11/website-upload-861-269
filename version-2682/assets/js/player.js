(function () {
    var video = document.getElementById('movie-player');
    var overlay = document.getElementById('play-overlay');
    var hls = null;
    var loaded = false;

    if (!video) {
        return;
    }

    function attach() {
        var stream = video.getAttribute('data-stream');

        if (loaded || !stream) {
            return;
        }

        loaded = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            return;
        }

        video.src = stream;
    }

    function hideOverlay() {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    }

    function showOverlay() {
        if (overlay && video.paused && video.currentTime < 0.5) {
            overlay.classList.remove('is-hidden');
        }
    }

    function startPlayback() {
        attach();
        hideOverlay();
        video.controls = true;

        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                showOverlay();
            });
        }
    }

    if (overlay) {
        overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        }
    });

    video.addEventListener('play', hideOverlay);
    video.addEventListener('pause', showOverlay);

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
})();
