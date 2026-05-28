(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function runFilter(scope) {
    var input = scope.querySelector('[data-filter-input]');
    var list = scope.querySelector('[data-filter-list]');

    if (!input || !list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    function apply() {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var content = [card.dataset.title, card.dataset.meta, card.dataset.year, card.dataset.category].join(' ').toLowerCase();
        card.hidden = value && content.indexOf(value) === -1;
      });
    }

    input.addEventListener('input', apply);

    if (input.hasAttribute('data-global-search')) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q') || '';
      if (q) {
        input.value = q;
        apply();
      }
    }
  }

  runFilter(document);

  var yearButtons = Array.prototype.slice.call(document.querySelectorAll('[data-year-filter]'));
  var yearList = document.querySelector('[data-year-list]');

  if (yearButtons.length && yearList) {
    var yearCards = Array.prototype.slice.call(yearList.querySelectorAll('.movie-card'));

    yearButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var year = button.getAttribute('data-year-filter');
        yearButtons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        yearCards.forEach(function (card) {
          card.hidden = year !== 'all' && card.dataset.year !== year;
        });
      });
    });
  }
})();

function setupMoviePlayer(srcUrl) {
  var video = document.getElementById('moviePlayer');
  var cover = document.querySelector('.player-cover');
  var hlsInstance = null;
  var loaded = false;

  if (!video || !srcUrl) {
    return;
  }

  function attach() {
    if (loaded) {
      return;
    }
    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = srcUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hlsInstance.loadSource(srcUrl);
      hlsInstance.attachMedia(video);
    }
  }

  function start() {
    attach();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
