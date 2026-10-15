/* Optional, visible YouTube playback. No media is requested before a click. */
(() => {
  'use strict';
  const dock = document.querySelector('.music-dock');
  if (!dock) return;
  const toggle = dock.querySelector('.music-toggle');
  const panel = dock.querySelector('.music-panel');
  const status = dock.querySelector('.music-status');
  const close = dock.querySelector('.music-close');
  let player, ready = false, loading = false, wanted = false, failed = false, timer;

  function setOpen(open) {
    panel.hidden = !open;
    toggle.hidden = open;
    toggle.setAttribute('aria-expanded', String(open));
  }

  function stop(restoreFocus = false) {
    wanted = false;
    player?.pauseVideo?.();
    setOpen(false);
    if (restoreFocus) toggle.focus();
  }

  function unavailable() {
    failed = true;
    clearTimeout(timer);
    status.textContent = 'Music is unavailable here. Use the YouTube link to listen.';
  }

  function createPlayer() {
    if (player) return;
    player = new window.YT.Player('owney-music-player', {
      width: 200, height: 200, videoId: 'CCSdRKSQXnE',
      playerVars: {
        playsinline: 1, controls: 1, rel: 0, loop: 1,
        playlist: 'CCSdRKSQXnE', origin: location.origin
      },
      events: {
        onReady(event) {
          ready = true;
          failed = false;
          clearTimeout(timer);
          event.target.setVolume(12);
          event.target.getIframe().title = 'Broken Vow — YouTube music player';
          status.textContent = 'Broken Vow on YouTube. Initial volume 12 percent.';
          if (wanted && !panel.hidden && !document.hidden) event.target.playVideo();
          else event.target.pauseVideo();
        },
        onAutoplayBlocked() {
          // Keep native controls visible so another click can start playback.
          status.textContent = 'Press Play in the video to start the music.';
        },
        onStateChange(event) {
          if (event.data === 1 && (!wanted || panel.hidden || document.hidden)) {
            player.pauseVideo();
          }
        },
        onError: unavailable
      }
    });
  }

  toggle.addEventListener('click', () => {
    wanted = true;
    setOpen(true);
    close.focus();
    if (failed) { unavailable(); return; }
    if (ready) { player.playVideo(); return; }
    if (loading) return;
    loading = true;
    status.textContent = 'Opening music…';
    timer = setTimeout(() => { if (!ready) unavailable(); }, 15000);
    if (window.YT?.Player) { createPlayer(); return; }
    window.onYouTubeIframeAPIReady = createPlayer;
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.onerror = unavailable;
    document.head.append(script);
  });

  close.addEventListener('click', () => stop(true));
  dock.addEventListener('keydown', event => {
    if (event.key === 'Escape') stop(true);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
  });
})();
