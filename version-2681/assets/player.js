(function () {
    const configNode = document.getElementById('stream-config');
    const video = document.querySelector('[data-player-video]');
    const cover = document.querySelector('[data-player-cover]');
    const button = document.querySelector('[data-player-button]');

    if (!configNode || !video) {
        return;
    }

    let config = {};
    try {
        config = JSON.parse(configNode.textContent || '{}');
    } catch (error) {
        config = {};
    }

    const source = config.src;
    let started = false;

    function begin() {
        if (!source || started) {
            return;
        }
        started = true;
        if (cover) {
            cover.classList.add('is-hidden');
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.play().catch(function () {});
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            return;
        }
        video.src = source;
        video.play().catch(function () {});
    }

    if (button) {
        button.addEventListener('click', begin);
    }
    if (cover) {
        cover.addEventListener('click', begin);
    }
    video.addEventListener('click', function () {
        if (!started) {
            begin();
        }
    });
})();
