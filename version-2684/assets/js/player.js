(function () {
  function initPlayer() {
    var config = window.MoviePlayerConfig || {};
    var video = document.getElementById(config.videoId || 'movie-player');
    var cover = document.getElementById('player-cover');
    var source = config.source;
    var hls = null;
    var attached = false;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function hideCover() {
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');
    }

    function startPlay() {
      attachSource();
      hideCover();
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    attachSource();

    if (cover) {
      cover.addEventListener('click', startPlay);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlay();
      }
    });

    video.addEventListener('play', hideCover);

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlayer);
  } else {
    initPlayer();
  }
})();
